# Push notification setup

The code uses Firebase Cloud Messaging (FCM), which has a no-cost tier. Delivery still depends on configuring a Firebase project and the operating system/browser permission.

## Backend environment

Set these on the Laravel server:

- `FCM_PROJECT_ID`: Firebase project ID.
- `FCM_SERVICE_ACCOUNT_JSON`: the complete JSON contents of a Firebase service-account key with permission to send FCM messages. Keep this secret on the server only; never put it in the frontend repository.

Then run `php artisan migrate --force`. The authenticated admin broadcast page is `/admin/push-notifications`. User-targeted notifications created through the existing `NotificationService` are also sent to tokens linked to that user.

## Web/Chrome build environment

Set these before building/deploying the Vue app:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_VAPID_KEY` (Firebase Console → Project settings → Cloud Messaging → Web Push certificates)

The build/dev scripts generate `public/firebase-config.js` from those values. Serve the site over HTTPS. Browser users must opt in from the Notifications page; browsers do not permit websites to force notification permission or sound.

## Android app

Add the Firebase project's matching `google-services.json` to `android/app/google-services.json` (do not commit private service-account keys). Then run:

```sh
npm ci
npx cap sync android
cd android && ./gradlew assembleDebug
```

Install the newly built APK and grant notification permission when asked. The app registers a native FCM token on launch and links it to the signed-in account after login.

## Sound

FCM payloads request the system default notification sound on Android/iOS. Android uses the notification channel and the user's device settings. iOS and browsers control sound behavior; web pages cannot reliably force an audible tune while backgrounded or when the device/browser is muted. A branded custom ringtone requires adding an actual audio resource and configuring native notification channels/platform assets.
