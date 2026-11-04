/**
 * Tracks foreground interaction and emits one idle transition after the
 * configured inactivity window. Timer functions are injectable for tests.
 */
export function createPresenceActivityTracker({
  timeoutMs = 5 * 60 * 1000,
  onIdle = () => {},
  onResume = () => {},
  schedule = globalThis.setTimeout,
  cancel = globalThis.clearTimeout,
} = {}) {
  let timer = null
  let running = false
  let idle = false
  let delay = Math.max(1, Number(timeoutMs) || 5 * 60 * 1000)

  const clearTimer = () => {
    if (timer !== null) cancel(timer)
    timer = null
  }

  const scheduleIdle = () => {
    clearTimer()
    if (!running) return
    timer = schedule(() => {
      timer = null
      if (!running || idle) return
      idle = true
      onIdle()
    }, delay)
  }

  return {
    start() {
      running = true
      idle = false
      scheduleIdle()
    },
    activity() {
      if (!running) return
      const wasIdle = idle
      idle = false
      scheduleIdle()
      if (wasIdle) onResume()
    },
    suspend() {
      running = false
      clearTimer()
    },
    setTimeoutMs(value) {
      const next = Number(value)
      if (!Number.isFinite(next) || next <= 0) return
      delay = next
      scheduleIdle()
    },
    dispose() {
      running = false
      clearTimer()
    },
    get isIdle() {
      return idle
    },
  }
}
