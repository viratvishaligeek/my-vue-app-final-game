export const normalizeIndianPhone = (value) => {
  const raw = String(value ?? '').trim()
  let digits = raw.replace(/\D/g, '')

  if (/^\s*\+91/.test(raw)) {
    digits = digits.slice(2)
  } else if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2)
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  return digits.slice(0, 10)
}

export const isValidIndianPhone = (value) => /^\d{10}$/.test(String(value ?? ''))
