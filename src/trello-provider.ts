/* Copyright © 2022 Seneca Project Contributors, MIT License. */

const Pkg = require('../package.json')

const Trello = require('trello')


type TrelloProviderOptions = {}

function TrelloProvider(this: any, _options: TrelloProviderOptions) {
  const seneca: any = this

  const entityBuilder = this.export('provider/entityBuilder')


  seneca
    .message('sys:provider,provider:trello,get:info', get_info)


  async function get_info(this: any, _msg: any) {
    return {
      ok: true,
      name: 'trello',
      version: Pkg.version,
      sdk: {
        name: 'trello',
        version: Pkg.dependencies['trello'],
      }
    }
  }


  entityBuilder(this, {
    provider: {
      name: 'trello'
    },
    entity: {
      board: {
        cmd: {
          list: {
            action: async function(this: any, entize: any, msg: any) {
              let q = msg.q || {}
              let member = q.member || 'me'
              let res = await this.shared.sdk.getBoards(member)
              let list = res.map((data: any) => entize(data))
              return list
            }
          },

          load: {
            action: async function(this: any, entize: any, msg: any) {
              let q = msg.q || {}
              let id = q.id

              try {
                let res = await this.shared.sdk.getBoard(id)
                return entize(res)
              }
              catch (e: any) {
                if (e.message.includes('invalid id')) {
                  return null
                }
                else {
                  throw e
                }
              }
            }
          },

          save: {
            action: async function(this: any, entize: any, msg: any) {
              let ent = msg.ent
              try {
                let res
                if (ent.id) {
                  // TODO: util to handle more fields
                  res = await this.shared.sdk.updateBoard(ent.id, {
                    desc: ent.desc
                  })
                }
                else {
                  // TODO: util to handle more fields
                  let fields = {
                    name: ent.name,
                    desc: ent.desc,
                  }
                  res = await this.shared.sdk.addBoard(fields)
                }

                return entize(res)
              }
              catch (e: any) {
                if (e.message.includes('invalid id')) {
                  return null
                }
                else {
                  throw e
                }
              }
            }
          }

        }
      }
    }
  })

  seneca.prepare(async function(this: any) {
    // TODO: define sys:provider,get:keys to get all the keys?

    let apikey =
      await this.post('sys:provider,get:key,provider:trello,key:apikey')
    let usertoken =
      await this.post('sys:provider,get:key,provider:trello,key:usertoken')

    this.shared.sdk = new Trello(apikey.value, usertoken.value)
  })


  return {
    exports: {
      sdk: () => this.shared.sdk
    }
  }
}


// Default options.
const defaults: TrelloProviderOptions = {

  // TODO: Enable debug logging
  debug: false
}


Object.assign(TrelloProvider, { defaults })

export default TrelloProvider

if ('undefined' !== typeof (module)) {
  module.exports = TrelloProvider
}
