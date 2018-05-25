const test = require('tape')
const path = require('path')
const jwt = require('jsonwebtoken')
const providerMock = {
  name: 'test-provider',
  Model: function () {}
}
const secret = 'secret'
const auth = require('../src')(secret, path.join(__dirname, '/fixtures/user-store.json'))

test('authorize success', async function (t) {
  t.plan(1)
  // Mock token
  const token = jwt.sign({exp: Math.floor(Date.now() / 1000) + 120, iss: providerMock.name, sub: 'username'}, secret)
  let decoded = await auth.authorize(token)
  t.equals(decoded.iss, providerMock.name)
})

test('authorize failure - no token', async function (t) {
  t.plan(1)
  try {
    await auth.authorize(undefined)
  } catch (err) {
    t.equals(err.code, 401)
  }
})

test('authorize failure - expired token', async function (t) {
  t.plan(1)
  // Mock token
  const token = jwt.sign({exp: Math.floor(Date.now() / 1000) - 120, iss: providerMock.name, sub: 'username'}, secret)
  try {
    await auth.authorize(token)
  } catch (err) {
    t.equals(err.code, 401)
  }
})

test('authenticate success', async function (t) {
  t.plan(2)
  let result = await auth.authenticate('jerry', 'garcia')
  t.equals(typeof result.token, 'string')
  t.equals(typeof result.expires, 'number')
})

test('authenticate failure', async function (t) {
  t.plan(2)
  try {
    await auth.authenticate('lou', 'reed')
  } catch (err) {
    t.equals(err.code, 401)
    t.equals(err.message, 'Invalid credentials.')
  }
})

test('authenticationSpecifiction', t => {
  t.plan(2)
  let authenticationSpecification = auth.getAuthenticationSpecification(providerMock.name)
  let result = authenticationSpecification()
  t.equals(result.secured, true)
  t.equals(result.provider, providerMock.name)
})

test('authSpecOptions', t => {
  t.plan(3)
  let optionAuth = require('../src')(secret, path.join(__dirname, '/fixtures/user-store.json'), {authSpecExtension: {ssl: false}})
  let authenticationSpecification = optionAuth.getAuthenticationSpecification(providerMock.name)
  let result = authenticationSpecification()
  t.equals(result.secured, true)
  t.equals(result.provider, providerMock.name)
  t.equals(result.ssl, false)
})

test('tokenExpirationMinutes - invalid "tokenExpirationMinutes" setting', t => {
  t.plan(1)
  t.throws(function () {
    require('../src')(secret, path.join(__dirname, '/fixtures/user-store.json'), {tokenExpirationMinutes: -1})
  }, /"tokenExpirationMinutes" must be an integer >= 5/)
})

test('tokenExpirationMinutes - invalid "authSpecExtension.provider" setting', t => {
  t.plan(1)
  t.throws(function () {
    require('../src')(secret, path.join(__dirname, '/fixtures/user-store.json'), {authSpecExtension: {provider: 'test'}})
  }, /"provider" not allow as an authSpecExtension key/)
})

test('tokenExpirationMinutes - invalid "authSpecExtension.secured" setting', t => {
  t.plan(1)
  t.throws(function () {
    require('../src')(secret, path.join(__dirname, '/fixtures/user-store.json'), {authSpecExtension: {secured: 'test'}})
  }, /"secured" not allow as an authSpecExtension key/)
})
