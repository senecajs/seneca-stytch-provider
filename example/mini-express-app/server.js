const Express = require('express')
const BodyParser = require('body-parser')
const Url = require('url')

const Seneca = require('seneca')

const StytchProvider = require('../../')


const start = async () => {
  const app = Express()
  const seneca = await makeSeneca({ legacy: false })
  const port = 3000
  const path = `http://localhost:${port}`

  let sdk = seneca.export('StytchProvider/sdk')()
  let plugin_info = await seneca.post('sys:provider,provider:stytch,get:info')

  console.log(plugin_info)

  configureApp(app)
  setUpRoutes(app, sdk, path)
  app.listen(port, () => {
    console.log(`Listening on ${path}`)
  })
}

start()

async function makeSeneca(opts) {
  const seneca = Seneca(opts)
    .test()
    .use('promisify')
    .use('entity')
    .use('env', {
      var: {
        $STYTCH_PROJECTID: String,
        $STYTCH_SECRET: String,
      }
    })
    .use('provider', {
      provider: {
        stytch: {
          keys: {
            project_id: { value: '$STYTCH_PROJECTID' },
            secret: { value: '$STYTCH_SECRET' },
          }
        }
      }
    })
    .use(StytchProvider)

  await seneca.ready()
  return seneca
}

function setUpRoutes(app, sdk, path) {
  const magicLinkUrl = `${path}/authenticate`

  app.get('/', async (req, res) => {
    res.render('loginOrSignUp')
  })

  app.post('/login_or_create_user', async (req, res) => {
    const params = {
      email: req.body.email,
      login_magic_link_url: magicLinkUrl,
      signup_magic_link_url: magicLinkUrl,
    }
    try {
      let result = await sdk.magicLinks.email.loginOrCreate(params)
      res.render('emailSent')
    } catch(err) {
      console.log(err)
      res.render('loginOrSignUp')
    }

  })

  app.get('/authenticate', async (req, res) => {
    const queryObject = Url.parse(req.url, true).query
    try {
      let result = await sdk.magicLinks.authenticate(queryObject.token)
      console.log('auth result: ', result)
      res.render('loggedIn')
    } catch(err) {
      console.log(err)
      res.render('loginOrSignUp')
    }
  })

}

function configureApp(app) {
  app.use(BodyParser.urlencoded({ extended: true }))
  app.use(Express.static('public'))
  app.set('view engine', 'ejs')
}
