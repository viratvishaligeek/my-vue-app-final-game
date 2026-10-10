importScripts('/firebase-config.js')
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js')

if (self.FIREBASE_CONFIG && self.FIREBASE_CONFIG.apiKey && self.FIREBASE_CONFIG.projectId) {
  firebase.initializeApp(self.FIREBASE_CONFIG)
  const messaging = firebase.messaging()

  messaging.onBackgroundMessage((payload) => {
    // FCM automatically displays messages containing a notification payload while
    // this app is in the background. Only synthesize a notification for data-only
    // messages to avoid showing every push twice.
    if (payload.notification) return

    const title = payload.notification?.title || 'Play Online Khaiwal'
    const options = {
      body: payload.notification?.body || '',
      icon: '/icons/icon-192.webp',
      badge: '/favicon.ico',
      data: { url: payload.data?.url || '/notifications' },
      silent: false,
      vibrate: [180, 90, 180],
    }
    self.registration.showNotification(title, options)
  })
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL(event.notification.data?.url || '/notifications', self.location.origin).href
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const client of windows) {
      if ('focus' in client) {
        await client.focus()
        if ('navigate' in client) await client.navigate(target)
        return
      }
    }
    await self.clients.openWindow(target)
  })())
})
