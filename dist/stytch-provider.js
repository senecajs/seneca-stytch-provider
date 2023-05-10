"use strict";
/* Copyright © 2022 Seneca Project Contributors, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const Https = require('https');
const Stytch = require('stytch');
const Pkg = require('../package.json');
function check_status(seneca, res) {
    res['status_code'] >= 300 ? seneca.fail('stytch_response', JSON.stringify(res)) : null;
}
function StytchProvider(options) {
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
                            let res = null;
                            try {
                                res = await this.shared.sdk.users.search(q);
                            }
                            catch (err_res) {
                                res = err_res;
                            }
                            check_status(seneca, res);
                            let list = res.results.map((data) => entize(data, {
                                field: {
                                    id: { src: 'user_id' }
                                }
                            }));
                            return list;
                        }
                    },
                    load: {
                        action: async function (entize, msg) {
                            var _a;
                            let id = (_a = msg === null || msg === void 0 ? void 0 : msg.q) === null || _a === void 0 ? void 0 : _a.id;
                            let res = null;
                            id == null ? this.fail('invalid_id') : null;
                            try {
                                res = await this.shared.sdk.users.get(id);
                            }
                            catch (err_res) {
                                res = err_res;
                            }
                            check_status(seneca, res);
                            // TODO: something like: (entize({'res': res} as ProviderRes)) for more structure?
                            return entize(res, {
                                field: {
                                    id: { src: 'user_id' }
                                }
                            });
                        }
                    },
                    save: {
                        action: async function (entize, msg) {
                            let ent = msg.ent;
                            let id = ent.id;
                            let user = ent['user'] || {};
                            let params = [];
                            let api_call;
                            let res = null;
                            api_call = (null == id) ?
                                (params = [user], 'create') : (params = [id, user], 'update');
                            // invalid body parameters
                            if (0 === Object.keys(user).length) {
                                this.fail('empty body parameters', 'user field');
                            }
                            try {
                                res = await this.shared.sdk.users[api_call](...params);
                            }
                            catch (err_res) {
                                res = err_res;
                            }
                            check_status(seneca, res);
                            return entize(res, {
                                field: {
                                    id: { src: 'user_id' }
                                }
                            });
                        }
                    },
                    remove: {
                        action: async function (entize, msg) {
                            var _a;
                            let id = (_a = msg === null || msg === void 0 ? void 0 : msg.q) === null || _a === void 0 ? void 0 : _a.id;
                            let res = null;
                            id == null ? this.fail('invalid_id') : null;
                            try {
                                res = await this.shared.sdk.users.delete(id);
                            }
                            catch (err_res) {
                                res = err_res;
                            }
                            check_status(seneca, res);
                            return entize(res, {
                                field: {
                                    id: { src: 'user_id' }
                                }
                            });
                        }
                    },
                }
            },
            session: {
                cmd: {
                    list: {
                        action: async function (entize, msg) {
                            let q = msg.q || {};
                            let res = null;
                            try {
                                res = await this.shared.sdk.sessions.get(q);
                            }
                            catch (err_res) {
                                res = err_res;
                            }
                            check_status(seneca, res);
                            // console.log(res)
                            return res.sessions.map((data) => entize(data));
                        }
                    },
                }
            }
        }
    });
    seneca.prepare(async function () {
        let seneca = this;
        let res = await seneca.post('sys:provider,get:keymap,provider:stytch');
        if (!res.ok) {
            this.fail('stytch-missing-keymap', res);
        }
        let project_id = res.keymap.project_id.value;
        let secret = res.keymap.secret.value;
        // Avoid the cost of establishing a new connection with
        // the Stytch servers on every request
        // https://github.com/stytchauth/stytch-node#customizing-the-https-agent
        const agent = new Https.Agent({
            keepAlive: true,
        });
        seneca.shared.sdk = new Stytch.Client({
            project_id,
            secret,
            env: 'live' === options.env ? Stytch.envs.live : Stytch.envs.test,
            agent,
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
    env: 'test',
    // TODO: Enable debug logging
    debug: false
};
Object.assign(StytchProvider, { defaults });
exports.default = StytchProvider;
if ('undefined' !== typeof (module)) {
    module.exports = StytchProvider;
}
//# sourceMappingURL=stytch-provider.js.map