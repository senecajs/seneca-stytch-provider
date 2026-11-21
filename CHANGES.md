# Changes

## 0.3.0 2026-11-21

First entry of this change log. Earlier versions are on npm and in the git
history.

* Seneca 4: the peer dependency is `seneca` `^4.0.0` (was `>=3`). Seneca 3
  users stay on `@seneca/stytch-provider@0.2`.
* The entity peer is `@seneca/entity` `^29.0.0` instead of `seneca-entity`.
  The other peers are `@seneca/provider` `^5.0.0` and `@seneca/env` `^0.6.0`,
  which is now optional: the plugin itself does not use it.
* The `seneca-promisify` peer dependency is removed. Seneca 4 has promises
  built in; do not call `use('promisify')` (D4).
* Node.js 24 or later (`engines.node` `>=24`, was `>=14`).
* New since 0.2.0 (written in 2023, first released here): the user entity
  can be saved (create and update) and removed, and the session entity can
  be listed. The `example/mini-express-app` shows a magic link login.
* Tests load plugins by full name (`@seneca/entity`, `@seneca/env`,
  `@seneca/provider`). Without a Stytch project they run against a local mock
  of the Stytch API, with dummy `STYTCH_PROJECTID` and `STYTCH_SECRET`
  values, so the user and session tests now run offline too; with
  `test/local-config.js` or those environment variables they call the Stytch
  test API. Live calls were not tested on Seneca 4.
* devDependencies: `seneca` `^4.0.0`, `@seneca/entity` `^29.0.0`,
  `@seneca/env` `^0.6.0`, `@seneca/provider` `^5.0.0`, `seneca-msg-test`
  `^5.0.0`, `typescript` `^5.9.3` and `@types/node` `^24`; `@seneca/doc` is
  removed with the `doc` script, which did not work.
* README and the example app: Seneca 4 install line, no `seneca-promisify`,
  plugins loaded by full name. `test/local-env-template.js` names the
  variables the tests read.
* `repository.url` points at GitHub in `git+https` form (it named a
  stytch.com host), `publishConfig` sets public access, and the package
  includes `CHANGES.md`.
