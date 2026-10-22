# Notification WAV sounds (build-time configuration)

Notification sounds are no longer configured in the Laravel admin panel. The Vue app maps each recognized event to a bundled WAV path in `src/services/notificationAudio.js`, in `NOTIFICATION_SOUND_PATHS`.

## Event-to-file map

| Event key | Path in Vue | Place the file at |
|---|---|---|
| `add_money` | `/sounds/add-money.wav` | `public/sounds/add-money.wav` |
| `withdraw` | `/sounds/withdrawal.wav` | `public/sounds/withdrawal.wav` |
| `debit` | `/sounds/bet-debit.wav` | `public/sounds/bet-debit.wav` |
| `credit` | `/sounds/wallet-credit.wav` | `public/sounds/wallet-credit.wav` |
| `winning` | `/sounds/winning.wav` | `public/sounds/winning.wav` |
| `result` | `/sounds/game-result.wav` | `public/sounds/game-result.wav` |
| `chat` | `/sounds/chat-message.wav` | `public/sounds/chat-message.wav` |
| `promotion` | `/sounds/promotion.wav` | `public/sounds/promotion.wav` |
| `welcome` | `/sounds/welcome.wav` | `public/sounds/welcome.wav` |
| `security` | `/sounds/security.wav` | `public/sounds/security.wav` |
| `default` | `/notification-tune.wav` | `public/notification-tune.wav` |

The file names above are the code's expected paths; the WAV assets must be added to those locations. If your file has a different name, edit its value in `NOTIFICATION_SOUND_PATHS` before building. Do not point at an admin-uploaded URL or a Laravel setting.

## Build and test

1. Add each WAV file to the matching `public/` path. Keep files small and use valid PCM WAV audio for broad WebView compatibility.
2. Edit `src/services/notificationAudio.js` to change a path or map multiple events to the same file intentionally.
3. Run `npm run build` for web or `npm run build:android` for Android, then deploy/install that new build.
4. Test each event in the app's Notifications screen. Browser autoplay rules can block sound until the user has interacted with the app; check the console for a missing WAV path or playback error.
5. Changing the path or replacing a WAV after a production build requires another build/deploy. There is no admin-side dynamic sound update anymore.

## Native Android background push limitation

The Vue WAV paths control HTML audio playback while the app is running and processing the notification feed. They do not change the Android OS sound for a push displayed while the app is in the background or terminated. Android system notifications use the native notification channel and a sound resource bundled under `android/app/src/main/res/raw/`; channel sound changes can require a new channel ID or clearing/reinstalling the app because Android persists channel settings. Configure and test that native sound separately if distinct background push sounds are required.
