<template>
  <span>{{ remainingText }}</span>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardClock } from '@/composables/useDashboardClock'

const props = defineProps({
  endAt: {
    type: [String, Number],
    default: null,
  },
  serverOffset: {
    type: Number,
    default: 0,
  },
})

const clockNow = useDashboardClock()

const remainingText = computed(() => {
  if (!props.endAt) return ''

  const end = new Date(props.endAt).getTime()
  if (!Number.isFinite(end)) return ''

  const difference = end - (clockNow.value + props.serverOffset)
  if (difference <= 0) return ''

  const totalSeconds = Math.floor(difference / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
  }

  return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
})
</script>
