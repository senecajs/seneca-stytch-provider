/* Copyright © 2022 Seneca Project Contributors, MIT License. */

import * as Fs from 'fs'
import * as Http from 'http'


const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')

import StytchProvider from '../src/stytch-provider'
import StytchProviderDoc from '../src/StytchProvider-doc'

const BasicMessages = require('./basic.messages.js')


// Live tests call the Stytch test environment. They need a Stytch project:
// test/local-config.js (see local-config-template.js) with the keys in
// test/local-env.js, or the environment variables STYTCH_PROJECTID and
// STYTCH_SECRET. Without them the same tests run against a local mock of
// the Stytch API, and the env plugin gets dummy values.
const LIVE = Fs.existsSync(__dirname + '/local-config.js') ||
  (!!process.env.STYTCH_PROJECTID && !!process.env.STYTCH_SECRET)

if (!LIVE) {
  process.env.STYTCH_PROJECTID ??=
    'project-test-00000000-0000-0000-0000-000000000000'
  process.env.STYTCH_SECRET ??= 'secret-test-mock'
}


let mock: MockStytchApi | null = null

beforeAll(async () => {
  if (!LIVE) {
    mock = await makeMockStytchApi()
  }
})

afterAll(async () => {
  if (mock) {
    await mock.close()
  }
})


const stytchShared: any = {}

describe('stytch-provider', () => {

  test('happy', async () => {
    expect(StytchProvider).toBeDefined()
    expect(StytchProviderDoc).toBeDefined()

    const seneca = await makeSeneca()
    let sdk = seneca.export('StytchProvider/sdk')()
    expect(sdk).toBeDefined()

    expect(await seneca.post('sys:provider,provider:stytch,get:info'))
      .toMatchObject({
        ok: true,
        name: 'stytch',
      })

    await seneca.close()
  })


  test('messages', async () => {
    const seneca = await makeSeneca()
    await (SenecaMsgTest(seneca, BasicMessages)())
    await seneca.close()
  })


  test('user-save-new', async () => {
    const seneca = await makeSeneca()

    let user = await seneca.entity('provider/stytch/user')
    // user.user = { email:  'alice@example.com' }
    let save = await user.save$({ user: { email: 'alice@example.com' } })
    expect(save.id).toBeDefined()
    stytchShared.user_id = save.id

    if (mock) {
      expect(mock.calls[mock.calls.length - 1]).toEqual({
        method: 'POST',
        url: '/v1/users',
        auth: 'Basic ' + Buffer.from(
          process.env.STYTCH_PROJECTID + ':' + process.env.STYTCH_SECRET
        ).toString('base64'),
        body: { email: 'alice@example.com' },
      })
    }

    await seneca.close()
  })


  test('user-save-update', async () => {
    const seneca = await makeSeneca()
    const id = stytchShared.user_id
    let name = "Alice"

    let user_loaded = await seneca.entity('provider/stytch/user').load$(id)
    expect(user_loaded.id).toEqual(id)

    // user.user = { name: { first_name: name } }
    let save = await user_loaded.data$({ user: { name: { first_name: name } } }).save$()

    expect(save.id).toBeDefined()
    expect(save.user.name.first_name).toEqual(name)

    await seneca.close()
  })


  test('session-list', async () => {
    const seneca = await makeSeneca()
    const id = stytchShared.user_id

    const list =
      await seneca.entity('provider/stytch/session').list$({ user_id: id, })
    expect(Array.isArray(list)).toBeTruthy()

    if (mock) {
      expect(list.length).toEqual(1)
      expect(list[0].user_id).toEqual(id)
    }

    await seneca.close()
  })


  test('user-list', async () => {
    const seneca = await makeSeneca()

    const list = await seneca.entity("provider/stytch/user").list$({ limit: 10 })
    expect(list.length > 0).toBeTruthy()

    await seneca.close()
  })


  test('user-remove', async () => {
    const seneca = await makeSeneca()
    const id = stytchShared.user_id

    let remove = await seneca.entity('provider/stytch/user').remove$(id)

    expect(remove.status_code >= 200 && remove.status_code < 300).toBeTruthy()
    expect(remove.id).toBeDefined()

    if (mock) {
      expect(mock.users.has(id)).toBeFalsy()
    }

    await seneca.close()
  })

})


async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('@seneca/entity')
    .use('@seneca/env', {
      // debug: true,
      file: [__dirname + '/local-env.js;?'],
      var: {
        $STYTCH_PROJECTID: String,
        $STYTCH_SECRET: String,
      }
    })
    .use('@seneca/provider', {
      provider: {
        stytch: {
          keys: {
            project_id: { value: '$STYTCH_PROJECTID' },
            secret: { value: '$STYTCH_SECRET' },
          }
        }
      }
    })
    .use(StytchProvider)

  await seneca.ready()

  if (mock) {
    useMock(seneca.export('StytchProvider/sdk')(), mock.url)
  }

  return seneca
}


// The plugin option env selects only the Stytch test or live API, so the
// test points the SDK client at the mock itself. The stytch 5 client keeps
// its base URL in one fetchConfig object that every API group shares. If
// that ever changes, fail here rather than send a request to Stytch.
function useMock(sdk: any, url: string) {
  const fetchConfig = sdk.fetchConfig
  if (null == fetchConfig ||
    fetchConfig !== sdk.users?.fetchConfig ||
    fetchConfig !== sdk.sessions?.fetchConfig) {
    throw new Error('stytch SDK: cannot point the client at the mock API')
  }
  fetchConfig.baseURL = url
}


type MockCall = {
  method?: string
  url?: string
  auth?: string
  body: any
}

type MockStytchApi = {
  url: string
  calls: MockCall[]
  users: Map<string, any>
  close: () => Promise<void>
}


// A local stand-in for the Stytch API (v1) calls that the plugin makes:
// users create, get, update, search and delete, and sessions get. The
// responses have the shape of the Stytch API reference, with only the
// fields that matter here.
async function makeMockStytchApi(): Promise<MockStytchApi> {
  const calls: MockCall[] = []
  const users: Map<string, any> = new Map()
  let serial = 0

  const nextId = (kind: string) =>
    kind + '-test-00000000-0000-4000-8000-' + String(++serial).padStart(12, '0')

  const server = Http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => body += chunk)
    req.on('end', () => {
      const data = '' === body ? undefined : JSON.parse(body)
      calls.push({
        method: req.method,
        url: req.url,
        auth: req.headers.authorization,
        body: data,
      })

      const url = new URL(req.url || '/', 'http://127.0.0.1')
      const path = url.pathname
      const request_id = nextId('request')
      const userPath = path.match(/^\/v1\/users\/([^/]+)$/)
      const user = userPath ? users.get(userPath[1]) : null

      let status = 200
      let out: any

      if ('POST' === req.method && '/v1/users' === path) {
        const user_id = nextId('user')
        const email_id = nextId('email')
        const created = {
          user_id,
          created_at: new Date().toISOString(),
          status: 'pending',
          name: { first_name: '', middle_name: '', last_name: '' },
          emails: data?.email ?
            [{ email_id, email: data.email, verified: false }] : [],
          phone_numbers: [],
          providers: [],
          webauthn_registrations: [],
          totps: [],
          crypto_wallets: [],
        }
        users.set(user_id, created)
        out = {
          status_code: 200, request_id, user_id, email_id,
          phone_id: '', status: 'pending', user: created,
        }
      }
      else if ('POST' === req.method && '/v1/users/search' === path) {
        const results = [...users.values()].slice(0, data?.limit || 100)
        out = {
          status_code: 200, request_id, results,
          results_metadata: { total: users.size, next_cursor: null },
        }
      }
      else if (userPath && null == user) {
        status = 404
        out = {
          status_code: 404, request_id,
          error_type: 'user_not_found',
          error_message: 'User could not be found.',
          error_url: 'https://stytch.com/docs/api/errors/404',
        }
      }
      else if ('GET' === req.method && userPath) {
        out = { status_code: 200, request_id, ...user }
      }
      else if ('PUT' === req.method && userPath) {
        if (data?.name) {
          user.name = { ...user.name, ...data.name }
        }
        out = {
          status_code: 200, request_id, user_id: user.user_id,
          emails: user.emails, phone_numbers: user.phone_numbers,
          crypto_wallets: user.crypto_wallets, user,
        }
      }
      else if ('DELETE' === req.method && userPath) {
        users.delete(user.user_id)
        out = { status_code: 200, request_id, user_id: user.user_id }
      }
      else if ('GET' === req.method && '/v1/sessions' === path) {
        const user_id = url.searchParams.get('user_id')
        const now = Date.now()
        out = {
          status_code: 200, request_id,
          sessions: users.has(user_id || '') ? [{
            session_id: nextId('session'),
            user_id,
            started_at: new Date(now).toISOString(),
            last_accessed_at: new Date(now).toISOString(),
            expires_at: new Date(now + 3600000).toISOString(),
            attributes: { ip_address: '', user_agent: '' },
            authentication_factors: [],
          }] : [],
        }
      }
      else {
        status = 404
        out = {
          status_code: 404, request_id,
          error_type: 'route_not_found',
          error_message: 'Unknown route: ' + req.method + ' ' + path,
          error_url: 'https://stytch.com/docs/api/errors/404',
        }
      }

      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(out))
    })
  })

  await new Promise<void>((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve()))

  const port = (server.address() as { port: number }).port

  return {
    url: `http://127.0.0.1:${port}/v1/`,
    calls,
    users,
    close: () => new Promise<void>((resolve) => {
      server.closeAllConnections()
      server.close(() => resolve())
    })
  }
}
