![Seneca Stytch-Provider](http://senecajs.org/files/assets/seneca-logo.png)

> _Seneca Stytch-Provider_ is a plugin for [Seneca](http://senecajs.org)


Provides access to the Stytch API using the Seneca *provider*
convention. Stytch API entities are represented as Seneca entities so
that they can be accessed using the Seneca entity API and messages.

See [seneca-entity](https://github.com/senecajs/seneca-entity) and the [Seneca Data
Entities
Tutorial](https://senecajs.org/docs/tutorials/understanding-data-entities.html) for more details on the Seneca entity API.

NOTE: underlying third party SDK needs to be replaced as out of date and has a security issue.

[![npm version](https://img.shields.io/npm/v/@seneca/stytch-provider.svg)](https://npmjs.com/package/@seneca/stytch-provider)
[![build](https://github.com/senecajs/seneca-stytch-provider/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-stytch-provider/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-stytch-provider/badge.svg?branch=main)](https://coveralls.io/github/senecajs/seneca-stytch-provider?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-stytch-provider/badge.svg)](https://snyk.io/test/github/senecajs/seneca-stytch-provider)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/19462/branches/505954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=19462&bid=505954)
[![Maintainability](https://api.codeclimate.com/v1/badges/f76e83896b731bb5d609/maintainability)](https://codeclimate.com/github/senecajs/seneca-stytch-provider/maintainability)


| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|


## Quick Setup


```js

// Setup - get the key value (<SECRET>) separately from a vault or
// environment variable.
const seneca = Seneca({ legacy: false })
  .test() // sets up the Seneca instance for testing: easier to read layout
  .use('promisify')
  .use('entity')
  // Get API keys using the seneca-env plugin
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
  // load up the 'provider/stytch/user' entity
  .use('stytch-provider')
  // it is recommended that you get seneca instance 'ready' before moving on 
  await seneca.ready()
```

## Install

```sh
$ npm install @seneca/stytch-provider @seneca/env seneca-entity @seneca/provider seneca-promisify
```



<!--START:options-->


## Options
* `debug` : boolean <i><small>false</small></i>
* `env` : string <i><small>'test' | 'live'</small></i>


Set plugin options when loading with:
```js


seneca.use('StytchProvider', { name: value, ... })


```

<!--END:options-->

<!--START:action-list-->


## Action Patterns

* [role:entity,base:stytch,cmd:load,name:user,zone:provider](#-roleentitybasestytchcmdloadnameuserzoneprovider-)
* [role:entity,base:stytch,cmd:list,name:user,zone:provider](#-roleentitybasestytchcmdlistnameuserzoneprovider-)
* [role:entity,base:stytch,cmd:save,name:user,zone:provider](#-roleentitybasestytchcmdsavenameuserzoneprovider-)
* [role:entity,base:stytch,cmd:remove,name:user,zone:provider](#-roleentitybasestytchcmdremovenameuserzoneprovider-)
* [sys:provider,get:info,provider:stytch](#-sysprovidergetinfoproviderstytch-)

In an action pattern, `role` is the seneca plugin `seneca-entity` - thus: `entity`. It is the `role` of data persistence.

The format for an action pattern used by `seneca-entity` equals to: `'<zone>/<base>/<name>'`

This is, more specifically: [the entity namespace](https://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace) concept.

`cmd` is a seneca property provided by `seneca-entity` for a given action pattern: `load|list|save|remove`.

more info on: https://github.com/senecajs/seneca-entity

<!--END:action-list-->

<!--START:action-desc-->


## Action Descriptions

### &laquo; `role:entity,base:stytch,cmd:load,name:user,zone:provider` &raquo;

Load Stytch user data into an entity.
```js
let user = await seneca.entity('provider/stytch/user')
  .load$('<stytch-user-id>')

Console.log('USER', user)
```
<p name="entity"> Replies With Type: <i>&lt;Entity&gt;</i> where <code>Entity</code> is a set of data fields determined by the sdk and is turned into a seneca data entity. </p>

----------
### &laquo; `role:entity,base:stytch,cmd:list,name:user,zone:provider` &raquo;

List Stytch users into an entity.
```js
// list
let user_list = await seneca.entity('provider/stytch/user').list$()

Console.log('USER LIST', user_list)
```
The Stytch list users body parameters are also, by default, inherited by this action pattern. So:

```js
await seneca.entity('provider/stytch/user').list$({ limit: Number }) // specify your Stytch parameters
```
Replies With Type: ```<Array<Entity>>``` where ```Array<Entity>``` is a list of SDK data entities

----------
### &laquo; `role:entity,base:stytch,cmd:save,name:user,zone:provider` &raquo;

Save/Update Stytch user data from an entity.

```js
// Save and add data
let user = await seneca.entity('provider/stytch/user')
let saved = await user.save$({ user: { email: 'alice@example.com' } })
Console.log('SAVED USER', saved)

// Update and add data
let user_loaded = await user.load$('<stytch-user-id>')
let updated = await user_loaded.data$({ user: { name: { first_name: 'Alice' } } }).save$()
Console.log('UPDATED USER', updated)
```

<p>Check out: <a href="#entity">Entity</a><br> </p>

----------
### &laquo; `role:entity,base:stytch,cmd:remove,name:user,zone:provider` &raquo;

Remove Stytch user from an entity.

```js
let removed = await seneca.entity('provider/stytch/user').remove$('<stytch-user-id>')
```

<p>Check out: <a href="#entity">Entity</a><br> </p>


----------
### &laquo; `sys:provider,get:info,provider:stytch` &raquo;

Get information about the provider.

```js
let pluginInfo = await seneca.post('sys:provider,provider:stytch,get:info')
```
Replies With
```
{
  ok: true,
  name: '<provider-name>',
  version: '<provider-version>',
  sdk: {
    name: '<sdk-name>',
    version: '<sdk-version>',
  }
}
```


----------

## Exporting and Extending
You can export the SDK instance and use it in your own seneca message.

for example
```js
let sdk = seneca.export('StytchProvider/sdk')()

seneca.message('auth:stytch,sys:user', async function (msg, reply) {
  let token = msg.token

  let out = await sdk.magicLinks.authenticate(token)

  return { ok: true, out }
})

```

<!--END:action-desc-->
