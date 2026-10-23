import test from 'node:test'
import assert from 'node:assert/strict'
import { isTrustedGatewayPaymentUrl } from './paymentUrl.js'

test('allows HTTPS URLs on official UPIGateway/EkQR domains', () => {
  assert.equal(isTrustedGatewayPaymentUrl('https://api.ekqr.in/api/pay/123'), true)
  assert.equal(isTrustedGatewayPaymentUrl('https://portal.ekqr.in/pay/123'), true)
  assert.equal(isTrustedGatewayPaymentUrl('https://upigateway.com/pay/123'), true)
})

test('rejects insecure, deceptive, credentialed, and malformed URLs', () => {
  for (const url of [
    'http://api.ekqr.in/pay/123',
    'https://ekqr.in.evil.example/pay',
    'https://evil-ekqr.in/pay',
    'https://evil.example/?next=https://ekqr.in',
    'https://user:pass@api.ekqr.in/pay',
    'not-a-url',
  ]) {
    assert.equal(isTrustedGatewayPaymentUrl(url), false, url)
  }
})
