import { onMounted, onUnmounted } from 'vue'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import api from '@/plugins/axios'

export function usePresence() {
  let sessionId = ''
  let appState = 'foreground'
  let heartbeatTimer = null
  let appStateListener = null
  let disposed = false

  const getSessionId = () => {
    const key = 'user_presence_session_id'
    let value = sessionStorage.getItem(key)
    if (!value) {
      value = globalThis.crypto?.randomUUID?.()
        || 'presence-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)
      sessionStorage.setItem(key, value)
    }
    return value
  }

  const heartbeat = async () => {
    if (!sessionId || disposed) return
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
    sessionId = getSessionId()
    void heartbeat()
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
    void disconnect()
  })
}
