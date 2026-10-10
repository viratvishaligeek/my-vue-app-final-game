<template>
  <div class="loading-state" :class="`loading-state--${variant}`" role="status" aria-label="Loading content">
    <template v-if="variant === 'play-game'">
      <div class="skeleton-block skeleton-game-heading"></div>
      <div class="skeleton-block skeleton-game-tabs"></div>
      <div class="skeleton-block skeleton-game-card"></div>
      <div class="skeleton-number-grid"><span v-for="item in 20" :key="item"
          class="skeleton-block skeleton-number"></span></div>
      <div class="skeleton-block skeleton-game-card"></div>
      <span class="visually-hidden">Loading game screen…</span>
    </template>
    <template v-else-if="variant === 'market-list'">
      <div v-for="item in count" :key="item" class="skeleton-market-card">
        <div class="d-flex align-items-center justify-content-between gap-3">
          <div class="skeleton-copy"><span class="skeleton-block skeleton-heading"></span><span
              class="skeleton-block skeleton-line"></span></div>
          <span class="skeleton-block skeleton-market-result"></span>
        </div>
        <span class="skeleton-block skeleton-market-footer"></span>
      </div>
      <span class="visually-hidden">Loading markets…</span>
    </template>
    <template v-else-if="variant === 'featured'">
      <div class="skeleton-market-card skeleton-featured-card">
        <span class="skeleton-block skeleton-heading"></span><span class="skeleton-block skeleton-line"></span><span
          class="skeleton-block skeleton-market-result"></span>
      </div>
      <span class="visually-hidden">Loading result…</span>
    </template>
    <template v-else>
      <span v-for="item in count" :key="item" class="skeleton-block skeleton-line"></span>
      <span class="visually-hidden">Loading…</span>
    </template>
  </div>
</template>
<script setup>
defineProps({ variant: { type: String, default: 'lines' }, count: { type: Number, default: 4 } })
</script>
<style scoped>
.loading-state {
  display: grid;
  gap: 12px;
  width: 100%;
}

.skeleton-block {
  display: block;
  border-radius: 10px;
  background: linear-gradient(100deg, #edf0f5 20%, #f8fafc 38%, #edf0f5 58%);
  background-size: 220% 100%;
  animation: skeleton-shimmer 1.35s ease-in-out infinite;
}

.skeleton-market-card {
  padding: 15px;
  border: 1px solid #e9edf3;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(24, 35, 56, .045);
}

.skeleton-copy {
  display: grid;
  gap: 9px;
  flex: 1;
  min-width: 0;
}

.skeleton-heading {
  width: min(52%, 180px);
  height: 16px;
}

.skeleton-line {
  width: 72%;
  height: 10px;
}

.skeleton-market-result {
  width: 54px;
  height: 42px;
  flex: 0 0 auto;
}

.skeleton-market-footer {
  height: 24px;
  margin-top: 14px;
}

.skeleton-featured-card {
  min-height: 110px;
}

.skeleton-featured-card .skeleton-market-result {
  margin-top: 12px;
}

.skeleton-game-heading {
  height: 64px;
  border-radius: 16px;
}

.skeleton-game-tabs {
  height: 48px;
  border-radius: 14px;
}

.skeleton-game-card {
  height: 90px;
  border-radius: 16px;
}

.skeleton-number-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.skeleton-number {
  height: 54px;
  border-radius: 12px;
}

.loading-state--lines .skeleton-line {
  width: 100%;
  height: 13px;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -120% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-block {
    animation: none;
  }
}
</style>
