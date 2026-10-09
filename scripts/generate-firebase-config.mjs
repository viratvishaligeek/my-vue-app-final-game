import { writeFile } from 'node:fs/promises'
import { loadEnv } from 'vite'

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '')

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || '',
}
const vapidKey = env.VITE_FIREBASE_VAPID_KEY || process.env.VITE_FIREBASE_VAPID_KEY || ''
const output = `// Generated from VITE_FIREBASE_* build environment values. Do not put service-account secrets here.\nself.FIREBASE_CONFIG = ${JSON.stringify(config, null, 2)};\nself.FIREBASE_VAPID_KEY = ${JSON.stringify(vapidKey)};\n`
await writeFile(new URL('../public/firebase-config.js', import.meta.url), output, 'utf8')
