<script setup>
import { onMounted, ref } from 'vue'
import { isGlobalLoading } from '@/utils/requestLoader'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import router from '@/router'
import { initNativePushNotifications, restorePushSubscription, syncPushSubscription } from '@/services/pushNotifications'

const showSplash = ref(true)
const pushPermissionNotice = ref('')

onMounted(async () => {
  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#212529' })
    await StatusBar.setOverlaysWebView({ overlay: false })
  } catch (err) {
    console.log('Not on mobile native app:', err)
  }

  window.setTimeout(() => { showSplash.value = false }, 1150)
  void initNativePushNotifications().then((result) => {
    if (!result?.ok && result?.message && result.message !== 'Not running as a native app.') {
      pushPermissionNotice.value = result.message
    }
  })
  void restorePushSubscription()
  router.afterEach(() => { void syncPushSubscription() })

  // Handle verified HTTPS App Links when the payment provider returns to the app.
  // Only accept the production wallet return URL; never navigate to arbitrary incoming URLs.
  void App.addListener('appUrlOpen', async ({ url }) => {
    if (!url) return

    try {
      const incoming = new URL(url)
      if (incoming.protocol !== 'https:' || incoming.hostname !== 'playonlinekhaiwal.com') return
      if (incoming.pathname !== '/wallet/add') return

      const query = Object.fromEntries(incoming.searchParams.entries())
      await router.replace({ path: incoming.pathname, query })
    } catch (error) {
      console.warn('Unable to handle payment return link:', error)
    }
  })

  let backButtonPressedOnce = false

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back()
    } else {
      if (backButtonPressedOnce) {
        App.exitApp()
      } else {
        backButtonPressedOnce = true
        alert('Press back again to exit')
        setTimeout(() => {
          backButtonPressedOnce = false
        }, 2000)
      }
    }
  })
})
</script>

<template>
  <div class="app-root">
    <div v-if="isGlobalLoading" class="global-loading-indicator" role="status" aria-live="polite">
      <span class="global-loading-indicator__bar"></span>
      <span class="visually-hidden">Loading content…</span>
    </div>
    <router-view />
    <div v-if="pushPermissionNotice" class="push-permission-notice" role="alert">
      <span>{{ pushPermissionNotice }}</span>
      <button type="button" aria-label="Dismiss notification permission message" @click="pushPermissionNotice = ''">Dismiss</button>
    </div>
    <Transition name="launch-splash">
      <div v-if="showSplash" class="launch-splash" role="status" aria-label="Loading Play Online Khaiwal">
        <div class="launch-splash__glow launch-splash__glow--one"></div>
        <div class="launch-splash__glow launch-splash__glow--two"></div>
        <div class="launch-splash__content">
          <div class="launch-splash__logo"><span>GK</span></div>
          <p class="launch-splash__eyebrow">WELCOME TO</p>
          <h1>PLAY ONLINE KHAIWAL</h1>
          <p class="launch-splash__tagline">Fast results. Smooth play.</p>
          <div class="launch-splash__loader" aria-hidden="true"><span></span><span></span><span></span></div>
          <p class="launch-splash__status">Preparing your experience…</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
.push-permission-notice { position: fixed; left: 12px; right: 12px; bottom: 16px; z-index: 10001; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-radius: 10px; background: #fff3cd; color: #664d03; box-shadow: 0 4px 18px rgba(0,0,0,.18); font-size: 14px; }
.push-permission-notice button { flex-shrink: 0; border: 0; border-radius: 6px; padding: 6px 10px; background: #664d03; color: #fff; }
body { background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
.launch-splash { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; overflow: hidden; color: #fff; background: radial-gradient(ellipse at 50% 35%, #263b48 0%, #17232f 45%, #101820 100%); }
.launch-splash__content { position: relative; z-index: 1; width: min(88vw, 420px); text-align: center; animation: splash-rise .65s cubic-bezier(.2,.8,.2,1) both; }
.launch-splash__logo { width: 94px; height: 94px; display: grid; place-items: center; margin: 0 auto 24px; border: 1px solid rgba(255,255,255,.35); border-radius: 28px; background: linear-gradient(145deg,#22c997,#128b76); box-shadow: 0 14px 40px rgba(20,201,151,.25), inset 0 1px rgba(255,255,255,.45); transform: rotate(-5deg); }
.launch-splash__logo span { font-size: 34px; font-weight: 900; letter-spacing: -3px; transform: rotate(5deg); }
.launch-splash__eyebrow { margin: 0 0 7px; color: #9fe8d6; font-size: 10px; font-weight: 800; letter-spacing: .34em; }
.launch-splash h1 { margin: 0; font-size: clamp(21px,6vw,30px); font-weight: 900; letter-spacing: .035em; }
.launch-splash__tagline { margin: 9px 0 28px; color: #c1cbd2; font-size: 13px; letter-spacing: .06em; }
.launch-splash__loader { display: flex; align-items: center; justify-content: center; gap: 7px; height: 20px; }
.launch-splash__loader span { width: 6px; height: 6px; border-radius: 50%; background: #22c997; animation: splash-dot .8s ease-in-out infinite alternate; }
.launch-splash__loader span:nth-child(2) { animation-delay: .16s; } .launch-splash__loader span:nth-child(3) { animation-delay: .32s; }
.launch-splash__status { margin: 9px 0 0; color: #84959f; font-size: 11px; }
.launch-splash__glow { position: absolute; width: 58vw; aspect-ratio: 1; border-radius: 50%; filter: blur(55px); opacity: .17; animation: splash-float 5s ease-in-out infinite alternate; }
.launch-splash__glow--one { top: -20%; left: -20%; background: #20c997; } .launch-splash__glow--two { right: -24%; bottom: -28%; background: #4175ff; animation-delay: -2s; }
.launch-splash-enter-active, .launch-splash-leave-active { transition: opacity .35s ease, transform .35s ease; } .launch-splash-leave-to { opacity: 0; transform: scale(1.02); }
@keyframes splash-rise { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes splash-dot { from { opacity: .35; transform: translateY(0) scale(.8); } to { opacity: 1; transform: translateY(-4px) scale(1.2); } }
@keyframes splash-float { to { transform: translate3d(12%,8%,0) scale(1.12); } }
.global-loading-indicator {
  position: fixed; inset: 0 0 auto; height: 3px; overflow: hidden;
  z-index: 2000; pointer-events: none; background: rgba(37,15,66,.08);
}
.global-loading-indicator__bar {
  display: block; width: 38%; height: 100%; border-radius: 0 4px 4px 0;
  background: linear-gradient(90deg,#20c997,#ffc107,#bb86fc);
  box-shadow: 0 0 12px rgba(32,201,151,.35);
  animation: global-loading-progress 1.1s ease-in-out infinite;
  transform-origin: left center;
}
@keyframes global-loading-progress {
  0% { transform: translateX(-110%) scaleX(.55); }
  50% { transform: translateX(110%) scaleX(1); }
  100% { transform: translateX(300%) scaleX(.65); }
}
@media (prefers-reduced-motion: reduce) {
  .global-loading-indicator__bar { animation: none; width: 100%; }
  .launch-splash *, .launch-splash { animation: none !important; transition: none !important; }
}
</style>
