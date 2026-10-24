import test from 'node:test'
import assert from 'node:assert/strict'
import { isValidIndianPhone, normalizeIndianPhone } from './indianPhone.js'

test('normalizes an ordinary Indian mobile number', () => {
  assert.equal(normalizeIndianPhone('9876543210'), '9876543210')
})

test('strips +91 and formatting from pasted phone numbers', () => {
  assert.equal(normalizeIndianPhone('+91 98765-43210'), '9876543210')
  assert.equal(normalizeIndianPhone('919876543210'), '9876543210')
  assert.equal(normalizeIndianPhone('09876543210'), '9876543210')
})

test('accepts digits only and caps the editable number at ten digits', () => {
  assert.equal(normalizeIndianPhone('98a76 543-21099'), '9876543210')
  assert.equal(normalizeIndianPhone('123456789012345'), '1234567890')
})

test('validates exactly ten digits', () => {
  assert.equal(isValidIndianPhone('9876543210'), true)
  assert.equal(isValidIndianPhone('987654321'), false)
  assert.equal(isValidIndianPhone('98765432101'), false)
  assert.equal(isValidIndianPhone('+919876543210'), false)
})
