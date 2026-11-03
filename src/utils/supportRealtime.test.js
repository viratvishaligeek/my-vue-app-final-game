import test from 'node:test'
import assert from 'node:assert/strict'
import { createSupportRealtime, isRelevantSupportMessage } from '../services/supportRealtime.js'

class FakePusher {
  static instances = []

  constructor(key, options) {
    this.key = key
    this.options = options
    this.handlers = new Map()
    this.unsubscribed = []
    this.disconnected = false
    this.connection = {
      bind: (event, callback) => this.handlers.set('connection:' + event, callback),
    }
    this.channel = {
      handlers: new Map(),
      bind: (event, callback) => this.channel.handlers.set(event, callback),
      unbind_all: () => { this.channel.unbound = true },
    }
    FakePusher.instances.push(this)
  }

  subscribe(name) {
    this.channelName = name
    return this.channel
  }

  unsubscribe(name) {
    this.unsubscribed.push(name)
  }

  disconnect() {
    this.disconnected = true
  }
}

test('support realtime requires complete public and authenticated configuration', () => {
  assert.equal(createSupportRealtime({ PusherConstructor: FakePusher, key: 'key', cluster: 'ap2' }), null)
})

test('support realtime subscribes to the authenticated user channel and forwards events', () => {
  FakePusher.instances = []
  const received = []
  const states = []
  const subscription = createSupportRealtime({
    PusherConstructor: FakePusher,
    key: 'public-key',
    cluster: 'ap2',
    authEndpoint: '/api/broadcasting/auth',
    token: 'test-token',
    userId: 42,
    onConnected: () => states.push('connected'),
    onDisconnected: () => states.push('disconnected'),
    onMessage: payload => received.push(payload),
  })

  const client = FakePusher.instances[0]
  assert.equal(client.key, 'public-key')
  assert.equal(client.options.cluster, 'ap2')
  assert.equal(client.options.forceTLS, true)
  assert.equal(client.options.authEndpoint, '/api/broadcasting/auth')
  assert.equal(client.options.auth.headers.Authorization, 'Bearer test-token')
  assert.equal(client.channelName, 'private-users.42')

  client.handlers.get('connection:connected')()
  client.handlers.get('connection:failed')()
  client.channel.handlers.get('support.message.created')({ message_id: 9 })
  assert.deepEqual(states, ['connected', 'disconnected'])
  assert.deepEqual(received, [{ message_id: 9 }])

  subscription.disconnect()
  subscription.disconnect()
  assert.deepEqual(client.unsubscribed, ['private-users.42'])
  assert.equal(client.channel.unbound, true)
  assert.equal(client.disconnected, true)
})

test('support message filtering accepts only requested admin conversation messages', () => {
  assert.equal(isRelevantSupportMessage({ sender: 'admin', conversation_id: 12 }, 12, true), true)
  assert.equal(isRelevantSupportMessage({ sender: 'admin', conversation_id: 13 }, 12, true), false)
  assert.equal(isRelevantSupportMessage({ sender: 'user', conversation_id: 12 }, 12, true), false)
  assert.equal(isRelevantSupportMessage({ sender: 'admin', conversation_id: 12 }, 12, false), false)
  assert.equal(isRelevantSupportMessage({ sender: 'admin', conversation_id: 12 }, null, true), true)
})
