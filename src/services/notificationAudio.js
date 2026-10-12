const soundAssets = {
  add_money: '/chalo.wav',
  withdraw: '/ahh.wav',
  debit: '/notification-tune.wav',
  credit: '/wow.wav',
  winning: '/chalo.wav',
  result: '/faaah.wav',
}
const playedKeys = new Set()
const pendingKeys = new Set()
let lastPlaybackAt = 0

export function notificationEventFromText(value = '') {
  const text = String(value).toLowerCase()
  if (/winning|winner|you win|prize/.test(text)) return 'winning'
  if (/result|market result/.test(text)) return 'result'
  if (/withdraw|withdrawal/.test(text)) return 'withdraw'
  if (/debit|debited|bet placed/.test(text)) return 'debit'
  if (/add money|deposit request|deposit added|money added|wallet added/.test(text))
    return 'add_money'
  if (/credit|credited|wallet credit/.test(text)) return 'credit'
  return 'credit'
}

/**
 * Play an existing bundled sound once per notification/event key.
 * Specific MP3s are not present in the repository, so all categories safely
 * fall back to the existing public/notification-tune.wav until supplied.
 */
export async function playNotificationSound(event, dedupeKey = '') {
  const category = Object.hasOwn(soundAssets, event) ? event : 'credit'
  const key = dedupeKey ? category + ':' + dedupeKey : ''
  if (key && (playedKeys.has(key) || pendingKeys.has(key))) return false
  if (key) pendingKeys.add(key)

  // Avoid overlapping audio when a burst of repeated push events arrives.
  const now = Date.now()
  if (now - lastPlaybackAt < 700) return false
  try {
    const audio = new Audio(soundAssets[category])
    audio.preload = 'auto'
    await audio.play()
    lastPlaybackAt = now
    if (key) {
      playedKeys.add(key)
      if (playedKeys.size > 500) playedKeys.delete(playedKeys.values().next().value)
    }
    return true
  } catch {
    // Browser autoplay policies can block playback until the user interacts.
    return false
  } finally {
    if (key) pendingKeys.delete(key)
  }
}
