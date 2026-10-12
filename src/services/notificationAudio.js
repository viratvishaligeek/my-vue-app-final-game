import api from '@/plugins/axios'

const defaultSound = '/notification-tune.wav'
const eventKeys = ['add_money', 'withdraw', 'debit', 'credit', 'winning', 'result', 'chat']
const playedKeys = new Set()
const pendingKeys = new Set()
let lastPlaybackAt = 0
let soundSettingsPromise = null
let soundSettings = Object.fromEntries(eventKeys.map(key => [key, 'default']))

async function loadSoundSettings() {
  if (!soundSettingsPromise) {
    soundSettingsPromise = api.get('/settings', {
      params: { keys: eventKeys.map(key => 'notification_sound_' + key).join(',') },
      showGlobalLoader: false,
    }).then(({ data }) => {
      const values = data?.data || {}
      soundSettings = Object.fromEntries(eventKeys.map(key => [
        key,
        values['notification_sound_' + key] === 'mute' ? 'mute' : 'default',
      ]))
      return soundSettings
    }).catch(() => soundSettings)
  }
  return soundSettingsPromise
}

export function notificationEventFromText(value = '') {
  const text = String(value).toLowerCase()
  if (/support|chat|message from support/.test(text)) return 'chat'
  if (/winning|winner|you win|prize/.test(text)) return 'winning'
  if (/result|market result/.test(text)) return 'result'
  if (/withdraw|withdrawal/.test(text)) return 'withdraw'
  if (/debit|debited|bet placed/.test(text)) return 'debit'
  if (/add money|deposit request|deposit added|money added|wallet added/.test(text)) return 'add_money'
  if (/credit|credited|wallet credit/.test(text)) return 'credit'
  return 'credit'
}

/** Plays the existing bundled WAV once per event key; admin settings can mute categories. */
export async function playNotificationSound(event, dedupeKey = '') {
  const category = Object.hasOwn(soundSettings, event) ? event : 'credit'
  const key = dedupeKey ? category + ':' + dedupeKey : ''

  if (key && (playedKeys.has(key) || pendingKeys.has(key))) return false
  if (Date.now() - lastPlaybackAt < 700) return false

  if (key) pendingKeys.add(key)
  try {
    const settings = await loadSoundSettings()
    if (settings[category] === 'mute') return false

    const audio = new Audio(defaultSound)
    audio.preload = 'auto'
    await audio.play()
    lastPlaybackAt = Date.now()
    if (key) {
      playedKeys.add(key)
      if (playedKeys.size > 500) playedKeys.delete(playedKeys.values().next().value)
    }
    return true
  } catch {
    // Autoplay may be blocked until a user gesture; do not mark it as played.
    return false
  } finally {
    if (key) pendingKeys.delete(key)
  }
}
