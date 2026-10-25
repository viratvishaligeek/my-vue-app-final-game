<template>
  <div v-if="!hasInitialLoadCompleted" class="content-area dashboard-initial-loading" aria-busy="true">
    <div class="px-3 pt-4 pb-3">
      <LoadingState variant="featured" />
      <LoadingState variant="market-list" :count="4" />
    </div>
  </div>
  <div v-else-if="errorMessage && games.length === 0" class="content-area dashboard-initial-error">
    <div class="alert alert-danger m-3" role="alert">{{ errorMessage }} <button class="btn btn-sm btn-danger ms-2"
        @click="fetchGames">Retry</button></div>
  </div>
  <div v-else ref="dashboardRootElement" class="content-area">
    <div id="heroCarousel" ref="heroCarouselElement" class="carousel slide m-1 mb-2">
      <div class="carousel-indicators" v-if="banners.length > 1">
        <button v-for="(banner, index) in banners" :key="banner.id" type="button"
          :class="{ active: index === activeBannerIndex }" :aria-label="`Show banner ${index + 1}`"
          :aria-current="index === activeBannerIndex ? 'true' : undefined" @click="goToBanner(index)"></button>
      </div>
      <div class="carousel-inner rounded-3">
        <div v-for="(banner, index) in banners" :key="banner.id" class="carousel-item" :class="{ active: index === 0 }">
          <img :src="banner.imageUrl" class="d-block w-100" :alt="banner.title || 'Hero Banner'" />
        </div>
      </div>
    </div>
    <div v-if="marqueeText" class="row m-2 marquee-row">
      <div class="col-12 px-0">
        <div class="marquee-wrapper">
          <div class="marquee-icon">
            📢
          </div>
          <div class="marquee-viewport">
            <div class="marquee-track">
              <span class="marquee-item">
                {{ marqueeText }}
              </span>
              <span class="marquee-item" aria-hidden="true">
                {{ marqueeText }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =========================================================
     NOTICE
========================================================= -->
    <div v-if="noticeEnabled && noticeText" class="row m-2 notice-row">
      <div class="col-12 px-0">
        <div class="notice-card">
          <div class="notice-header">
            <div class="notice-title-wrap">
              <span class="notice-title-icon">
                ⚠️
              </span>
              <div>
                <div class="notice-title">
                  Important Notice
                </div>
                <div class="notice-subtitle">
                  Please read carefully before playing
                </div>
              </div>
            </div>
            <span class="notice-badge">
              NOTICE
            </span>
          </div>
          <div class="notice-divider"></div>
          <div class="notice-content">
            <div v-for="(line, index) in noticeLines" :key="index" class="notice-line">
              <span class="notice-bullet">
                {{ index + 1 }}
              </span>
              <span class="notice-line-text">
                {{ line }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row g-2 mb-4 ms-2 me-2">
      <div class="col-4">
        <router-link to="/wallet/add" class="btn  w-100 text-light">
          <span class="icon-3d">✚</span>
          <span>Add Money</span>
        </router-link>
      </div>
      <div class="col-4">
        <router-link to="/wallet/withdraw" class="btn  w-100 text-light">
          <span class="icon-3d">🏛️</span>
          Withdraw
        </router-link>
      </div>
      <div class="col-4">
        <router-link to="/live-support" class="btn w-100 text-light">
          <img src="../assets/img/live-chat.png" style="height: 25px; width: auto;" alt="">
          <!-- <span class="icon-3d">🎧</span> -->
          Live Chat

        </router-link>
      </div>
    </div>
    <div class="d-flex justify-content-between align-items-center px-2 mb-2">
      <h6 class="p-1 pb-0 text-black fw-bold mb-0">🗓️ Today's Result</h6>
      <span class="badge bg-primary-soft text-primary"> {{ marketCount }} Markets </span>
    </div>
    <LoadingState v-if="isLoading" variant="featured" />
    <div v-else-if="featuredGame" class="row g-2 px-3 mb-4">
      <div class="col-12">
        <div class="live-result-box">
          <div class="horizontal-result-content">
            <div>
              <h2 class="city-name text-white mb-0">
                {{ featuredGame.name }}
              </h2>
              <small class="opacity-75  text-white">
                Result Time:
                {{ formatTime(featuredGame.result_time) }}
              </small>
            </div>
            <span v-if="featuredGame.today_result?.date === todayDate" class="live-tag text-white">
              <span class="live-dot"></span>
              Latest Result Today
            </span>
            <h3 class="result-number mb-0" aria-label="Today's result">
              {{ featuredGame.today_result?.date === todayDate ? (featuredGame.today_result?.number ?? '--') : '--' }}
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
    <div v-else-if="isLoading" class="px-2">
      <LoadingState variant="market-list" :count="3" />
    </div>
    <div v-else-if="games.length === 0" class="card mx-2 border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <div class="fs-1">📊</div>
        <h5 class="fw-bold mt-2">No Markets Available</h5>
        <p class="text-muted mb-0">Please check again later.</p>
      </div>
    </div>
    <div v-else class="row g-3 ms-2 me-2">
      <div v-for="(game, index) in games" :key="game.id" v-memo="[game, isGamePlayable(game), serverOffset]"
        class="col-12">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden custom-card"
          :class="{ 'game-closed': !isGamePlayable(game) }">
          <div class="bg-white p-3 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2" style="min-width:48%">
              <i class="bi bi-geo-alt-fill fs-5 icon-color"></i>
              <div>
                <h6 class="fw-bold text-dark mb-0 text-uppercase fs-3">
                  {{ game.name }}
                </h6>
                <span class="small fw-semibold d-flex align-items-center gap-1"
                  :class="isGamePlayable(game) ? 'text-success' : 'text-danger'">
                  <span class="dot-running" :class="{
                    'bg-danger': !isGamePlayable(game),
                  }"></span>
                  {{ game.monthly_closure ? 'MONTH-END CLOSED' : getGameStatus(game) }}
                </span>
                <small v-if="game.monthly_closure" class="d-block text-danger mt-1">
                  {{ game.play_status_message || 'Games are unavailable on the last calendar day of the month' }}
                </small>
              </div>
            </div>
            <div class="text-center">
              <div class="fw-bold fs-3 text-dark">
                {{ game.latest_result?.date === todayDate ? (game.latest_result?.number ?? '--') : '--' }}
              </div>
              <div v-if="isGamePlayable(game)" class="text-danger small">
                <GameCountdown :end-at="game.play_window_end_at" :server-offset="serverOffset" />
              </div>
            </div>
            <div class="d-flex align-items-center">
              <router-link v-if="isGamePlayable(game)" :to="{
                name: 'play-game',
                params: {
                  id: game.id,
                },
              }" class="btn btn-success btn-sm rounded-3 ">
                <i class="bi bi-play-circle-fill"></i>
                Play
              </router-link>
              <button v-else class="btn btn-light border btn-sm small  rounded-3 text-secondary" disabled>
                Closed
              </button>
            </div>
          </div>
          <div
            class="bg-success text-white px-3 py-2 d-flex justify-content-between align-items-center fs-7 fw-semibold">
            <span>
              Last Result:
              {{ game.previous_result?.number ?? '--' }}
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Carousel } from 'bootstrap'
import api from '../plugins/axios'
import LoadingState from '@/components/LoadingState.vue'
import GameCountdown from '@/components/GameCountdown.vue'

const games = ref([])
const featuredGame = ref(null)
const banners = ref([])
const heroCarouselElement = ref(null)
const dashboardRootElement = ref(null)
const activeBannerIndex = ref(0)
let heroCarouselInstance = null
let dashboardAnimationObserver = null

const isLoading = ref(false)
const hasInitialLoadCompleted = ref(false)
const errorMessage = ref('')

const marqueeText = ref('')
const noticeText = ref('')
const noticeEnabled = ref(false)

/*
|--------------------------------------------------------------------------
| Server Clock
|--------------------------------------------------------------------------
*/

const currentTime = ref(Date.now())
const serverOffset = ref(0)
const serverTimezone = ref('Asia/Kolkata')

let clockTimer = null
let refreshTimer = null

const serverNow = computed(() => {
  return new Date(currentTime.value + serverOffset.value)
})

// Derive the calendar date from the server-synchronized clock. The API's
// result date must match this date before the featured card can show a number.
const todayDate = computed(() => {
  const now = serverNow.value
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: serverTimezone.value,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const value = (type) => parts.find(part => part.type === type)?.value || ''
  return `${value('year')}-${value('month')}-${value('day')}`
})

/*
|--------------------------------------------------------------------------
| Market Count
|--------------------------------------------------------------------------
*/

const marketCount = computed(() => {
  return games.value.length
})

/*
|--------------------------------------------------------------------------
| Sync Server Time
|--------------------------------------------------------------------------
*/
const noticeLines = computed(() => {
  if (!noticeText.value) {
    return []
  }
  return noticeText.value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
})



const syncServerTime = (serverTime, timezone) => {
  if (typeof timezone === 'string' && timezone.trim()) serverTimezone.value = timezone
  if (!serverTime) {
    return
  }
  const timestamp = new Date(serverTime).getTime()
  if (Number.isNaN(timestamp)) {
    return
  }
  /*
   * Browser clock is only used for ticking.
   * Server time remains the authority.
   */
  serverOffset.value = timestamp - Date.now()
}

/*
|--------------------------------------------------------------------------
| Parse API timestamp
|--------------------------------------------------------------------------
*/

const getTimestamp = (value) => {
  if (!value) {
    return null
  }
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp)
    ? null
    : timestamp
}

/*
|--------------------------------------------------------------------------
| Game Playability
|--------------------------------------------------------------------------
|
| Backend sends absolute start/end timestamps.
| No need to reconstruct H:i:s on frontend.
|
*/

const isGamePlayable = (game) => {
  // The API's monthly-closure flag overrides client-side countdown math.
  if (!game || game.status !== 'active' || game.monthly_closure) {
    return false
  }
  const start = getTimestamp(game.play_window_start_at)
  const end = getTimestamp(game.play_window_end_at)
  if (!start || !end) {
    return false
  }
  const now = serverNow.value.getTime()
  return now >= start && now < end
}

/*
|--------------------------------------------------------------------------
| Game Status
|--------------------------------------------------------------------------
*/

const getGameStatus = (game) => {
  if (!game || game.status !== 'active') {
    return 'CLOSED'
  }
  return isGamePlayable(game)
    ? 'RUNNING'
    : 'CLOSED'
}

/*
|--------------------------------------------------------------------------
| Format Time
|--------------------------------------------------------------------------
*/

const formatTime = (time) => {
  if (!time) {
    return '--'
  }
  /*
   * API normally returns H:i:s.
   */
  const parts = String(time)
    .split(':')
    .map(Number)
  if (parts.length < 2 || parts.some(Number.isNaN)) {
    return '--'
  }
  const hours = parts[0]
  const minutes = parts[1]
  const seconds = parts[2] || 0
  const date = new Date()
  date.setHours(
    hours,
    minutes,
    seconds,
    0
  )
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/*
|--------------------------------------------------------------------------
| Normalize Game
|--------------------------------------------------------------------------
|
| Keeps frontend safe even if an older API response is received.
|
*/

const normalizeGame = (game) => {
  return {
    ...game,
    // Ignore legacy/stale latest_result values unless the date proves they
    // belong to the server's current calendar day.
    latest_result: game.today_result ?? (
      game.latest_result?.date === todayDate.value ? game.latest_result : null
    ),
    previous_result: game.previous_result ?? null,
    is_playable: Boolean(
      game.is_playable
    ),
    remaining_seconds: Number(
      game.remaining_seconds ?? 0
    ),
  }
}

/*
|--------------------------------------------------------------------------
| Fetch Games
|--------------------------------------------------------------------------
*/

const fetchGames = async () => {
  /*
   * Don't clear existing games during refresh.
   * This prevents UI flickering every 30 seconds.
   */
  if (games.value.length === 0) {
    isLoading.value = true
    hasInitialLoadCompleted.value = false
  }
  errorMessage.value = ''
  try {
    const response = await api.get('/games/list', { params: { _ts: Date.now() }, headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } })
    const data = response.data
    if (!data?.status) {
      throw new Error(
        data?.message || 'Unable to load games.'
      )
    }
    /*
    |--------------------------------------------------------------------------
    | Server Clock
    |--------------------------------------------------------------------------
    */
    syncServerTime(data.server_time, data.timezone)
    /*
    |--------------------------------------------------------------------------
    | Banners
    |--------------------------------------------------------------------------
    */
    const nextBanners = Array.isArray(data.banners)
      ? data.banners.map((banner) => ({
        id: banner.id,
        title: banner.title || banner.name || 'Banner',
        imageUrl: banner.image_url || banner.image,
      }))
      : []
    const previousBannerSignature = banners.value.map(banner => `${banner.id}:${banner.imageUrl}`).join('|')
    const nextBannerSignature = nextBanners.map(banner => `${banner.id}:${banner.imageUrl}`).join('|')
    if (previousBannerSignature !== nextBannerSignature) {
      banners.value = nextBanners
      activeBannerIndex.value = 0
      await nextTick()
      initializeBannerCarousel()
    }
    /*
    |--------------------------------------------------------------------------
    | Marquee
    |--------------------------------------------------------------------------
    */
    marqueeText.value =
      typeof data.marquee?.content === 'string'
        ? data.marquee.content.trim()
        : ''
    /*
|--------------------------------------------------------------------------
| Notice
|--------------------------------------------------------------------------
*/
    noticeEnabled.value =
      Boolean(data.notice?.status)
    noticeText.value =
      typeof data.notice?.content === 'string'
        ? data.notice.content.trim()
        : ''
    /*
|--------------------------------------------------------------------------
| Featured Game
|--------------------------------------------------------------------------
*/
    featuredGame.value = data.featured_game
      ? normalizeGame(data.featured_game)
      : null
    /*
  |--------------------------------------------------------------------------
  | Games
  |--------------------------------------------------------------------------
  */
    games.value = Array.isArray(data.games)
      ? data.games.map(normalizeGame)
      : []
  } catch (error) {
    console.error(
      'Games API Error:',
      error
    )
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      'Unable to load games.'
  } finally {
    isLoading.value = false
    hasInitialLoadCompleted.value = true
    await nextTick()
    observeDashboardAnimations()
  }
}

/*
|--------------------------------------------------------------------------
| Banner carousel
|--------------------------------------------------------------------------
*/

const initializeBannerCarousel = () => {
  if (!heroCarouselElement.value || banners.value.length < 2) {
    if (heroCarouselInstance && heroCarouselElement.value) {
      heroCarouselElement.value.removeEventListener('slid.bs.carousel', handleBannerSlid)
      heroCarouselInstance.dispose()
    }
    heroCarouselInstance = null
    activeBannerIndex.value = 0
    return
  }
  if (heroCarouselInstance) {
    heroCarouselElement.value.removeEventListener('slid.bs.carousel', handleBannerSlid)
    heroCarouselInstance.dispose()
  }
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  heroCarouselInstance = new Carousel(heroCarouselElement.value, {
    interval: reduceMotion ? false : 4000,
    ride: reduceMotion ? false : 'carousel',
    pause: 'hover',
    wrap: true,
    touch: true,
  })
  heroCarouselElement.value.addEventListener('slid.bs.carousel', handleBannerSlid)
  heroCarouselInstance.to(activeBannerIndex.value)
  heroCarouselInstance.cycle()
}

const observeDashboardAnimations = () => {
  if (dashboardAnimationObserver) {
    dashboardAnimationObserver.disconnect()
    dashboardAnimationObserver = null
  }

  const root = dashboardRootElement.value
  if (!root || typeof IntersectionObserver === 'undefined') return

  dashboardAnimationObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      entry.target.classList.toggle('dashboard-animation-paused', !entry.isIntersecting)
    }
  }, { rootMargin: '100px 0px', threshold: 0.01 })

  root.querySelectorAll('.marquee-wrapper, .notice-card, .live-result-box, .custom-card, .row.g-2.mb-4.ms-2.me-2 .btn')
    .forEach((element) => dashboardAnimationObserver.observe(element))
}

const handleBannerSlid = (event) => {
  activeBannerIndex.value = event.to
}

const goToBanner = (index) => {
  activeBannerIndex.value = index
  heroCarouselInstance?.to(index)
}

/*
|--------------------------------------------------------------------------
| Refresh
|--------------------------------------------------------------------------
*/

const startRefreshTimer = () => {
  if (refreshTimer) clearInterval(refreshTimer)
  refreshTimer = setInterval(() => {
    // Avoid network work and reactive updates while the page is backgrounded.
    if (document.visibilityState === 'visible') fetchGames()
  }, 30000)
}

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  await fetchGames()

  clockTimer = setInterval(() => {
    currentTime.value = Date.now()
  }, 5000)

  startRefreshTimer()
})

onUnmounted(() => {
  if (heroCarouselInstance && heroCarouselElement.value) {
    heroCarouselElement.value.removeEventListener('slid.bs.carousel', handleBannerSlid)
    heroCarouselInstance.dispose()
  }
  heroCarouselInstance = null
  if (dashboardAnimationObserver) {
    dashboardAnimationObserver.disconnect()
    dashboardAnimationObserver = null
  }
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
.content-area {
  --blue: #3977ff;
  --red: #ff4056;
  --orange: #ff8a00;
  --ink: #172033;
  --muted: #718096;
  --border: #e8eef0;
  position: relative;
  min-height: 100vh;
  background: #fff;
  color: var(--ink);
  overflow-x: hidden;
  isolation: isolate;
}

#heroCarousel {
  position: relative;
  margin: 6px 5px 10px !important;
  border-radius: 18px;
  background: #fff;
  box-shadow:
    0 14px 35px rgba(18, 35, 52, .11),
    0 3px 8px rgba(18, 35, 52, .06);
}

#heroCarousel .carousel-inner {
  position: relative;
  border-radius: 18px !important;
}

#heroCarousel .carousel-item img {
  width: 100%;
  border-radius: 18px;
  object-fit: cover;
}

/* premium bottom fade */

#heroCarousel .carousel-inner::before {
  content: "";
  position: absolute;
  z-index: 1;
  left: 0;
  right: 0;
  bottom: 0;
  height: 35%;
  background: linear-gradient(to top,
      rgba(0, 0, 0, .12),
      transparent);
  pointer-events: none;
}

.carousel-indicators {
  z-index: 5;
  bottom: 3px;
}

.carousel-indicators button {
  width: 6px !important;
  height: 6px !important;
  margin: 0 3px !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 50% !important;
  opacity: 1 !important;
  background: rgba(255, 255, 255, .72) !important;
  transition: background .2s ease, opacity .2s ease !important;
}

.carousel-indicators button.active {
  background: #00c895 !important;
  box-shadow: 0 0 5px rgba(0, 200, 149, .55);
}

/* =========================================================
   MARQUEE
========================================================= */

.marquee-row {
  margin-top: 8px !important;
  margin-bottom: 10px !important;
}

.marquee-wrapper {
  position: relative;
  height: 42px;
  width: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: 14px;
  background:
    linear-gradient(135deg,
      #ffffff,
      #f8fffc);
  border: 1px solid #dceee8;
  box-shadow:
    0 7px 20px rgba(21, 47, 61, .07),
    inset 0 1px 0 rgba(255, 255, 255, .9);
}

/* =========================================================
   MARQUEE ICON
========================================================= */

.marquee-icon {
  position: relative;
  z-index: 10;
  width: 45px;
  min-width: 45px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(135deg,
      var(--primary-color),
      var(--primary-light));
  border-radius: 13px 0 0 13px;
  font-size: 17px;
  box-shadow:
    5px 0 14px rgba(0, 126, 92, .12);
  animation:
    marqueeSpeaker 2.5s ease-in-out infinite;
}

/* =========================================================
   VIEWPORT
========================================================= */

.marquee-viewport {
  position: relative;
  flex: 1;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  /*
   * Fade edges
   */
  mask-image:
    linear-gradient(to right,
      transparent 0,
      black 4%,
      black 96%,
      transparent 100%);
  -webkit-mask-image:
    linear-gradient(to right,
      transparent 0,
      black 4%,
      black 96%,
      transparent 100%);
}

/* =========================================================
   TRACK
========================================================= */

.marquee-track {
  display: flex;
  width: max-content;
  flex-shrink: 0;
  white-space: nowrap;
  animation:
    marqueeScroll 32s linear infinite;
}


.marquee-item {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding-right: 100px;
  color: #344054;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .15px;
}

/* =========================================================
   MARQUEE ANIMATION
========================================================= */

@keyframes marqueeScroll {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }

}

/* =========================================================
   SPEAKER
========================================================= */

@keyframes marqueeSpeaker {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.06);
    filter: brightness(1.08);
  }

}

/* =========================================================
   NOTICE CARD
========================================================= */

.notice-row {
  margin-top: 4px !important;
  margin-bottom: 16px !important;
}

.notice-card {
  position: relative;
  overflow: hidden;
  padding: 14px;
  border-radius: 17px;
  background:
    linear-gradient(145deg,
      #ffffff 0%,
      #fafffd 100%);
  border: 1px solid #dfeee9;
  box-shadow:
    0 9px 25px rgba(20, 45, 55, .075),
    0 2px 5px rgba(20, 45, 55, .035);
  animation:
    noticeCardEnter .6s cubic-bezier(.2, .8, .2, 1) both;
}

/*
 * Green animated top line
 */

.notice-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: -30%;
  width: 40%;
  height: 2px;
  background:
    linear-gradient(90deg,
      transparent,
      #00c895,
      #74ffd8,
      transparent);
  animation:
    noticeTopLine 4s linear infinite;
}

/*
 * Soft background glow
 */

.notice-card::after {
  content: "";
  position: absolute;
  width: 110px;
  height: 110px;
  right: -50px;
  top: -55px;
  border-radius: 50%;
  background:
    rgba(0, 200, 149, .055);
  box-shadow:
    0 0 40px rgba(0, 200, 149, .08);
  animation:
    noticeOrb 5s ease-in-out infinite;
}

/* =========================================================
   HEADER
========================================================= */

.notice-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.notice-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notice-title-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background:
    linear-gradient(135deg,
      #fff4dc,
      #fff9ee);
  border: 1px solid #ffe5b0;
  font-size: 18px;
  box-shadow:
    0 5px 12px rgba(255, 167, 0, .10);
  animation:
    noticeIconPulse 2.4s ease-in-out infinite;
}

.notice-title {
  color: #172033;
  font-size: 14px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: .1px;
}

.notice-subtitle {
  margin-top: 3px;
  color: #7a8696;
  font-size: 9px;
  font-weight: 700;
}

/* =========================================================
   BADGE
========================================================= */

.notice-badge {
  position: relative;
  z-index: 3;
  padding: 5px 8px;
  border-radius: 20px;
  background:
    linear-gradient(135deg,
      #fff1f1,
      #fff8f8);
  border: 1px solid #ffd9dc;
  color: #d6374b;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .6px;
  box-shadow:
    0 4px 10px rgba(214, 55, 75, .07);
  animation:
    noticeBadge 2.5s ease-in-out infinite;
}

/* =========================================================
   DIVIDER
========================================================= */

.notice-divider {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 1px;
  margin: 12px 0;
  background:
    linear-gradient(90deg,
      transparent,
      #dcebe6,
      transparent);
}

/* =========================================================
   CONTENT
========================================================= */

.notice-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notice-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 9px;
  border-radius: 11px;
  background:
    linear-gradient(135deg,
      #fbfefd,
      #f6fbf9);
  border: 1px solid #edf4f1;
  transition:
    transform .25s ease,
    box-shadow .25s ease,
    background .25s ease;
}

.notice-line:hover {
  transform: translateX(3px);
  background:
    #ffffff;
  box-shadow:
    0 5px 14px rgba(20, 45, 55, .06);
}

/* =========================================================
   NUMBER
========================================================= */

.notice-bullet {
  width: 20px;
  height: 20px;
  min-width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  border-radius: 50%;
  background:
    linear-gradient(135deg,
      var(--primary-color),
      var(--primary-light));
  color: #fff;
  font-size: 8px;
  font-weight: 900;
  box-shadow:
    0 3px 8px rgba(0, 150, 110, .18);
}

/* =========================================================
   TEXT
========================================================= */

.notice-line-text {
  color: #4c5868;
  font-size: 10px;
  line-height: 1.55;
  font-weight: 650;
  word-break: break-word;
}

/* =========================================================
   NOTICE ANIMATIONS
========================================================= */

@keyframes noticeCardEnter {
  from {
    opacity: 0;
    transform:
      translateY(12px) scale(.985);
  }

  to {
    opacity: 1;
    transform:
      translateY(0) scale(1);
  }

}

@keyframes noticeTopLine {
  from {
    left: -40%;
  }

  to {
    left: 140%;
  }

}

@keyframes noticeOrb {

  0%,
  100% {
    transform:
      translate(0, 0) scale(1);
  }

  50% {
    transform:
      translate(-10px, 10px) scale(1.08);
  }

}

@keyframes noticeIconPulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.06);
  }

}

@keyframes noticeBadge {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

}



.row.g-2.mb-4.ms-2.me-2 {
  position: relative;
  margin-left: 7px !important;
  margin-right: 7px !important;
}

.row.g-2.mb-4.ms-2.me-2 .col-4 {
  padding-left: 3px;
  padding-right: 3px;
}

.row.g-2.mb-4.ms-2.me-2 .btn {
  position: relative;
  min-height: 58px;
  overflow: hidden;
  border: 0 !important;
  border-radius: 16px !important;
  color: #fff !important;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  box-shadow:
    0 9px 20px rgba(20, 35, 45, .13),
    inset 0 1px 0 rgba(255, 255, 255, .4),
    inset 0 -2px 0 rgba(0, 0, 0, .08);
  transform: translateY(0);
  transition:
    transform .3s cubic-bezier(.2, .8, .2, 1),
    box-shadow .3s ease,
    filter .3s ease;
}

/* moving shine */

.row.g-2.mb-4.ms-2.me-2 .btn::before {
  content: "";
  position: absolute;
  z-index: 1;
  top: -20%;
  left: -100%;
  width: 55%;
  height: 140%;
  transform: skewX(-22deg);
  background:
    linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, .12),
      rgba(255, 255, 255, .65),
      rgba(255, 255, 255, .12),
      transparent);
  animation: actionShine 5s linear infinite;
}

/* glow layer */

.row.g-2.mb-4.ms-2.me-2 .btn::after {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: 15px;
  pointer-events: none;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, .08);
}

/* add money */

.row.g-2.mb-4.ms-2.me-2 .col-4:nth-child(1) .btn {
  background:
    linear-gradient(135deg, var(--primary-color), var(--primary-light)) !important;
}

/* withdraw */

.row.g-2.mb-4.ms-2.me-2 .col-4:nth-child(2) .btn {
  background:
    linear-gradient(145deg,
      #d9273d,
      #f13d50,
      #ff5968) !important;
}

/* support */

.row.g-2.mb-4.ms-2.me-2 .col-4:nth-child(3) .btn {
  background:
    linear-gradient(135deg, var(--primary-light), var(--primary-light)) !important;
}

.row.g-2.mb-4.ms-2.me-2 .btn:active {
  transform: scale(.93);
  box-shadow:
    0 3px 8px rgba(20, 35, 45, .15);
}

.icon-3d {
  position: relative;
  z-index: 3;
  font-size: 1.35rem;
  display: inline-block;
  filter:
    drop-shadow(0 4px 3px rgba(0, 0, 0, .22));
}


.content-area>h3 {
  position: relative;
  margin-left: 10px;
  padding-left: 8px !important;
  font-size: 19px;
  letter-spacing: -.3px;
  color: #182333 !important;
}

.content-area>h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 2px;
  width: 4px;
  height: 23px;
  border-radius: 10px;
  background:
    linear-gradient(180deg,
      #00c895,
      #007e5b);
  box-shadow:
    0 0 8px rgba(0, 200, 149, .4);
  animation: titleBar 2s ease-in-out infinite alternate;
}

.content-area>h3::after {
  content: "";
  display: block;
  width: 55px;
  height: 3px;
  margin-top: 5px;
  border-radius: 10px;
  background:
    linear-gradient(90deg,
      #00a878,
      #00d5a0,
      transparent);
  animation: titleUnderline 2s ease-in-out infinite alternate;
}

.badge.bg-primary-soft {
  position: relative;
  overflow: hidden;
  color: #008b68 !important;
  background:
    linear-gradient(135deg,
      #e8faf4,
      #f4fffb) !important;
  border: 1px solid #c8eee3;
  border-radius: 20px;
  padding: 6px 9px;
  box-shadow:
    0 5px 12px rgba(0, 150, 110, .08);
}

.live-result-box {
  position: relative;
  overflow: hidden;
  border: 0 !important;
  border-radius: 20px;
  padding: 17px 14px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  box-shadow:
    0 14px 30px rgba(0, 144, 104, .23),
    0 4px 8px rgba(0, 100, 80, .08),
    inset 0 1px 0 rgba(255, 255, 255, .4);
}

.live-result-box::before {
  content: "";
  position: absolute;
  z-index: 1;
  top: -80%;
  left: -50%;
  width: 45%;
  height: 260%;
  transform: rotate(25deg);
  background:
    linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, .08),
      rgba(255, 255, 255, .42),
      rgba(255, 255, 255, .08),
      transparent);
  animation: resultSweep 4s ease-in-out infinite;
}

/* floating orb */



.horizontal-result-content {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 6px;
  padding: 0px 15px;
}

.city-name {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: .7px;
  text-shadow:
    0 2px 5px rgba(0, 0, 0, .2);
}

.horizontal-result-content small {
  font-size: 9px;
}

.live-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 7px;
  border-radius: 20px;
  background: rgba(0, 0, 0, .16);
  border: 1px solid rgba(255, 255, 255, .12);
  backdrop-filter: blur(8px);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .35px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .14);
}

.live-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  border-radius: 50%;
  background: #79ffb1;
  box-shadow:
    0 0 5px #79ffb1,
    0 0 13px #79ffb1,
    0 0 22px rgba(121, 255, 177, .7);
  animation: livePulse 1s ease-in-out infinite;
}

.result-number {
  font-size: 1.75rem;
  font-weight: 950;
  letter-spacing: 1px;
  color: #fff;
  text-shadow:
    0 3px 7px rgba(0, 0, 0, .3),
    0 0 12px rgba(255, 255, 255, .14);
}

.custom-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #e7edef !important;
  border-left: 5px solid var(--primary-color) !important;
  border-radius: 18px !important;
  background: #fff !important;
  box-shadow:
    0 9px 24px rgba(20, 36, 48, .075),
    0 2px 5px rgba(20, 36, 48, .04);
  transform: translateZ(0);
  transition:
    transform .35s cubic-bezier(.2, .8, .2, 1),
    box-shadow .35s ease,
    border-color .35s ease;
}


/* Closed markets stay visually still to reduce continuous paint work. */
.custom-card.game-closed,
.custom-card.game-closed *,
.custom-card.game-closed *::before,
.custom-card.game-closed *::after,
.custom-card.game-closed::before,
.custom-card.game-closed::after {
  animation: none !important;
  transition: none !important;
}

.custom-card.game-closed::before,
.custom-card.game-closed::after,
.custom-card.game-closed .btn-light::before,
.custom-card.game-closed .btn-success::before,
.custom-card.game-closed>.bg-success::before {
  display: none;
}

/* animated edge */

.custom-card::before {
  content: "";
  position: absolute;
  z-index: 5;
  left: 0;
  top: 0;
  width: 100%;
  height: 2px;
  background:
    linear-gradient(90deg,
      transparent,
      #00c895,
      #6fffd1,
      #00a878,
      transparent);
  background-size: 250% 100%;
}

/* subtle moving reflection */

.custom-card::after {
  content: "";
  position: absolute;
  z-index: 4;
  top: -100%;
  left: -50%;
  width: 35%;
  height: 300%;
  transform: rotate(25deg);
  background:
    linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, .5),
      transparent);
  pointer-events: none;
  opacity: .35;
  animation: cardReflection 7s ease-in-out infinite;
}

.custom-card:hover {
  transform: translateY(-5px);
  border-color: #cceee4 !important;
  box-shadow:
    0 18px 35px rgba(20, 36, 48, .11),
    0 0 25px rgba(0, 168, 120, .07);
}

.custom-card .bg-white {
  background: #fff !important;
}

.custom-card .icon-color {
  color: #009d73;
  filter:
    drop-shadow(0 3px 5px rgba(0, 157, 115, .22));
}

.custom-card h6 {
  color: #172033 !important;
  font-size: 13px !important;
  font-weight: 900 !important;
  letter-spacing: .5px;
}

.custom-card .small {
  color: #008f69 !important;
  font-weight: 800;
}

.dot-running {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  background: #00b67d !important;
  box-shadow:
    0 0 0 3px rgba(0, 182, 125, .09),
    0 0 8px rgba(0, 182, 125, .4);
  animation: statusPulse 1.4s infinite;
}

.custom-card .text-dark.fs-3 {
  color: #172033 !important;
  /* font-size: 1.4rem !important; */
  font-weight: 950 !important;
  /* letter-spacing: .5px; */
  animation: marketNumber 3s ease-in-out infinite;
}

.custom-card .btn-light {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(145deg,
      #fff,
      #f4faf8) !important;
  color: #536173 !important;
  border: 1px solid #dce9e5 !important;
  border-radius: 10px !important;
  box-shadow:
    0 3px 7px rgba(20, 35, 45, .04);
  transition:
    transform .25s ease,
    color .25s ease,
    border-color .25s ease,
    box-shadow .25s ease;
}

.custom-card .btn-light::before {
  content: "";
  position: absolute;
  left: -100%;
  top: 0;
  width: 70%;
  height: 100%;
  transform: skewX(-20deg);
  background:
    linear-gradient(90deg,
      transparent,
      rgba(0, 168, 120, .10),
      transparent);
  animation: chartShine 4s linear infinite;
}

.custom-card .btn-light:hover {
  transform: translateY(-2px);
  color: #008f68 !important;
  border-color: #bde5d8 !important;
  box-shadow:
    0 6px 13px rgba(0, 168, 120, .10);
}

.custom-card .btn-success {
  position: relative;
  overflow: hidden;
  border: 0 !important;
  padding: 5px 20px;
  background:
    linear-gradient(135deg,
      #008b64,
      #00b681,
      #00cc96) !important;
  box-shadow:
    0 7px 16px rgba(0, 158, 112, .23),
    inset 0 1px 0 rgba(255, 255, 255, .35) !important;
  transition:
    transform .25s ease,
    box-shadow .25s ease;
}

.custom-card .btn-success::before {
  content: "";
  position: absolute;
  left: -120%;
  top: 0;
  width: 70%;
  height: 100%;
  transform: skewX(-20deg);
  background:
    linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, .15),
      rgba(255, 255, 255, .65),
      rgba(255, 255, 255, .15),
      transparent);
  animation: playButtonSweep 2.5s linear infinite;
}

.custom-card .btn-success i {
  position: relative;
  z-index: 2;
  animation: playButtonIcon 1.3s ease-in-out infinite;
}

.custom-card .btn-success:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow:
    0 11px 23px rgba(0, 158, 112, .30),
    0 0 16px rgba(0, 200, 145, .12) !important;
}

.custom-card .btn-secondary {
  background:
    linear-gradient(145deg,
      #eef1f3,
      #e4e8eb) !important;
  color: #737d88 !important;
  border: 1px solid #dfe4e8 !important;
  box-shadow:
    inset 0 1px 0 #fff;
}

.custom-card>.bg-success {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg, var(--primary-color), var(--primary-light));
  background-size: 300% 100%;
  color: #fff !important;
  font-size: 9px !important;
  font-weight: 800;
  letter-spacing: .25px;
}

.custom-card>.bg-success::before {
  content: "";
  position: absolute;
  top: 0;
  left: -40%;
  width: 30%;
  height: 100%;
  background:
    linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, .25),
      transparent);
  transform: skewX(-20deg);
  animation: bottomBarShine 8s linear infinite;
}

.spinner-border {
  width: 30px !important;
  height: 30px !important;
  color: #00a878 !important;
  border-width: 3px !important;
  filter:
    drop-shadow(0 0 7px rgba(0, 168, 120, .3));
  animation:
    spinner-grow 1s linear infinite;
}

.alert-danger {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg,
      #fff7f8,
      #fff) !important;
  color: #c72e40 !important;
  border: 1px solid #ffd7dc !important;
  border-radius: 14px !important;
  box-shadow:
    0 8px 20px rgba(220, 50, 70, .07);
  animation: errorEntrance .5s ease both;
}

.card.mx-2.border-0 {
  background: #fff !important;
  border: 1px solid #e7edef !important;
  border-radius: 18px !important;
  box-shadow:
    0 10px 25px rgba(20, 36, 48, .06) !important;
}

.card.mx-2.border-0 .fs-1 {
  animation:
    emptyIcon 2.5s ease-in-out infinite;
}

.card.mx-2.border-0 h5 {
  color: #172033 !important;
}

@keyframes ambientLeft {
  from {
    transform: translate(0, 0) scale(1);
  }

  to {
    transform: translate(45px, 35px) scale(1.2);
  }
}

@keyframes ambientRight {
  from {
    transform: translate(0, 0) scale(1);
  }

  to {
    transform: translate(-35px, -45px) scale(1.2);
  }
}

@keyframes heroEnter {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes heroBreathing {
  from {
    transform: scale(1.02);
  }

  to {
    transform: scale(1.065);
  }
}

@keyframes heroLight {
  0% {
    left: -80%;
  }

  45%,
  100% {
    left: 150%;
  }
}

@keyframes noticeGlow {

  0%,
  100% {
    box-shadow:
      0 7px 20px rgba(21, 47, 61, .07);
  }

  50% {
    box-shadow:
      0 8px 23px rgba(0, 168, 120, .13);
  }
}

@keyframes noticeTopLight {
  from {
    left: -30%;
  }

  to {
    left: 130%;
  }
}

@keyframes speakerPulse {

  0%,
  100% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(1.12);
  }
}

@keyframes actionShine {
  0% {
    left: -100%;
  }

  35%,
  100% {
    left: 140%;
  }
}

@keyframes actionFloat {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-2px);
  }
}

@keyframes greenGlow {

  0%,
  100% {
    box-shadow:
      0 9px 20px rgba(20, 35, 45, .13),
      inset 0 1px 0 rgba(255, 255, 255, .4);
  }

  50% {
    box-shadow:
      0 11px 25px rgba(0, 168, 120, .22),
      0 0 15px rgba(0, 200, 145, .10),
      inset 0 1px 0 rgba(255, 255, 255, .4);
  }
}

@keyframes redGlow {

  0%,
  100% {
    box-shadow:
      0 9px 20px rgba(20, 35, 45, .13),
      inset 0 1px 0 rgba(255, 255, 255, .4);
  }

  50% {
    box-shadow:
      0 11px 25px rgba(255, 64, 86, .20),
      0 0 15px rgba(255, 64, 86, .08),
      inset 0 1px 0 rgba(255, 255, 255, .4);
  }
}

@keyframes blueGlow {

  0%,
  100% {
    box-shadow:
      0 9px 20px rgba(20, 35, 45, .13),
      inset 0 1px 0 rgba(255, 255, 255, .4);
  }

  50% {
    box-shadow:
      0 11px 25px rgba(57, 119, 255, .20),
      0 0 15px rgba(57, 119, 255, .08),
      inset 0 1px 0 rgba(255, 255, 255, .4);
  }
}

@keyframes icon3DFloat {

  0%,
  100% {
    transform:
      translateY(0) rotate(0deg) scale(1);
  }

  25% {
    transform:
      translateY(-4px) rotate(-5deg) scale(1.06);
  }

  50% {
    transform:
      translateY(0) rotate(0deg) scale(1);
  }

  75% {
    transform:
      translateY(3px) rotate(4deg) scale(1.04);
  }
}

@keyframes titleBar {
  from {
    height: 18px;
  }

  to {
    height: 27px;
  }
}

@keyframes titleUnderline {
  from {
    width: 35px;
  }

  to {
    width: 72px;
  }
}


@keyframes badgeShine {
  0% {
    left: -70%;
  }

  45%,
  100% {
    left: 130%;
  }
}

@keyframes resultSweep {
  0% {
    left: -60%;
  }

  50%,
  100% {
    left: 140%;
  }
}


@keyframes livePulse {
  0% {
    transform: scale(.8);
    opacity: 1;
  }

  50% {
    transform: scale(1.35);
    opacity: .65;
  }

  100% {
    transform: scale(.8);
    opacity: 1;
  }
}


@keyframes marketCardEnter {
  from {
    opacity: 0;
    transform: translateY(16px) scale(.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes cardReflection {

  0%,
  65% {
    left: -50%;
  }

  80%,
  100% {
    left: 140%;
  }
}

@keyframes statusPulse {
  0% {
    box-shadow:
      0 0 0 0 rgba(0, 182, 125, .5);
  }

  70% {
    box-shadow:
      0 0 0 7px rgba(0, 182, 125, 0);
  }

  100% {
    box-shadow:
      0 0 0 0 rgba(0, 182, 125, 0);
  }
}

@keyframes marketNumber {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.06);
  }
}

@keyframes chartShine {
  0% {
    left: -100%;
  }

  40%,
  100% {
    left: 140%;
  }
}

@keyframes playButtonSweep {
  0% {
    left: -120%;
  }

  40%,
  100% {
    left: 140%;
  }
}

@keyframes playButtonIcon {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.18);
  }
}

@keyframes bottomBarShine {
  0% {
    left: -40%;
  }

  35%,
  100% {
    left: 140%;
  }
}

@keyframes errorEntrance {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes emptyIcon {

  0%,
  100% {
    transform: translateY(0) rotate(0);
  }

  50% {
    transform: translateY(-8px) rotate(3deg);
  }
}

@media (min-width: 577px) {
  .content-area>* {
    /* no desktop redesign */
  }
}

@media (max-width: 576px) {
  .content-area {
    width: 100%;
    min-height: 100vh;
    background: #fff;
  }

  /* HERO */
  #heroCarousel {
    margin: 5px 5px 9px !important;
  }

  #heroCarousel .carousel-item img {
    min-height: 135px;
    max-height: 185px;
  }

  /* NOTICE */
  .notice-wrapper {
    height: 38px;
    margin-top: 2px;
  }

  .notice-text {
    font-size: 12px;
    padding-right: 65px;
  }

  .notice-track {
    animation-duration: 12s;
  }

  /* TOP ACTIONS */
  .row.g-2.mb-4.ms-2.me-2 {
    margin-top: 1px !important;
    margin-bottom: 17px !important;
  }

  .row.g-2.mb-4.ms-2.me-2 .btn {
    min-height: 56px;
    padding: 6px 3px !important;
  }

  /* TODAY RESULT */
  .d-flex.justify-content-between.align-items-center.px-2 {
    padding-left: 9px !important;
    padding-right: 9px !important;
  }

  .d-flex.justify-content-between.align-items-center.px-2 h6 {
    font-size: 14px;
  }

  /* FEATURED */
  .row.g-2.px-3.mb-4 {
    padding-left: 10px !important;
    padding-right: 10px !important;
    margin-bottom: 17px !important;
  }

  .live-result-box {
    padding: 15px 11px;
  }

  /* MARKET */
  .row.g-3.ms-2.me-2 {
    margin-left: 7px !important;
    margin-right: 7px !important;
  }

  .custom-card {
    border-left-width: 5px !important;
    border-radius: 17px !important;
  }

  .custom-card .bg-white.p-3 {
    padding: 6px !important;
  }

  .custom-card>.bg-success {
    padding: 8px 10px !important;
  }
}

@media (max-width: 360px) {
  #heroCarousel .carousel-item img {
    min-height: 120px;
    max-height: 160px;
  }

  .row.g-2.mb-4.ms-2.me-2 .btn {
    min-height: 52px;
    font-size: 10px;
  }

  .icon-3d {
    font-size: 1.2rem;
  }

  .live-tag {
    font-size: 7px;
  }

  .custom-card h6 {
    font-size: 14px !important;
  }
}

/* Pause decorative motion while sections are outside the viewport. The same
   animations resume at their previous position when the user scrolls back. */
.dashboard-animation-paused,
.dashboard-animation-paused *,
.dashboard-animation-paused::before,
.dashboard-animation-paused::after,
.dashboard-animation-paused *::before,
.dashboard-animation-paused *::after {
  animation-play-state: paused !important;
}

@media (prefers-reduced-motion: reduce) {

  *,
  *::before,
  *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }

  .notice-track {
    animation: none !important;
  }
}

/* =========================================
   CENTRAL ANIMATION SYSTEM
   ========================================= */

:root {
  --motion-cycle: 8s;
  --motion-gap: 5s;
  --motion-ease: cubic-bezier(.2, .8, .2, 1);
}

/* Shared shine animation */
@keyframes sharedShine {

  0%,
  55%,
  100% {
    transform: translateX(0) skewX(-22deg);
  }

  75% {
    transform: translateX(350%) skewX(-22deg);
  }
}

/* Shared soft pulse */
@keyframes sharedPulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  10% {
    opacity: .8;
    transform: scale(1.04);
  }

  20%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Shared entrance */
@keyframes sharedEntrance {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reusable shine timing */
.row.g-2.mb-4.ms-2.me-2 .btn::before,
.custom-card .btn-light::before,
.custom-card .btn-success::before,
.custom-card>.bg-success::before {
  animation-duration: 8s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

/* Keep visual effects, reduce expensive rendering */
.custom-card,
.live-result-box,
.notice-card,
.marquee-wrapper {
  backface-visibility: hidden;
}

.custom-card::after,
.live-result-box::before,
.notice-card::before,
.notice-card::after {
  pointer-events: none;
}

/* Pause animations when the tab is hidden */
@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none !important;
  }
}

/* Avoid hover movement on touch devices */
@media (hover: none) {
  .custom-card:hover {
    transform: none;
  }

  .custom-card .btn-success:hover,
  .custom-card .btn-light:hover {
    transform: none;
  }
}
</style>
