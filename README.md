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

*None.*


<!--END:options-->

<!--START:action-list-->


## Action Patterns

* ["role":"entity","base":"stytch","cmd":"list","name":"session","zone":"provider"](#-roleentitybasestytchcmdlistnamesessionzoneprovider-)
* ["role":"entity","base":"stytch","cmd":"list","name":"user","zone":"provider"](#-roleentitybasestytchcmdlistnameuserzoneprovider-)
* ["role":"entity","base":"stytch","cmd":"load","name":"user","zone":"provider"](#-roleentitybasestytchcmdloadnameuserzoneprovider-)
* ["role":"entity","base":"stytch","cmd":"remove","name":"user","zone":"provider"](#-roleentitybasestytchcmdremovenameuserzoneprovider-)
* ["role":"entity","base":"stytch","cmd":"save","name":"user","zone":"provider"](#-roleentitybasestytchcmdsavenameuserzoneprovider-)
* ["sys":"provider","get":"info","provider":"stytch"](#-sysprovidergetinfoproviderstytch-)


<!--END:action-list-->

<!--START:action-desc-->


## Action Descriptions

### &laquo; `"role":"entity","base":"stytch","cmd":"list","name":"session","zone":"provider"` &raquo;

No description provided.



----------
### &laquo; `"role":"entity","base":"stytch","cmd":"list","name":"user","zone":"provider"` &raquo;

List Stytch data into an entity



----------
### &laquo; `"role":"entity","base":"stytch","cmd":"load","name":"user","zone":"provider"` &raquo;

Load Stytch data into an entity



----------
### &laquo; `"role":"entity","base":"stytch","cmd":"remove","name":"user","zone":"provider"` &raquo;

Remove Stytch data from an entity



----------
### &laquo; `"role":"entity","base":"stytch","cmd":"save","name":"user","zone":"provider"` &raquo;

Update/Save Stytch data into an entity



----------
### &laquo; `"sys":"provider","get":"info","provider":"stytch"` &raquo;

Get information about the Stytch SDK.



----------


<!--END:action-desc-->
