import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createPresenceActivityTracker } from './presenceActivity.js'

function createFakeTimers() {
  let nextId = 1
  const tasks = new Map()
  return {
    schedule(callback, delay) {
      const id = nextId++
      tasks.set(id, { callback, delay })
      return id
    },
    cancel(id) {
      tasks.delete(id)
    },
    runNext() {
      const [id, task] = tasks.entries().next().value || []
      if (!task) return false
      tasks.delete(id)
      task.callback()
      return true
    },
    get size() {
      return tasks.size
    },
    get nextDelay() {
      return [...tasks.values()][0]?.delay ?? null
    },
  }
}

test('marks a foreground session idle once after the configured inactivity timeout', () => {
  const timers = createFakeTimers()
  let idleCount = 0
  const tracker = createPresenceActivityTracker({
    timeoutMs: 300_000,
    onIdle: () => idleCount++,
    schedule: timers.schedule,
    cancel: timers.cancel,
  })

  tracker.start()
  assert.equal(timers.size, 1)
  timers.runNext()
  assert.equal(tracker.isIdle, true)
  assert.equal(idleCount, 1)
  assert.equal(timers.size, 0)
})

test('user activity resumes an idle session and starts a fresh idle window', () => {
  const timers = createFakeTimers()
  let idleCount = 0
  let resumeCount = 0
  const tracker = createPresenceActivityTracker({
    timeoutMs: 300_000,
    onIdle: () => idleCount++,
    onResume: () => resumeCount++,
    schedule: timers.schedule,
    cancel: timers.cancel,
  })

  tracker.start()
  timers.runNext()
  tracker.activity()

  assert.equal(tracker.isIdle, false)
  assert.equal(resumeCount, 1)
  assert.equal(timers.size, 1)

  timers.runNext()
  assert.equal(idleCount, 2)
  assert.equal(resumeCount, 1)
})

test('repeated server heartbeats with the same timeout do not postpone the idle deadline', () => {
  const timers = createFakeTimers()
  let idleCount = 0
  const tracker = createPresenceActivityTracker({
    timeoutMs: 300_000,
    onIdle: () => idleCount++,
    schedule: timers.schedule,
    cancel: timers.cancel,
  })

  tracker.start()
  tracker.setTimeoutMs(300_000)
  assert.equal(timers.size, 1)
  timers.runNext()
  assert.equal(idleCount, 1)
})

test('background suspension cancels the idle timer without emitting an idle event', () => {
  const timers = createFakeTimers()
  let idleCount = 0
  const tracker = createPresenceActivityTracker({
    timeoutMs: 300_000,
    onIdle: () => idleCount++,
    schedule: timers.schedule,
    cancel: timers.cancel,
  })

  tracker.start()
  tracker.suspend()
  assert.equal(timers.size, 0)
  assert.equal(timers.runNext(), false)
  assert.equal(idleCount, 0)
})

test('server-provided idle timeout can update the active timer', () => {
  const timers = createFakeTimers()
  const tracker = createPresenceActivityTracker({
    timeoutMs: 300_000,
    schedule: timers.schedule,
    cancel: timers.cancel,
  })

  tracker.start()
  tracker.setTimeoutMs(120_000)
  assert.equal(timers.size, 1)
  assert.equal(timers.nextDelay, 120_000)
})
