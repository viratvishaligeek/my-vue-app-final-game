import test from 'node:test'
import assert from 'node:assert/strict'
import { isJodaResult } from './jodaResults.js'

test('recognizes every exact Joda pair', () => {
  for (const value of ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99']) {
    assert.equal(isJodaResult(value), true, value)
  }
})

test('supports numeric zero without matching unrelated values', () => {
  assert.equal(isJodaResult(0), true)
  for (const value of ['01', '10', '12', '99x', '1', '0', '', null, undefined, 10, 99.1]) {
    assert.equal(isJodaResult(value), false, String(value))
  }
})
