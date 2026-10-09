<template>
<div v-if="game" class="row g-2 px-3 mb-4">
      <div class="col-12">
        <div class="live-result-box">
          <div class="horizontal-result-content">
            <div>
              <h4 class="city-name text-white mb-0">
                {{ game.name }}
              </h4>
              <small class="opacity-75  text-white">
                Result Time:
                {{ formatTime(game.result_time) }}
              </small>
            </div>
            <span class="live-tag text-white">
              <span class="live-dot"></span>
              {{ game.is_playable ? 'Live Market' : 'Latest Result' }}
            </span>
            <h3 class="result-number mb-0">
              {{ game.last_result ?? '--' }}
            </h3>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
defineProps({
  game: { type: Object, required: true },
  formatTime: { type: Function, required: true },
})
</script>
