<script setup>
import { onMounted } from 'vue'
import { isGlobalLoading } from '@/utils/requestLoader'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'

onMounted(async () => {
  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#212529' })
    await StatusBar.setOverlaysWebView({ overlay: false })
  } catch (err) {
    console.log('Not on mobile native app:', err)
  }

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
  </div>
</template>

<style>
body { background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
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
}
</style>
