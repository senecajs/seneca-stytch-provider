"use strict";
/* Copyright © 2022 Seneca Project Contributors, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const Pkg = require('../package.json');
const Stytch = require('stytch');
function StytchProvider(_options) {
    const seneca = this;
    const entityBuilder = this.export('provider/entityBuilder');
    seneca
        .message('sys:provider,provider:stytch,get:info', get_info);
    async function get_info(_msg) {
        return {
            ok: true,
            name: 'stytch',
            version: Pkg.version,
            sdk: {
                name: 'stytch',
                version: Pkg.dependencies['stytch'],
            }
        };
    }
    entityBuilder(this, {
        provider: {
            name: 'stytch'
        },
        entity: {
            user: {
                cmd: {
                    list: {
                        action: async function (entize, msg) {
                            let q = msg.q || {};
                            // NOTE: throws on error
                            let res = await this.shared.sdk.users.search(q);
                            let list = res.results.map((data) => entize(data, {
                                field: {
                                    id: { src: 'user_id' }
                                }
                            }));
                            return list;
                        }
                    },
                    /*
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
                    */
                }
            }
        }
    });
    seneca.prepare(async function () {
        // let project_id =
        //   await this.post('sys:provider,get:key,provider:stytch,key:project_id')
        // let secret =
        //   await this.post('sys:provider,get:key,provider:stytch,key:secret')
        let res = await this.post('sys:provider,get:keymap,provider:stytch');
        if (!res.ok) {
            // TODO: review
            this.fail('stytch-missing-keymap', res);
        }
        let project_id = res.keymap.project_id.value;
        let secret = res.keymap.secret.value;
        this.shared.sdk = new Stytch.Client({
            project_id,
            secret,
            env: Stytch.envs.test
        });
    });
    return {
        exports: {
            sdk: () => this.shared.sdk
        }
    };
}
// Default options.
const defaults = {
    // TODO: Enable debug logging
    debug: false
};
Object.assign(StytchProvider, { defaults });
exports.default = StytchProvider;
if ('undefined' !== typeof (module)) {
    module.exports = StytchProvider;
}
//# sourceMappingURL=stytch-provider.js.map