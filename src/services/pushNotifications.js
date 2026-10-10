import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'
import api from '@/plugins/axios'
import { getAuthToken } from '@/utils/auth'
import router from '@/router'

let currentToken = ''
let currentPlatform = 'web'
let nativeListenersRegistered = false
let webMessageListenerRegistered = false

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}
const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

async function registerToken(token, platform) {
  if (!token) return false
  currentToken = token
  currentPlatform = platform
  const endpoint = getAuthToken() ? '/push/register-user' : '/push/subscribe'
  await api.post(endpoint, { token, platform })
  return true
}

export async function syncPushSubscription() {
  if (!currentToken) return false
  try {
    return await registerToken(currentToken, currentPlatform)
  } catch (error) {
    console.warn('Unable to sync push subscription:', error?.message || error)
    return false
  }
}

async function initNativePush() {
  const permission = await PushNotifications.checkPermissions()
  let receive = permission.receive
  if (receive === 'prompt' || receive === 'prompt-with-rationale') {
    receive = (await PushNotifications.requestPermissions()).receive
  }
  if (receive !== 'granted') {
    return {
      ok: false,
      message:
        'Notifications are blocked. Enable permission in your device or browser settings, then try again.',
    }
  }

  try {
    await PushNotifications.createChannel({
      id: 'game-alerts-v2',
      name: 'Game and account notifications',
      description: 'Public announcements and account updates',
      importance: 5,
      vibration: true,
      sound: 'notification_tune.wav',
    })
  } catch {
    // iOS has no Android notification channels; continue with normal registration.
  }

  if (!nativeListenersRegistered) {
    nativeListenersRegistered = true
    await PushNotifications.addListener('registration', async ({ value }) => {
      try {
        await registerToken(value, Capacitor.getPlatform())
      } catch (error) {
        console.warn('Unable to register device push token:', error?.message || error)
      }
    })
    await PushNotifications.addListener('registrationError', (error) => {
      console.warn('Native push registration failed:', error)
    })
    await PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
      const targetUrl = notification.data?.url || '/notifications'
      void router.push(targetUrl)
    })
    await LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) => {
      const targetUrl = notification.extra?.url || '/notifications'
      void router.push(targetUrl)
    })
    await PushNotifications.addListener('pushNotificationReceived', async (notification) => {
      // Remote notifications received in the foreground need a local notification to
      // remain visible and audible. Android channel sound follows the device settings.
      console.info('Native push received in foreground.', { platform: Capacitor.getPlatform(), hasTitle: Boolean(notification.title), hasBody: Boolean(notification.body) })
      try {
        const scheduled = await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.max(1, Date.now() % 2147483647),
              title: notification.title || 'Play Online Khaiwal',
              body: notification.body || '',
              schedule: { at: new Date(Date.now() + 250) },
              channelId: 'game-alerts-v2',
              sound: Capacitor.getPlatform() === 'ios' ? 'default' : 'notification_tune.wav',
              extra: notification.data || {},
            },
          ],
        })
        console.info('Foreground notification scheduled.', { count: scheduled?.notifications?.length ?? 1 })
      } catch (error) {
        console.warn('Unable to display foreground notification:', error?.message || error)
      }
    })
  }

  await PushNotifications.register()
  return { ok: true, message: 'Device notifications enabled.' }
}

async function initWebPush(allowPermissionPrompt = true) {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return { ok: false, message: 'This browser does not support push notifications.' }
  }
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.projectId ||
    !firebaseConfig.messagingSenderId ||
    !firebaseConfig.appId ||
    !vapidKey
  ) {
    return {
      ok: false,
      message: 'Browser push is not configured yet. Firebase web settings are required.',
    }
  }
  if (!window.isSecureContext) {
    return { ok: false, message: 'Browser notifications require HTTPS.' }
  }

  let permission = Notification.permission
  if (permission !== 'granted' && allowPermissionPrompt) {
    permission = await Notification.requestPermission()
  }
  if (permission !== 'granted') {
    return { ok: false, message: 'Notification permission was not granted.' }
  }

  const [appSdk, messagingSdk] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging.js'),
  ])
  if (!(await messagingSdk.isSupported())) {
    return { ok: false, message: 'Push messaging is not supported by this browser.' }
  }

  const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig)
  const messaging = messagingSdk.getMessaging(app)
  const serviceWorkerRegistration = await navigator.serviceWorker.register(
    '/firebase-messaging-sw.js',
  )
  const token = await messagingSdk.getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration,
  })
  if (!token) return { ok: false, message: 'Could not register this browser for notifications.' }

  await registerToken(token, 'web')
  if (!webMessageListenerRegistered) {
    webMessageListenerRegistered = true
    messagingSdk.onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'Play Online Khaiwal'
      const body = payload.notification?.body || ''
      const notification = new Notification(title, {
        body,
        icon: '/icons/icon-192.webp',
        badge: '/favicon.ico',
        silent: false,
      })
      void new Audio('/notification-tune.wav').play().catch(() => {})
      notification.onclick = () => {
        window.focus()
        window.location.assign(payload.data?.url || '/notifications')
      }
    })
  }
  return { ok: true, message: 'Browser notifications enabled.' }
}

export async function subscribeToPush() {
  try {
    if (Capacitor.isNativePlatform()) return await initNativePush()
    return await initWebPush()
  } catch (error) {
    console.error('Push notification setup failed:', error)
    return { ok: false, message: error?.message || 'Unable to enable notifications.' }
  }
}

export async function restorePushSubscription() {
  try {
    if (Capacitor.isNativePlatform())
      return { ok: false, message: 'Native registration is handled separately.' }
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return { ok: false, message: 'Browser push has not been granted.' }
    }
    return await initWebPush(false)
  } catch (error) {
    console.warn('Unable to restore browser push subscription:', error?.message || error)
    return { ok: false, message: 'Unable to restore browser notifications.' }
  }
}

export async function initNativePushNotifications() {
  if (!Capacitor.isNativePlatform()) return { ok: false, message: 'Not running as a native app.' }
  return subscribeToPush()
}
