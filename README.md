# Koop-Auth-Direct-File
## A authentication module for implementing direct authentication from client to Koop server with a file-based user-store

## Authentication pattern

The authentication module implemented here uses a *direct authentication* pattern; it receives user credentials (username/password) from a client and authenticates those credentials against an identity/user-store. Requests with valid credentials are issued an access-token (a string of encoded-data); The access token is encoded with the use of a secret known only to the Koop server. The access-token expires and becomes invalid after a certain period (default of 60 minutes).

![get access token](https://gist.githubusercontent.com/rgwozdz/e44f3686abe40360532fbcc6dccf225d/raw/9768df32fc62e99ce7383c124cab8efdf45b1e18/koop-direct-auth-access-token.png)

The issued access-token should be attached to all subsequent service requests by the client. When the server receives a request, it will check for the presence of an access-token and reject any requests that are missing such token. If the token is present, the server attempts to decode it with its stored secret. Failure to decode results in a request rejection. Once decoded, the server checks the token's expiration-date and rejects any token with a date that is out of range. If the token is not expired, the request for the desired resource proceeds.

![enter image description here](https://gist.githubusercontent.com/rgwozdz/e44f3686abe40360532fbcc6dccf225d/raw/9768df32fc62e99ce7383c124cab8efdf45b1e18/koop-direct-auth-resources.png)

## Example of Koop authentication implementation

The [server.js](./server.js) file provides an example of securing a provider's resources. Start by requiring the provider and the authentication module.

    let auth = require('./koop-auth-direct/src')('pass-in-your-secret')
    koop.register(auth)

Then require and register your providers.  

    const provider = require('./')
    koop.register(provider)

The authentication module will configure and add its `authorize`, `authenticate`, and `authenticationSpecification` functions to the provider's model prototype.  Output services will leverage these functions to secure the service endpoints and properly route requests to authenticate.

Finally, create a JSON file store.  This should be an array of objects with properties `username` and `password`.  Set an environment variable `USER_STORE` with the path of the file relative to the root of the repository (e.g, `USER_STORE=./user-store.json`)

## Authentication API

### (secret, options) ⇒ <code>Object</code>
* configure the authentication module with secret use for token encoding/decoding

| Param | Type | Description |
| --- | --- | --- |
| secret | <code>string</code> | secret for encoding/decoding tokens |
| options | <code>object</code> | options object |
| options.tokenExpirationMinutes | <code>integer</code> | minutes until token expires (default 60) |