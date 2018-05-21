const jwt = require('jsonwebtoken')
const validateCredentials = require('./validate-credentials')
const TOKEN_EXPIRATION_MINTUES = 60
let tokenExpirationMinutes
let tokenSecret

/**
 * configure auth functions
 * @param {string}   secret - secret for generating tokens
 * @param {object}   options
 * @param {integer}  options.tokenExpirationMinutes - number of minutes until token expires
 */
function auth (secret, options = {}) {
  tokenSecret = secret
  tokenExpirationMinutes = options.tokenExpirationMinutes || TOKEN_EXPIRATION_MINTUES

  //  Ensure token expiration is an integer greater than 5
  if (!Number.isInteger(tokenExpirationMinutes) || tokenExpirationMinutes < 5) throw new Error(`"tokenExpirationMinutes" must be an integer >= 5`)

  return {
    type: 'auth',
    getAuthenticationSpecification,
    authenticate,
    authorize
  }
}

/**
 * Parameterize a "authenticationSpecification" function with the name of a provider
 * @param {string} providerNamespace
 */
function getAuthenticationSpecification (providerNamespace) {
  return function authenticationSpecification () {
    return {
      provider: providerNamespace,
      secured: true
    }
  }
}

function authenticate (username, password) {
  return new Promise((resolve, reject) => {
    // Validate user's credentials
    validateCredentials(username, password)
      .then(valid => {
        // If credentials were not valid, reject
        if (!valid) {
          let err = new Error('Invalid credentials.')
          err.code = 401
          reject(err)// Create access token
        }
        let expires = Date.now() + (tokenExpirationMinutes * 60 * 1000)
        let json = {
          token: jwt.sign({exp: Math.floor(expires / 1000), sub: username}, tokenSecret),
          expires
        }
        resolve(json)
      })
      .catch(err => {
        reject(err)
      })
  })
}

function authorize (token) {
  return new Promise((resolve, reject) => {
    // Verify token with async decoded function
    jwt.verify(token, tokenSecret, function (err, decoded) {
      // If token invalid, reject
      if (err) {
        err.code = 401
        reject(err)
      }
      resolve(decoded)
    })
  })
}

module.exports = auth
