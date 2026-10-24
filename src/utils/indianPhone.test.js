import test from 'node:test'
import assert from 'node:assert/strict'
import { hasExactlyTenDigits, normalizePhoneDigits } from './indianPhone.js'

test('accepts any ten digits without mobile-prefix checks', () => {
  assert.equal(hasExactlyTenDigits('1234567890'), true)
  assert.equal(hasExactlyTenDigits('0000000000'), true)
  assert.equal(hasExactlyTenDigits('1111111111'), true)
})

test('blocks submission for fewer than ten digits', () => {
  assert.equal(hasExactlyTenDigits('123456789'), false)
  assert.equal(hasExactlyTenDigits(''), false)
})

test('caps the input at ten digits and strips non-digits', () => {
  assert.equal(normalizePhoneDigits('12345678901'), '1234567890')
  assert.equal(normalizePhoneDigits('12ab-34 56!7890'), '1234567890')
  assert.equal(normalizePhoneDigits('0000000000'), '0000000000')
})

test('submission validation rejects non-digits and eleven digits', () => {
  assert.equal(hasExactlyTenDigits('123456789a'), false)
  assert.equal(hasExactlyTenDigits('12345678901'), false)
})
