import test from 'node:test'
import assert from 'node:assert/strict'
import { createPushRegistrationCoordinator } from './pushRegistration.js'

function createStorage() {
  const values = new Map()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  }
}

const identity = {
  token: 'fcm-device-token',
  platform: 'android',
  endpoint: '/push/register-user',
}

test('registers a token once and skips repeated route-navigation syncs', async () => {
  const calls = []
  const coordinator = createPushRegistrationCoordinator({
    register: async (endpoint, payload) => calls.push({ endpoint, payload }),
    storage: createStorage(),
  })

  assert.equal(await coordinator.ensureRegistered(identity), true)
  assert.equal(await coordinator.ensureRegistered(identity), true)
  assert.equal(await coordinator.ensureRegistered(identity), true)
  assert.equal(calls.length, 1)
})

test('re-registers when authentication changes the registration endpoint', async () => {
  const calls = []
  const coordinator = createPushRegistrationCoordinator({
    register: async (endpoint, payload) => calls.push({ endpoint, payload }),
    storage: createStorage(),
  })

  await coordinator.ensureRegistered({ ...identity, endpoint: '/push/subscribe' })
  await coordinator.ensureRegistered({ ...identity, endpoint: '/push/register-user' })
  assert.deepEqual(calls.map(call => call.endpoint), ['/push/subscribe', '/push/register-user'])
})

test('coalesces concurrent registrations for the same device identity', async () => {
  let resolveRequest
  let calls = 0
  const coordinator = createPushRegistrationCoordinator({
    register: () => {
      calls += 1
      return new Promise(resolve => { resolveRequest = resolve })
    },
    storage: createStorage(),
  })

  const first = coordinator.ensureRegistered(identity)
  const second = coordinator.ensureRegistered(identity)
  await Promise.resolve()
  assert.equal(calls, 1)

  resolveRequest()
  assert.equal(await first, true)
  assert.equal(await second, true)
  assert.equal(calls, 1)
})

test('does not cache a failed registration and allows a later retry', async () => {
  let calls = 0
  const coordinator = createPushRegistrationCoordinator({
    register: async () => {
      calls += 1
      if (calls === 1) throw new Error('temporary failure')
    },
    storage: createStorage(),
  })

  await assert.rejects(coordinator.ensureRegistered(identity), /temporary failure/)
  assert.equal(await coordinator.ensureRegistered(identity), true)
  assert.equal(calls, 2)
})

test('clear removes the remembered token scope so re-enable registers again', async () => {
  const calls = []
  const storage = createStorage()
  const coordinator = createPushRegistrationCoordinator({
    register: async (endpoint, payload) => calls.push({ endpoint, payload }),
    storage,
  })

  await coordinator.ensureRegistered(identity)
  coordinator.clear()
  await coordinator.ensureRegistered(identity)
  assert.equal(calls.length, 2)
  assert.equal(storage.getItem('push_registration_token'), 'fcm-device-token')
})
