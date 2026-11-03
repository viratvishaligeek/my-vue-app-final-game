import { onMounted, onUnmounted, watch } from 'vue'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import api from '@/plugins/axios'
import { useAuthStore } from '@/utils/auth'

export function usePresence() {
  const authStore = useAuthStore()
  let sessionId = ''
  let currentUserId = null
  let stopUserWatch = null
  let appState = 'foreground'
  let heartbeatTimer = null
  let appStateListener = null
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

  const heartbeat = async () => {
    if (!sessionId || !currentUserId || disposed) return
    try {
      await api.post('/presence/heartbeat', {
        session_id: sessionId,
        platform: Capacitor.getPlatform(),
        app_state: appState,
      }, { showGlobalLoader: false })
    } catch {
      // Presence is best-effort; a transient API outage must not interrupt play.
    }
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
    // The server expires stale sessions after 30 seconds if mobile OS suspension stops timers.
    heartbeatTimer = window.setInterval(() => void heartbeat(), 5000)
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
