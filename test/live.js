const Seneca = require('seneca')

Seneca({ legacy: false })
  .test()
  .use('promisify')
  .use('entity')
  .use('env', {
    // debug: true,
    file: [__dirname + '/local-env.js;?'],
    var: {
      $TRELLO_APIKEY: String,
      $TRELLO_USERTOKEN: String,
    }
  })
  .use('provider', {
    provider: {
      trello: {
        keys: {
          apikey: { value: '$TRELLO_APIKEY' },
          usertoken: { value: '$TRELLO_USERTOKEN' },
        }
      }
    }
  })
  .use('../')
  .ready(async function() {
    const seneca = this

    console.log('SDK:', seneca.export('TrelloProvider/sdk')())

    console.log(await seneca.post('sys:provider,provider:trello,get:info'))
    
    const list = await seneca.entity("provider/trello/board").list$()
    console.log(list.slice(0,3))
  })

