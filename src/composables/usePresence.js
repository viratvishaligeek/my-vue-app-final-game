import { onMounted, onUnmounted, watch } from 'vue'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import api from '@/plugins/axios'
import { getAuthToken, useAuthStore } from '@/utils/auth'
import { acquirePusherChannel } from '@/services/pusherManager'
import { createPresenceActivityTracker } from '@/utils/presenceActivity'

const PRESENCE_HEARTBEAT_INTERVAL_MS = 15_000
const DEFAULT_IDLE_TIMEOUT_MS = 5 * 60 * 1000
let activePresenceDisconnect = null

export async function disconnectActivePresence() {
  if (activePresenceDisconnect) await activePresenceDisconnect()
}

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
  let heartbeatInFlight = null
  let lastHeartbeatState = ''
  let activitySinceHeartbeat = true
  let lastActivityAt = Date.now()
  let activityVersion = 0

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

  const stopHeartbeatTimer = () => {
    if (heartbeatTimer) window.clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }

  const heartbeat = () => {
    if (!sessionId || !currentUserId || disposed) return Promise.resolve(null)

    // If app state changed during an in-flight request, send one follow-up
    // with the latest state. This prevents a foreground heartbeat racing
    // with the background transition and leaving the old lease alive.
    if (heartbeatInFlight) {
      const pending = heartbeatInFlight
      return pending.then(() => (
        sessionId && !disposed && lastHeartbeatState !== appState
          ? heartbeat()
          : null
      ))
    }

    const requestedSessionId = sessionId
    const requestedState = appState
    const requestedActivity = activitySinceHeartbeat
    const requestedActivityVersion = activityVersion
    const requestedActivityAt = lastActivityAt
    heartbeatInFlight = api
      .post(
        '/presence/heartbeat',
        {
          session_id: requestedSessionId,
          platform: Capacitor.getPlatform(),
          app_state: requestedState,
          activity: requestedActivity,
          activity_at: requestedActivity ? new Date(requestedActivityAt).toISOString() : null,
        },
        { showGlobalLoader: false, timeout: 5000 },
      )
      .then((response) => {
        if (requestedSessionId === sessionId) {
          lastHeartbeatState = requestedState
          if (requestedActivity && requestedActivityVersion === activityVersion) {
            activitySinceHeartbeat = false
          }
          const idleTimeout = Number(response.data?.idle_timeout_seconds)
          if (Number.isFinite(idleTimeout) && idleTimeout > 0) {
            activityTracker.setTimeoutMs(idleTimeout * 1000)
          }
        }
        return response.data
      })
      .catch(() => {
        // Presence is best-effort; a transient API outage must not interrupt play.
        return null
      })
      .finally(() => {
        heartbeatInFlight = null
      })

    return heartbeatInFlight
  }

  const disconnect = async () => {
    const disconnectSessionId = sessionId
    sessionId = ''
    if (!disconnectSessionId) return

    stopHeartbeatTimer()
    activityTracker.suspend()

    // Wait for a heartbeat already on the wire, then end the lease. Otherwise
    // a late heartbeat could arrive after disconnect and reactivate the device.
    if (heartbeatInFlight) await heartbeatInFlight

    try {
      await api.delete('/presence/session', {
        data: { session_id: disconnectSessionId },
        showGlobalLoader: false,
        timeout: 3000,
      })
      lastHeartbeatState = ''
    } catch {
      // The server-side lease timeout remains the fallback on abrupt exits.
    }
  }

  const startHeartbeatTimer = () => {
    stopHeartbeatTimer()
    if (appState !== 'foreground' || !sessionId) return
    heartbeatTimer = window.setInterval(() => {
      if (appState === 'foreground') void heartbeat()
    }, PRESENCE_HEARTBEAT_INTERVAL_MS)
  }

  const recordUserActivity = () => {
    lastActivityAt = Date.now()
    activityVersion += 1
    activitySinceHeartbeat = true
  }

  const startForegroundPresence = (sendHeartbeat = true) => {
    if (!sessionId || disposed) return
    recordUserActivity()
    appState = 'foreground'
    activityTracker.start()
    startHeartbeatTimer()
    if (sendHeartbeat) void heartbeat()
  }

  const enterBackground = () => {
    if (!sessionId || appState === 'background') return
    appState = 'background'
    activityTracker.suspend()
    stopHeartbeatTimer()
    // One background lease starts a server-configured grace period. No
    // background timer keeps renewing it while the user is away.
    void heartbeat()
  }

  const onUserActivity = () => {
    if (!sessionId || disposed) return
    recordUserActivity()

    if (appState === 'background') {
      if (document.visibilityState !== 'hidden') startForegroundPresence(true)
      return
    }

    // In the idle state this invokes the resume callback; while active it
    // simply resets the local idle deadline without generating API traffic.
    activityTracker.activity()
  }

  const activityTracker = createPresenceActivityTracker({
    timeoutMs: DEFAULT_IDLE_TIMEOUT_MS,
    onIdle: () => {
      if (!sessionId || appState !== 'foreground' || disposed) return
      appState = 'idle'
      stopHeartbeatTimer()
      // The API ends this device's lease. Other active devices keep the
      // account online through the server-side multi-session check.
      void heartbeat()
    },
    onResume: () => {
      if (!sessionId || disposed) return
      appState = 'foreground'
      startHeartbeatTimer()
      void heartbeat()
    },
  })

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') enterBackground()
    else if (appState === 'background') startForegroundPresence(true)
  }

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
          if (appState === 'foreground') void heartbeat()
        },
      },
      onConnected: () => {
        if (appState === 'foreground') void heartbeat()
      },
      onDisconnected: () => {},
    })
  }

  const onPageShow = () => {
    // A page restored from the browser back/forward cache may have run
    // pagehide and ended its old lease. Recreate it without reusing an ended
    // in-memory session identifier.
    if (!sessionId && currentUserId && !disposed) {
      sessionId = getSessionId(currentUserId)
      startForegroundPresence(true)
      connectPresenceChannel()
    }
  }

  onMounted(() => {
    activePresenceDisconnect = disconnect
    currentUserId = authStore.userId
    currentToken = getAuthToken() || ''
    sessionId = currentUserId ? getSessionId(currentUserId) : ''
    appState = document.visibilityState === 'hidden' ? 'background' : 'foreground'

    if (appState === 'foreground') startForegroundPresence(true)
    else void heartbeat()

    connectPresenceChannel()
    stopUserWatch = watch(
      () => [authStore.userId, authStore.token],
      async ([nextUserId, nextToken]) => {
        if (
          String(nextUserId || '') === String(currentUserId || '') &&
          String(nextToken || '') === currentToken
        ) return

        await disconnect()
        releasePresenceChannel()
        currentUserId = nextUserId || null
        currentToken = String(nextToken || '')
        sessionId = currentUserId ? getSessionId(currentUserId) : ''
        lastHeartbeatState = ''

        if (sessionId) {
          appState = document.visibilityState === 'hidden' ? 'background' : 'foreground'
          if (appState === 'foreground') startForegroundPresence(true)
          else void heartbeat()
        }
        connectPresenceChannel()
      },
    )

    document.addEventListener('visibilitychange', onVisibilityChange)
    ;['pointerdown', 'keydown', 'touchstart', 'scroll', 'input'].forEach((eventName) => {
      document.addEventListener(eventName, onUserActivity, { passive: true })
    })
    window.addEventListener('pagehide', disconnect)
    window.addEventListener('pageshow', onPageShow)

    App.addListener('appStateChange', (state) => {
      if (state.isActive) {
        if (appState === 'background') startForegroundPresence(true)
      } else {
        enterBackground()
      }
    })
      .then((listener) => {
        if (disposed) void listener.remove()
        else appStateListener = listener
      })
      .catch(() => {})
  })

  onUnmounted(() => {
    disposed = true
    stopHeartbeatTimer()
    activityTracker.dispose()
    document.removeEventListener('visibilitychange', onVisibilityChange)
    ;['pointerdown', 'keydown', 'touchstart', 'scroll', 'input'].forEach((eventName) => {
      document.removeEventListener(eventName, onUserActivity)
    })
    window.removeEventListener('pagehide', disconnect)
    window.removeEventListener('pageshow', onPageShow)
    if (appStateListener) void appStateListener.remove()
    if (stopUserWatch) stopUserWatch()
    releasePresenceChannel()
    if (activePresenceDisconnect === disconnect) activePresenceDisconnect = null
    void disconnect()
  })

  return { disconnect }
}
