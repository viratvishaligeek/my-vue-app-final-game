import test from 'node:test'
import assert from 'node:assert/strict'
import { createSupportRealtime, isRelevantSupportMessage } from '../services/supportRealtime.js'
import { disconnectPusher } from '../services/pusherManager.js'

class FakePusher {
  static instances = []

  constructor(key, options) {
    this.key = key
    this.options = options
    this.handlers = new Map()
    this.unsubscribed = []
    this.disconnected = false
    this.subscribeCalls = []
    this.connection = {
      bind: (event, callback) => addHandler(this.handlers, event, callback),
      unbind: (event, callback) => removeHandler(this.handlers, event, callback),
    }
    this.channels = new Map()
    FakePusher.instances.push(this)
  }

  subscribe(name) {
    this.subscribeCalls.push(name)
    if (!this.channels.has(name)) {
      const handlers = new Map()
      this.channels.set(name, {
        handlers,
        bind: (event, callback) => addHandler(handlers, event, callback),
        unbind: (event, callback) => removeHandler(handlers, event, callback),
      })
    }
    return this.channels.get(name)
  }

  unsubscribe(name) {
    this.unsubscribed.push(name)
  }

  disconnect() {
    this.disconnected = true
  }
}

function addHandler(map, event, callback) {
  const callbacks = map.get(event) || new Set()
  callbacks.add(callback)
  map.set(event, callbacks)
}

function removeHandler(map, event, callback) {
  const callbacks = map.get(event)
  callbacks?.delete(callback)
  if (callbacks?.size === 0) map.delete(event)
}

function emit(map, event, payload) {
  map.get(event)?.forEach(callback => callback(payload))
}

const options = overrides => ({
  PusherConstructor: FakePusher,
  key: 'public-key',
  cluster: 'ap2',
  authEndpoint: '/api/broadcasting/auth',
  token: 'test-token',
  userId: 42,
  ...overrides,
})

test.beforeEach(() => {
  disconnectPusher()
  FakePusher.instances = []
})

test('support realtime requires complete public and authenticated configuration', () => {
  assert.equal(createSupportRealtime({ PusherConstructor: FakePusher, key: 'key', cluster: 'ap2' }), null)
})

test('support realtime subscribes to the authenticated user channel and forwards events', () => {
  const received = []
  const states = []
  const subscription = createSupportRealtime(options({
    onConnected: () => states.push('connected'),
    onDisconnected: () => states.push('disconnected'),
    onMessage: payload => received.push(payload),
  }))

  const client = FakePusher.instances[0]
  assert.equal(client.key, 'public-key')
  assert.equal(client.options.cluster, 'ap2')
  assert.equal(client.options.forceTLS, true)
  assert.equal(client.options.authEndpoint, '/api/broadcasting/auth')
  assert.equal(client.options.auth.headers.Authorization, 'Bearer test-token')
  assert.deepEqual(client.subscribeCalls, ['private-users.42'])

  emit(client.handlers, 'connected')
  emit(client.handlers, 'failed')
  emit(client.channels.get('private-users.42').handlers, 'support.message.created', { message_id: 9 })
  assert.deepEqual(states, ['connected', 'disconnected'])
  assert.deepEqual(received, [{ message_id: 9 }])

  subscription.disconnect()
  subscription.disconnect()
  assert.deepEqual(client.unsubscribed, ['private-users.42'])
  assert.equal(client.disconnected, true)
})

test('multiple consumers share one client and channel until the final release', () => {
  const firstMessages = []
  const secondMessages = []
  const first = createSupportRealtime(options({ onMessage: payload => firstMessages.push(payload) }))
  const second = createSupportRealtime(options({ onMessage: payload => secondMessages.push(payload) }))
  const client = FakePusher.instances[0]

  assert.equal(FakePusher.instances.length, 1)
  assert.deepEqual(client.subscribeCalls, ['private-users.42'])

  emit(client.channels.get('private-users.42').handlers, 'support.message.created', { message_id: 10 })
  assert.deepEqual(firstMessages, [{ message_id: 10 }])
  assert.deepEqual(secondMessages, [{ message_id: 10 }])

  first.disconnect()
  assert.equal(client.disconnected, false)
  assert.deepEqual(client.unsubscribed, [])

  emit(client.channels.get('private-users.42').handlers, 'support.message.created', { message_id: 11 })
  assert.deepEqual(firstMessages, [{ message_id: 10 }])
  assert.deepEqual(secondMessages, [{ message_id: 10 }, { message_id: 11 }])

  second.disconnect()
  assert.deepEqual(client.unsubscribed, ['private-users.42'])
  assert.equal(client.disconnected, true)
})

test('one shared client can retain separate channel subscriptions', () => {
  const first = createSupportRealtime(options({ userId: 42 }))
  const second = createSupportRealtime(options({ userId: 77 }))
  const client = FakePusher.instances[0]

  assert.equal(FakePusher.instances.length, 1)
  assert.deepEqual(client.subscribeCalls, ['private-users.42', 'private-users.77'])

  first.disconnect()
  assert.deepEqual(client.unsubscribed, ['private-users.42'])
  assert.equal(client.disconnected, false)

  second.disconnect()
  assert.deepEqual(client.unsubscribed, ['private-users.42', 'private-users.77'])
  assert.equal(client.disconnected, true)
})

test('changing authenticated credentials replaces the old Pusher client', () => {
  const first = createSupportRealtime(options())
  const second = createSupportRealtime(options({ token: 'refreshed-token' }))

  assert.equal(FakePusher.instances.length, 2)
  assert.equal(FakePusher.instances[0].disconnected, true)
  assert.equal(FakePusher.instances[1].options.auth.headers.Authorization, 'Bearer refreshed-token')

  first.disconnect()
  second.disconnect()
  assert.equal(FakePusher.instances[1].disconnected, true)
})

test('support message filtering accepts only requested admin conversation messages', () => {
  assert.equal(isRelevantSupportMessage({ sender: 'admin', conversation_id: 12 }, 12, true), true)
  assert.equal(isRelevantSupportMessage({ sender: 'admin', conversation_id: 13 }, 12, true), false)
  assert.equal(isRelevantSupportMessage({ sender: 'user', conversation_id: 12 }, 12, true), false)
  assert.equal(isRelevantSupportMessage({ sender: 'admin', conversation_id: 12 }, 12, false), false)
  assert.equal(isRelevantSupportMessage({ sender: 'admin', conversation_id: 12 }, null, true), true)
})
