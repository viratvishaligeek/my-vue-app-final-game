/**
 * Normalize an Indian mobile number to the ten-digit format expected by
 * the existing authentication API. The UI displays +91 separately.
 */
export const normalizeIndianPhone = (value) => {
  const raw = String(value ?? '').trim()
  let digits = raw.replace(/\D/g, '')

  // Strip an explicitly entered +91 prefix, including partial pasted values.
  if (/^\s*\+91/.test(raw)) {
    digits = digits.slice(2)
  } else if (digits.length === 12 && digits.startsWith('91')) {
    // Also support a pasted number like 919876543210 without a plus sign.
    digits = digits.slice(2)
  } else if (digits.length === 11 && digits.startsWith('0')) {
    // Support a common domestic trunk-prefix format.
    digits = digits.slice(1)
  }

  return digits.slice(0, 10)
}

export const isValidIndianPhone = (value) => /^\d{10}$/.test(String(value ?? ''))
