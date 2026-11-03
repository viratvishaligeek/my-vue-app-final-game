import { onMounted, onUnmounted, watch } from 'vue'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import api from '@/plugins/axios'
import { useAuthStore } from '@/utils/auth'

const PRESENCE_HEARTBEAT_INTERVAL_MS = 15_000

export function usePresence() {
  const authStore = useAuthStore()
  let sessionId = ''
  let currentUserId = null
  let stopUserWatch = null
  let appState = 'foreground'
  let heartbeatTimer = null
  let appStateListener = null
  let heartbeatInFlight = null
  let disposed = false

  const getSessionId = (userId) => {
    const key = 'user_presence_session_id:' + String(userId)
    let value = sessionStorage.getItem(key)
    if (!value) {
      value = globalThis.crypto?.randomUUID?.()
        || 'presence-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)
      sessionStorage.setItem(key, value)
    }
    return value
  }

  // Visibility and Capacitor lifecycle events can fire close together. Share
  // one request while it is in flight instead of sending duplicate heartbeats.
  const heartbeat = () => {
    if (!sessionId || !currentUserId || disposed) return Promise.resolve()
    if (heartbeatInFlight) return heartbeatInFlight

    heartbeatInFlight = api.post('/presence/heartbeat', {
      session_id: sessionId,
      platform: Capacitor.getPlatform(),
      app_state: appState,
    }, { showGlobalLoader: false })
      .catch(() => {
        // Presence is best-effort; a transient API outage must not interrupt play.
      })
      .finally(() => {
        heartbeatInFlight = null
      })

    return heartbeatInFlight
  }

  const disconnect = async () => {
    if (!sessionId) return
    try {
      await api.delete('/presence/session', {
        data: { session_id: sessionId },
        showGlobalLoader: false,
      })
    } catch {
      // The server-side heartbeat timeout remains the fallback on abrupt exits.
    }
  }

  const onVisibilityChange = () => {
    appState = document.visibilityState === 'hidden' ? 'background' : 'foreground'
    void heartbeat()
  }

  onMounted(() => {
    currentUserId = authStore.userId
    sessionId = currentUserId ? getSessionId(currentUserId) : ''
    void heartbeat()
    stopUserWatch = watch(() => authStore.userId, async nextUserId => {
      if (String(nextUserId || '') === String(currentUserId || '')) return
      await disconnect()
      currentUserId = nextUserId || null
      sessionId = currentUserId ? getSessionId(currentUserId) : ''
      if (sessionId) void heartbeat()
    })
    // Persisted presence is refreshed every 15s, matching the server write
    // cadence; the server's 30s lease still expires sessions after suspension.
    heartbeatTimer = window.setInterval(() => void heartbeat(), PRESENCE_HEARTBEAT_INTERVAL_MS)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', disconnect)

    App.addListener('appStateChange', state => {
      appState = state.isActive ? 'foreground' : 'background'
      void heartbeat()
    }).then(listener => {
      if (disposed) void listener.remove()
      else appStateListener = listener
    }).catch(() => {})
  })

  onUnmounted(() => {
    disposed = true
    if (heartbeatTimer) window.clearInterval(heartbeatTimer)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('pagehide', disconnect)
    if (appStateListener) void appStateListener.remove()
    if (stopUserWatch) stopUserWatch()
    void disconnect()
  })
}
