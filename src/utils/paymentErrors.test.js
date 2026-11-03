import test from 'node:test'
import assert from 'node:assert/strict'
import { getPaymentErrorMessage } from './paymentErrors.js'

test('keeps field validation messages for invalid payment input', () => {
  const error = { response: { status: 422, data: { errors: { amount: ['Amount is invalid.'] } } } }
  assert.equal(getPaymentErrorMessage(error), 'Amount is invalid.')
})

test('does not expose raw gateway messages on a gateway rejection', () => {
  const error = { response: { status: 422, data: { message: 'Active Plan not found. Please Buy Plan' } } }
  assert.equal(
    getPaymentErrorMessage(error),
    'The payment request could not be processed. Please check the amount and try again.',
  )
})

test('does not expose server exception details', () => {
  const error = { response: { status: 500, data: { message: 'SQL password=secret failed' } } }
  assert.equal(getPaymentErrorMessage(error), 'Automatic payment is temporarily unavailable. Please try again later.')
})

test('handles network errors without exposing low-level diagnostics', () => {
  const error = { message: 'ECONNREFUSED 10.0.0.2:443' }
  assert.equal(
    getPaymentErrorMessage(error),
    'Unable to reach the payment service. Check your internet connection and try again.',
  )
})
