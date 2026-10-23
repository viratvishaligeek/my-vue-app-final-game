export function isJodaResult(value) {
  if (value === null || value === undefined || value === '') return false
  const normalized = typeof value === 'number' && value === 0
    ? '00'
    : String(value).trim()
  return /^(00|11|22|33|44|55|66|77|88|99)$/.test(normalized)
}
