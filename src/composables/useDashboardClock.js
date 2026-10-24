import { onBeforeUnmount, onMounted, ref } from 'vue'

const clockNow = ref(Date.now())
let clockTimer = null
let clockSubscribers = 0

/**
 * Share one timer across all visible dashboard countdowns instead of creating
 * an independent interval for every game card.
 */
export const useDashboardClock = () => {
  onMounted(() => {
    clockSubscribers += 1
    if (!clockTimer) {
      clockNow.value = Date.now()
      clockTimer = setInterval(() => {
        clockNow.value = Date.now()
      }, 1000)
    }
  })

  onBeforeUnmount(() => {
    clockSubscribers = Math.max(0, clockSubscribers - 1)
    if (clockSubscribers === 0 && clockTimer) {
      clearInterval(clockTimer)
      clockTimer = null
    }
  })

  return clockNow
}
