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

    let save = await seneca.entity('provider/stytch/user').save$({ user: { email: 'alex0@example.com' } })
	
    console.log('save: ', await save.save$({user: { email: 'alex01@example.com' }}) )

    const list = await seneca.entity("provider/stytch/user").list$()
    console.log('list: ', list )
    console.log('list: ', await list[0].save$({user: {email: 'alex02@example.com'}}) )

    console.log('load: ', (await seneca.entity('provider/stytch/user').load$(list[0].id)) )

    console.log('update: ', (await seneca.entity('provider/stytch/user').save$({id: list[0].id, user: { name: { first_name: 'Alex' } } }) ) )

   // expect(list.length > 0).toBeTruthy()
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

    let res =
      await seneca.post('sys:provider,get:keymap,provider:stytch')

console.log(res)

  return seneca.ready()
}

