<template>
  <div class="content-area">
    <div id="heroCarousel" class="carousel slide m-1 mb-2" data-bs-ride="carousel">
      <div class="carousel-indicators" v-if="banners.length > 1">
        <button v-for="(banner, index) in banners" :key="banner.id" type="button" data-bs-target="#heroCarousel"
          :data-bs-slide-to="index" :class="{ active: index === 0 }"
          :aria-current="index === 0 ? 'true' : undefined"></button>
      </div>

      <div class="carousel-inner rounded-3">
        <div v-for="(banner, index) in banners" :key="banner.id" class="carousel-item" :class="{ active: index === 0 }">
          <img :src="banner.imageUrl" class="d-block w-100" :alt="banner.title || 'Hero Banner'" />
        </div>
      </div>
    </div>

    <div class="row m-2">
      <div class="col-12 border rounded-2 overflow-hidden notice-wrapper">
        <div class="notice-track fw-bold">
          <span class="notice-text">
            {{ noticeText }}
          </span>
          <span class="notice-text" aria-hidden="true">
            {{ noticeText }}
          </span>
        </div>
      </div>
    </div>

    <div class="row g-2 mb-4 ms-2 me-2">
      <div class="col-4">
        <router-link to="/wallet/add" class="btn bg-success w-100 text-light">
          <span class="icon-3d">💰</span>
          <span>Add Money</span>
        </router-link>
      </div>
      <div class="col-4">
        <router-link to="/wallet/withdraw" class="btn bg-danger w-100 text-light">
          <span class="icon-3d">💸</span>
          Withdraw
        </router-link>
      </div>
      <div class="col-4">
        <router-link to="/live-support" class="btn bg-primary w-100 text-light">
          <span class="icon-3d">🎧</span>
          Support
        </router-link>
      </div>
    </div>

    <div class="d-flex justify-content-between align-items-center px-2 mb-2">
      <h6 class="p-1 pb-0 text-black fw-bold mb-0">🗓️ Today's Result</h6>
      <span class="badge bg-primary-soft text-primary"> {{ marketCount }} Markets </span>
    </div>
    <div v-if="isLoading" class="col-12 text-center py-3">
      <div class="spinner-border spinner-border-sm text-primary"></div>
    </div>
    <div v-else-if="featuredGame" class="row g-2 px-3 mb-4">
      <div class="col-12">
        <div class="live-result-box">
          <div class="horizontal-result-content">
            <div>
              <h4 class="city-name mb-0">
                {{ featuredGame.name }}
              </h4>
              <small class="opacity-75">
                Result Time:
                {{ formatTime(featuredGame.result_time) }}
              </small>
            </div>
            <span class="live-tag">
              <span class="live-dot"></span>
              {{ featuredGame.is_playable ? 'Live Market' : 'Latest Result' }}
            </span>
            <h3 class="result-number mb-0">
              {{ featuredGame.last_result ?? '--' }}
            </h3>
          </div>
        </div>
      </div>
    </div>

    <h3 class="p-1 pt-0 text-black fw-bold">📊 Live Market</h3>

    <div v-if="errorMessage" class="alert alert-danger mx-2">
      {{ errorMessage }}
      <button class="btn btn-sm btn-danger ms-2" @click="fetchGames">Retry</button>
    </div>

    <div v-else-if="!isLoading && games.length === 0" class="card mx-2 border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <div class="fs-1">📊</div>
        <h5 class="fw-bold mt-2">No Markets Available</h5>
        <p class="text-muted mb-0">Please check again later.</p>
      </div>
    </div>

    <div v-else class="row g-3 ms-2 me-2">
      <div v-for="(game, index) in games" :key="game.id" class="col-12">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden custom-card">
          <div class="bg-white p-3 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-geo-alt-fill fs-2 icon-color"></i>
              <div>
                <h6 class="fw-bold text-dark mb-0 text-uppercase fs-3">
                  {{ game.name }}
                </h6>
                <span class="small fw-semibold d-flex align-items-center gap-1"
                  :class="isGamePlayable(game) ? 'text-success' : 'text-danger'">
                  <span class="dot-running" :class="{
                    'bg-danger': !isGamePlayable(game),
                  }"></span>
                  {{ getGameStatus(game) }}
                </span>
              </div>
            </div>
            <div class="text-center">
              <div class="fw-bold fs-3 text-dark">
                {{ game.last_result ?? '--' }}
              </div>
              <div v-if="isGamePlayable(game)" class="text-danger small fw-semibold">
                {{ getRemainingTime(game) }}
              </div>
              <div v-else class="text-muted small fw-semibold">Closed</div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <router-link :to="`/monthly-chart?game=${game.id}`"
                class="btn btn-light border btn-sm px-2 py-1 rounded-3 fw-semibold text-secondary">
                <i class="bi bi-bar-chart-line me-1"></i>
                Chart
              </router-link>

              <router-link v-if="isGamePlayable(game)" :to="{
                name: 'play-game',
                params: {
                  id: game.id,
                },
              }"
                class="btn btn-success btn-sm px-3 py-2 rounded-pill fw-bold d-flex align-items-center gap-1 shadow-sm">
                <i class="bi bi-play-circle-fill fs-4"></i>
                Play
              </router-link>
              <button v-else class="btn btn-secondary btn-sm px-3 py-2 rounded-pill fw-bold" disabled>
                Closed
              </button>
            </div>
          </div>
          <div
            class="bg-success text-white px-3 py-2 d-flex justify-content-between align-items-center fs-7 fw-semibold">
            <span>
              Last Result:
              {{ game.last_result ?? '--' }}
            </span>
            <span>
              RESULT TIME:
              {{ formatTime(game.result_time) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../plugins/axios'

const games = ref([])
const featuredGame = ref(null)
const banners = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const noticeText = ref('Welcome to our gaming platform')

const currentTime = ref(Date.now())
const serverOffset = ref(0)
let clockTimer = null
let refreshTimer = null

const serverNow = computed(() => {
  return new Date(currentTime.value + serverOffset.value)
})

const marketCount = computed(() => {
  return games.value.length
})

const syncServerTime = (serverTime) => {
  if (!serverTime) {
    return
  }
  const serverTimestamp = new Date(serverTime).getTime()
  if (Number.isNaN(serverTimestamp)) {
    return
  }
  serverOffset.value = serverTimestamp - Date.now()
}

const parseTime = (time) => {
  if (!time) {
    return null
  }
  const parts = time.split(':').map(Number)
  if (parts.length < 2) {
    return null
  }
  const hours = parts[0]
  const minutes = parts[1]
  const seconds = parts[2] || 0
  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
    return null
  }
  return {
    hours,
    minutes,
    seconds,
  }
}

const getPlayWindow = (game) => {
  const start = parseTime(game.play_start)
  const end = parseTime(game.play_end)
  if (!start || !end) {
    return null
  }
  const now = serverNow.value
  const startDate = new Date(now)
  startDate.setHours(start.hours, start.minutes, start.seconds, 0)
  const endDate = new Date(now)
  endDate.setHours(end.hours, end.minutes, end.seconds, 0)
  if (endDate.getTime() <= startDate.getTime()) {
    if (now.getTime() >= startDate.getTime()) {
      endDate.setDate(endDate.getDate() + 1)
    } else {
      startDate.setDate(startDate.getDate() - 1)
    }
  }
  return {
    start: startDate,
    end: endDate,
  }
}

const isGamePlayable = (game) => {
  if (game.status !== 'active') {
    return false
  }
  const window = getPlayWindow(game)
  if (!window) {
    return false
  }
  const now = serverNow.value.getTime()
  return now >= window.start.getTime() && now < window.end.getTime()
}

const getRemainingTime = (game) => {
  if (!isGamePlayable(game)) {
    return null
  }
  const window = getPlayWindow(game)
  if (!window) {
    return null
  }
  const diff = window.end.getTime() - serverNow.value.getTime()
  if (diff <= 0) {
    return null
  }
  const totalSeconds = Math.floor(diff / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
  }
  return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
}

const getGameStatus = (game) => {
  if (game.status !== 'active') {
    return 'CLOSED'
  }
  return isGamePlayable(game) ? 'RUNNING' : 'CLOSED'
}

const formatTime = (time) => {
  if (!time) {
    return '--'
  }
  const parsed = parseTime(time)
  if (!parsed) {
    return '--'
  }
  const date = new Date()
  date.setHours(parsed.hours, parsed.minutes, parsed.seconds, 0)
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const fetchGames = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/games/list')
    const data = response.data
    if (!data?.status) {
      throw new Error(data?.message || 'Unable to load games.')
    }
    syncServerTime(data.server_time)
    banners.value = Array.isArray(data.banners)
      ? data.banners.map((banner) => ({
        id: banner.id,
        title: banner.name || 'Banner',
        imageUrl: banner.image_url,
      }))
      : []
    featuredGame.value = data.featured_game || null
    games.value = Array.isArray(data.games) ? data.games : []
  } catch (error) {
    console.error('Games API Error:', error)
    errorMessage.value = error.response?.data?.message || error.message || 'Unable to load games.'
  } finally {
    isLoading.value = false
  }
}

const startRefreshTimer = () => {
  refreshTimer = setInterval(() => {
    fetchGames()
  }, 30000)
}
onMounted(async () => {
  await fetchGames()
  clockTimer = setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
  startRefreshTimer()
})

onUnmounted(() => {
  if (clockTimer) {
    clearInterval(clockTimer)
    clockTimer = null
  }
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style scoped>
.notice-wrapper {
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  background: #fff;
  height: 38px;
  display: flex;
  align-items: center;
}

.notice-track {
  display: inline-flex;
  width: max-content;
  animation: noticeScroll 15s linear infinite;
}

.notice-text {
  display: inline-block;
  padding-right: 80px;
  color: #212529;
}

@keyframes noticeScroll {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

/* Mobile */
@media (max-width: 576px) {
  .notice-wrapper {
    height: 36px;
  }

  .notice-track {
    animation-duration: 12s;
  }

  .notice-text {
    padding-right: 60px;
    font-size: 14px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .notice-track {
    animation: none;
  }
}

/* ---------------------------------- */
.btn-app {
  position: relative;
  overflow: hidden;
  border: none;
  font-weight: 600;
  padding: 12px 8px;
  border-radius: 12px;
  color: #ffffff !important;
  box-shadow:
    0 6px 15px rgba(0, 0, 0, 0.15),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  z-index: 1;
}

.btn-app::before {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 150%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      rgba(255, 255, 255, 0.8),
      rgba(255, 255, 255, 0.4),
      transparent);
  transform: skewX(-20deg);
  animation: lightningShine 3.5s infinite linear;
  z-index: -1;
}

@keyframes lightningShine {
  0% {
    left: 0%;
  }

  20% {
    left: 150%;
  }

  100% {
    left: 150%;
  }
}

@keyframes infinityFloat {
  0% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }

  25% {
    transform: translateY(-4px) rotate(-3deg) scale(1.05);
  }

  50% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }

  75% {
    transform: translateY(4px) rotate(3deg) scale(1.05);
  }

  100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
}

.icon-3d {
  font-size: 1.2rem;
  display: inline-block;
  filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.3));
  animation: infinityFloat 3s infinite ease-in-out;
}

.btn-app:hover {
  transform: translateY(-3px);
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.25),
    inset 0 2px 5px rgba(255, 255, 255, 0.4);
}

.btn-app:active {
  transform: translateY(1px);
}

.live-result-box {
  background: linear-gradient(135deg, #ff9900, #ff5e00);
  border-radius: 16px;
  padding: 18px 20px;
  color: #ffffff;
  box-shadow:
    0 8px 25px rgba(255, 120, 0, 0.35),
    inset 0 2px 4px rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;
}

.live-result-box:hover {
  transform: translateY(-3px);
  box-shadow:
    0 12px 30px rgba(255, 120, 0, 0.45),
    inset 0 2px 6px rgba(255, 255, 255, 0.5);
}

.horizontal-result-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.city-name {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.live-tag {
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.95;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.15);
  padding: 4px 10px;
  border-radius: 20px;
}

.live-dot {
  width: 8px;
  height: 8px;
  background-color: #00ff66;
  border-radius: 50%;
  box-shadow: 0 0 8px #00ff66;
  animation: pulseDot 1.5s infinite;
}

.result-number {
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: 1px;
  color: #ffffff;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

@keyframes pulseDot {
  0% {
    transform: scale(0.95);
    opacity: 1;
  }

  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }

  100% {
    transform: scale(0.95);
    opacity: 1;
  }
}

/* ---------------------------------------- */
.custom-card {
  border-left: 6px solid #198754 !important;
}

.card-purple {
  border-left-color: #8a2be2 !important;
}

.card-purple .icon-color {
  color: #8a2be2;
}

.card-blue {
  border-left-color: #0d6efd !important;
}

.card-blue .icon-color {
  color: #0d6efd;
}

.card-pink {
  border-left-color: #e83e8c !important;
}

.card-pink .icon-color {
  color: #e83e8c;
}

.card-orange {
  border-left-color: #fd7e14 !important;
}

.card-orange .icon-color {
  color: #fd7e14;
}

.bg-success {
  background-color: #007a53 !important;
}

.fs-7 {
  font-size: 12px;
}

.dot-running {
  width: 7px;
  height: 7px;
  background-color: #198754;
  border-radius: 50%;
  display: inline-block;
}
</style>
