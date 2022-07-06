"use strict";
/* Copyright © 2021 Seneca Project Contributors, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: namespace provider zone; needs seneca-entity feature
const rest_1 = require("@octokit/rest");
/* Repo ids are of the form 'owner/name'. The internal github id field is
 * moved to github_id.
 *
 *
 */
function GithubProvider(_options) {
    const seneca = this;
    const ZONE_BASE = 'provider/github/';
    let octokit;
    // NOTE: sys- zone prefix is reserved.
    seneca
        .message('sys:provider,provider:github,get:info', get_info)
        .message('role:entity,cmd:load,zone:provider,base:github,name:repo', load_repo)
        .message('role:entity,cmd:save,zone:provider,base:github,name:repo', save_repo);
    async function get_info(_msg) {
        return {
            ok: true,
            name: 'github',
            details: {
                sdk: '@octokit/rest'
            }
        };
    }
    async function load_repo(msg) {
        let ent = null;
        let q = msg.q;
        let [ownername, reponame] = q.id.split('/');
        let res = await octokit.rest.repos.get({
            owner: ownername,
            repo: reponame,
        });
        if (res && 200 === res.status) {
            let data = res.data;
            data.github_id = data.id;
            data.id = q.id;
            ent = this.make$(ZONE_BASE + 'repo').data$(data);
        }
        return ent;
    }
    async function save_repo(msg) {
        let ent = msg.ent;
        let [ownername, reponame] = ent.id.split('/');
        let data = {
            owner: ownername,
            repo: reponame,
            description: ent.description
        };
        let res = await octokit.rest.repos.update(data);
        if (res && 200 === res.status) {
            let data = res.data;
            data.github_id = data.id;
            data.id = ownername + '/' + reponame;
            ent = this.make$(ZONE_BASE + 'repo').data$(data);
        }
        return ent;
    }
    seneca.prepare(async function () {
        let out = await this.post('sys:provider,get:key,provider:github,key:api');
        if (!out.ok) {
            this.fail('api-key-missing');
        }
        let config = {
            auth: out.value
        };
        octokit = new rest_1.Octokit(config);
    });
    return {
        exports: {
            native: () => ({
                octokit
            })
        }
    };
}
// Default options.
const defaults = {
    // TODO: Enable debug logging
    debug: false
};
Object.assign(GithubProvider, { defaults });
exports.default = GithubProvider;
if ('undefined' !== typeof (module)) {
    module.exports = GithubProvider;
}
//# sourceMappingURL=github-provider.js.map