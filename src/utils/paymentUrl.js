export function isTrustedGatewayPaymentUrl(value) {
  try {
    const url = new URL(String(value || ''))
    if (url.protocol !== 'https:' || url.username || url.password) return false
    const host = url.hostname.toLowerCase()
    return ['ekqr.in', 'upigateway.com'].some(
      (domain) => host === domain || host.endsWith('.' + domain),
    )
  } catch {
    return false
  }
}
