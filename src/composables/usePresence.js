import { onMounted, onUnmounted, watch } from 'vue'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import api from '@/plugins/axios'
import { getAuthToken, useAuthStore } from '@/utils/auth'
import { acquirePusherChannel } from '@/services/pusherManager'
import { createSingleFlight } from '@/utils/singleFlight'

const PRESENCE_HEARTBEAT_INTERVAL_MS = 15_000

export function usePresence() {
  const authStore = useAuthStore()
  let sessionId = ''
  let currentUserId = null
  let currentToken = ''
  let stopUserWatch = null
  let appState = 'foreground'
  let heartbeatTimer = null
  let appStateListener = null
  let disposed = false
  let presenceSubscription = null

  const getSessionId = (userId) => {
    const key = 'user_presence_session_id:' + String(userId)
    let value = sessionStorage.getItem(key)
    if (!value) {
      value =
        globalThis.crypto?.randomUUID?.() ||
        'presence-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)
      sessionStorage.setItem(key, value)
    }
    return value
  }

  // Visibility and Capacitor lifecycle events can fire close together. Share
  // one request while it is in flight instead of sending duplicate heartbeats.
  const heartbeat = createSingleFlight(() => {
    if (!sessionId || !currentUserId || disposed) return Promise.resolve()

    return api
      .post(
        '/presence/heartbeat',
        {
          session_id: sessionId,
          platform: Capacitor.getPlatform(),
          app_state: appState,
        },
        { showGlobalLoader: false },
      )
      .catch(() => {
        // Presence is best-effort; a transient API outage must not interrupt play.
      })
  })

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

  // Presence membership is per account, not site-wide: players can only
  // join their own channel, while same-site Admins can inspect that account.
  // The shared manager reuses the same Pusher connection as Live Support.
  const releasePresenceChannel = () => {
    presenceSubscription?.release()
    presenceSubscription = null
  }

  const connectPresenceChannel = () => {
    releasePresenceChannel()
    const token = getAuthToken()
    if (!currentUserId || !token || typeof window.Pusher !== 'function') return

    presenceSubscription = acquirePusherChannel({
      PusherConstructor: window.Pusher,
      key: import.meta.env.VITE_PUSHER_APP_KEY,
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      authEndpoint: import.meta.env.VITE_PUSHER_AUTH_ENDPOINT || '/api/v1/broadcasting/auth',
      token,
      channelName: 'presence-user-presence.' + currentUserId,
      events: {
        'pusher:subscription_succeeded': () => {
          // Refresh the persisted session lease after a successful reconnect.
          void heartbeat()
        },
      },
      onConnected: () => void heartbeat(),
      onDisconnected: () => {},
    })
  }

  onMounted(() => {
    currentUserId = authStore.userId
    currentToken = getAuthToken() || ''
    sessionId = currentUserId ? getSessionId(currentUserId) : ''
    void heartbeat()
    connectPresenceChannel()
    stopUserWatch = watch(
      () => [authStore.userId, authStore.token],
      async ([nextUserId, nextToken]) => {
        if (
          String(nextUserId || '') === String(currentUserId || '') &&
          String(nextToken || '') === currentToken
        )
          return
        await disconnect()
        releasePresenceChannel()
        currentUserId = nextUserId || null
        currentToken = String(nextToken || '')
        sessionId = currentUserId ? getSessionId(currentUserId) : ''
        if (sessionId) void heartbeat()
        connectPresenceChannel()
      },
    )
    // Persisted presence is refreshed every 15s, matching the server write
    // cadence; the server's 30s lease still expires sessions after suspension.
    heartbeatTimer = window.setInterval(() => void heartbeat(), PRESENCE_HEARTBEAT_INTERVAL_MS)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', disconnect)

    App.addListener('appStateChange', (state) => {
      appState = state.isActive ? 'foreground' : 'background'
      void heartbeat()
    })
      .then((listener) => {
        if (disposed) void listener.remove()
        else appStateListener = listener
      })
      .catch(() => {})
  })

  onUnmounted(() => {
    disposed = true
    if (heartbeatTimer) window.clearInterval(heartbeatTimer)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('pagehide', disconnect)
    if (appStateListener) void appStateListener.remove()
    if (stopUserWatch) stopUserWatch()
    releasePresenceChannel()
    void disconnect()
  })
}
