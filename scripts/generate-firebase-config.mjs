import { writeFile } from 'node:fs/promises'

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || '',
}
const vapidKey = process.env.VITE_FIREBASE_VAPID_KEY || ''
const output = `// Generated from VITE_FIREBASE_* build environment values. Do not put service-account secrets here.\nself.FIREBASE_CONFIG = ${JSON.stringify(config, null, 2)};\nself.FIREBASE_VAPID_KEY = ${JSON.stringify(vapidKey)};\n`
await writeFile(new URL('../public/firebase-config.js', import.meta.url), output, 'utf8')
