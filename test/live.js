const Seneca = require('seneca')

Seneca({ legacy: false })
  .test()
  .use('promisify')
  .use('entity')
  .use('env', {
    // debug: true,
    file: [__dirname + '/local-env.js;?'],
    var: {
      STYTCH_PROJECT_ID: String,
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
  .use('../')
  .ready(async function() {
    const seneca = this

    console.log('SDK:', seneca.export('StytchProvider/sdk')())

    console.log(await seneca.post('sys:provider,provider:stytch,get:info'))
    
    const list = await seneca.entity("provider/stytch/user").list$()
    console.log(list.slice(0,3))
  })

