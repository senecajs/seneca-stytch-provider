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


  test('user-basic', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()

    const list = await seneca.entity("provider/stytch/user").list$()
    expect(list.length > 0).toBeTruthy()
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
        $STYTCH_PROJECT_ID: String,
        $STYTCH_SECRET: String,
      }
    })
    .use('provider', {
      provider: {
        stytch: {
          keys: {
            project_id: { value: '$STYTCH_PROJECT_ID' },
            secret: { value: '$STYTCH_SECRET' },
          }
        }
      }
    })
    .use(StytchProvider)

  return seneca.ready()
}

