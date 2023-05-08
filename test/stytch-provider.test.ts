/* Copyright © 2022 Seneca Project Contributors, MIT License. */

import * as Fs from 'fs'


const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')

import StytchProvider from '../src/stytch-provider'
import StytchProviderDoc from '../src/StytchProvider-doc'

const BasicMessages = require('./basic.messages.js')


// Only run some tests locally (not on Github Actions).
let Config = undefined
if (Fs.existsSync(__dirname + '/local-config.js')) {
  Config = require('./local-config')
}

global.stytchShared = ({} as any)

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
  })


  test('messages', async () => {
    const seneca = await makeSeneca()
    await (SenecaMsgTest(seneca, BasicMessages)())
  })

  test('user-save-new', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()

    let user = await seneca.entity('provider/stytch/user')
    // user.user = { email:  'alice@example.com' }
    let save = await user.save$({ user: { email: 'alice@example.com' } })
    expect(save.id).toBeDefined()
    stytchShared.user_id = save.id

  })

  test('user-save-update', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()
    const id = stytchShared.user_id
    let name = "Alice"

    let user = await seneca.entity('provider/stytch/user').load$(id)
    // user.user = { name: { first_name: name } }
    let save = await user.data$({ user: { name: { first_name: name} } }).save$()
    
    expect(save.id).toBeDefined()
    expect(save.user.name.first_name).toEqual(name)

  })

  test('session-list', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()
    const id = stytchShared.user_id

    console.log( await seneca.entity('provider/stytch/session').list$({ user_id: id, }) )
  })


  test('user-list', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()

    const list = await seneca.entity("provider/stytch/user").list$({limit: 10})
    expect(list.length > 0).toBeTruthy()
  })

  test('user-remove', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()
    const id = stytchShared.user_id

    let remove = await seneca.entity('provider/stytch/user').remove$(id)

    expect(remove.status_code >= 200 && remove.status_code < 300).toBeTruthy()
    expect(remove.id).toBeDefined()

  })

})


async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('promisify')
    .use('entity')
    .use('env', {
      // debug: true,
      file: [__dirname + '/local-env.js;?'],
      var: {
        $STYTCH_PROJECTID: String,
        $STYTCH_SECRET: String,
      }
    })
    .use('provider', {
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

  return seneca.ready()
}

