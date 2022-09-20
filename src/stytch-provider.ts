/* Copyright © 2022 Seneca Project Contributors, MIT License. */

const Pkg = require('../package.json')

const Stytch = require('stytch')


type StytchProviderOptions = {
  env: string,
  debug: boolean,
}

function StytchProvider(this: any, options: StytchProviderOptions) {
  const seneca: any = this

  const entityBuilder = this.export('provider/entityBuilder')


  seneca
    .message('sys:provider,provider:stytch,get:info', get_info)


  async function get_info(this: any, _msg: any) {
    return {
      ok: true,
      name: 'stytch',
      version: Pkg.version,
      sdk: {
        name: 'stytch',
        version: Pkg.dependencies['stytch'],
      }
    }
  }


  entityBuilder(this, {
    provider: {
      name: 'stytch'
    },
    entity: {
      user: {
        cmd: {
          list: {
            action: async function(this: any, entize: any, msg: any) {
              let q = msg.q || {}

              // NOTE: throws on error
              let res = await this.shared.sdk.users.search(q)
              let list = res.results.map((data: any) => entize(data, {
                field: {
                  id: { src: 'user_id' }
                }
              }))
              return list
            }
          },
        }
      }
    }
  })

  seneca.prepare(async function(this: any) {
    let seneca = this

    let res =
      await seneca.post('sys:provider,get:keymap,provider:stytch')

    if (!res.ok) {
      this.fail('stytch-missing-keymap', res)
    }

    let project_id = res.keymap.project_id.value
    let secret = res.keymap.secret.value

    seneca.shared.sdk = new Stytch.Client({
      project_id,
      secret,
      env: 'live' === options.env ? Stytch.envs.live : Stytch.envs.test
    })
  })


  return {
    exports: {
      sdk: () => this.shared.sdk
    }
  }
}


// Default options.
const defaults: StytchProviderOptions = {

  env: 'test',

  // TODO: Enable debug logging
  debug: false
}


Object.assign(StytchProvider, { defaults })

export default StytchProvider

if ('undefined' !== typeof (module)) {
  module.exports = StytchProvider
}
