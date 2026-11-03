import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSingleFlight } from './singleFlight.js'

test('coalesces concurrent calls and allows a new call after settlement', async () => {
  let calls = 0
  const pending = []
  const run = createSingleFlight(() => {
    calls += 1
    return new Promise((resolve) => pending.push(resolve))
  })

  const first = run()
  const duplicate = run()
  assert.strictEqual(duplicate, first)

  await Promise.resolve()
  assert.equal(calls, 1)
  pending[0]('first result')
  assert.equal(await first, 'first result')

  const next = run()
  await Promise.resolve()
  assert.equal(calls, 2)
  pending[1]('second result')
  assert.equal(await next, 'second result')
})
