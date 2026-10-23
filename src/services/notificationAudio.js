/*
 * Notification sounds are deliberately bundled with the Vue app.
 *
 * Put the custom WAV files in public/sounds/ and edit the paths below before building.
 * Example: public/sounds/new-chat.wav is referenced as /sounds/new-chat.wav.
 * These paths are bundled with the web assets; changing a server setting after
 * a build will not change them. Rebuild and redeploy the web app/Android app
 * after changing a path or replacing a bundled file.
 */
const DEFAULT_SOUND = '/sounds/chalo.wav' // Custom app tune; never fall back to the OS default.

export const NOTIFICATION_SOUND_PATHS = Object.freeze({
  add_money: '/sounds/chalo.wav',
  withdraw: '/sounds/ahh.wav',
  debit: '/sounds/wow.wav',
  credit: '/sounds/ahh.wav',
  winning: '/sounds/wow.wav',
  result: '/sounds/faaah.wav',
  chat: '/sounds/ahh.wav',
  promotion: '/sounds/ahh.wav',
  welcome: '/sounds/ahh.wav',
  security: '/sounds/faaah.wav',
  default: DEFAULT_SOUND,
})

const playedKeys = new Set()
const pendingKeys = new Set()
let playbackQueue = Promise.resolve()

export function notificationEventFromText(value = '') {
  const text = String(value).toLowerCase()
  if (/support|chat|message from support|new message/.test(text)) return 'chat'
  if (/winning|winner|you win|prize|winnings/.test(text)) return 'winning'
  if (/result|market result|game result/.test(text)) return 'result'
  if (/withdraw|withdrawal/.test(text)) return 'withdraw'
  if (/debit|debited|bet placed|betting/.test(text)) return 'debit'
  if (/add money|deposit request|deposit added|money added|wallet added/.test(text))
    return 'add_money'
  if (/credit|credited|wallet credit|wallet/.test(text)) return 'credit'
  if (/offer|bonus|discount|promotion|promo/.test(text)) return 'promotion'
  if (/welcome|registered|registration/.test(text)) return 'welcome'
  if (/security|password|login|verification|otp/.test(text)) return 'security'
  return 'default'
}

/**
 * Plays the event's statically bundled WAV path. Dedupe IDs prevent duplicate
 * delivery; queued playback preserves distinct events that arrive close together.
 */
export async function playNotificationSound(event, dedupeKey = '') {
  const category = Object.hasOwn(NOTIFICATION_SOUND_PATHS, event) ? event : 'default'
  const source = NOTIFICATION_SOUND_PATHS[category] || DEFAULT_SOUND
  const key = dedupeKey ? category + ':' + dedupeKey : ''

  if (key && (playedKeys.has(key) || pendingKeys.has(key))) return false
  if (key) pendingKeys.add(key)

  try {
    const task = playbackQueue.then(async () => {
      const audio = new Audio(source)
      audio.preload = 'auto'
      await new Promise((resolve, reject) => {
        audio.addEventListener('ended', resolve, { once: true })
        audio.addEventListener(
          'error',
          () => reject(new Error('Notification WAV failed to load: ' + source)),
          { once: true },
        )
        audio.play().catch(reject)
      })
    })
    playbackQueue = task.catch(() => undefined)
    await task

    if (key) {
      playedKeys.add(key)
      if (playedKeys.size > 500) playedKeys.delete(playedKeys.values().next().value)
    }
    return true
  } catch (error) {
    console.warn('Unable to play notification sound:', error?.message || error)
    return false
  } finally {
    if (key) pendingKeys.delete(key)
  }
}
