import { ref } from 'vue'

export const isGlobalLoading = ref(false)
let activeRequests = 0
let showTimer = null
let hideTimer = null

export function beginGlobalRequest() {
  activeRequests += 1
  if (activeRequests !== 1) return
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
  showTimer = setTimeout(() => {
    if (activeRequests > 0) isGlobalLoading.value = true
  }, 180)
}

export function endGlobalRequest() {
  activeRequests = Math.max(0, activeRequests - 1)
  if (activeRequests > 0) return
  if (showTimer) { clearTimeout(showTimer); showTimer = null }
  if (isGlobalLoading.value) {
    hideTimer = setTimeout(() => {
      if (activeRequests === 0) isGlobalLoading.value = false
      hideTimer = null
    }, 160)
  }
}
