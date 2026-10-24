/**
 * Keep only the digits the user enters, capped at ten characters.
 * The visible +91 prefix is presentation-only and is never processed here.
 */
export const normalizePhoneDigits = (value) =>
  String(value ?? '').replace(/[^0-9]/g, '').slice(0, 10)

export const hasExactlyTenDigits = (value) => {
  const digits = String(value ?? '')
  if (digits.length !== 10) return false

  for (let index = 0; index < digits.length; index += 1) {
    const code = digits.charCodeAt(index)
    if (code < 48 || code > 57) return false
  }

  return true
}
