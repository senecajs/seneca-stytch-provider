/* Copyright © 2022 Seneca Project Contributors, MIT License. */

const Pkg = require('../package.json')

module.exports = {
  print: false,
  pattern: 'sys:provider,provider:stytch',
  allow: { missing: true },

  calls: [
    {
      pattern: 'get:info',
      out: {
        ok: true,
        name: 'stytch',
        version: Pkg.version,
        sdk: {
          name: 'stytch',
          version: Pkg.dependencies['stytch'],
        }
      },
    }
  ]
}
