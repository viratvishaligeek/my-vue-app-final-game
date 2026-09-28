<template>
  <div class="content-area">

    <!-- Hero Carousel -->
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


    <!-- Notice -->
    <div class="row m-2">

      <div class="col-12 border">

        <marquee class="mt-2 fw-bold">
          {{ noticeText }}
        </marquee>

      </div>

    </div>


    <!-- Wallet Actions -->
    <div class="row g-2 mb-4 ms-2 me-2">

      <div class="col-4">

        <button class="btn btn-app btn-add-money w-100 text-truncate">

          <span class="icon-3d">💰</span>

          <span>Add Money</span>

        </button>

      </div>


      <div class="col-4">

        <button class="btn btn-app btn-withdraw w-100 text-truncate">

          <span class="icon-3d">💸</span>

          Withdraw

        </button>

      </div>


      <div class="col-4">

        <button class="btn btn-app btn-support w-100 text-truncate">

          <span class="icon-3d">🎧</span>

          Support

        </button>

      </div>

    </div>


    <!-- Today's Result Header -->
    <div class="d-flex justify-content-between align-items-center px-2 mb-2">

      <h6 class="p-1 pb-0 text-black fw-bold mb-0">
        🗓️ Today's Result
      </h6>

      <span class="badge bg-primary-soft text-primary">
        {{ marketGames.length }} Markets
      </span>

    </div>


    <!-- Loading -->
    <div v-if="isLoading" class="col-12 text-center py-3">

      <div class="spinner-border spinner-border-sm text-primary"></div>

    </div>


    <!-- Today's Result -->
    <div v-else-if="featuredGame" class="row g-2 px-3 mb-4">

      <div :key="`result-${featuredGame.id}`" class="col-12">

        <div class="live-result-box">

          <div class="horizontal-result-content">

            <h4 class="city-name mb-0">
              {{ featuredGame.name }}
            </h4>


            <span class="live-tag">

              <span class="live-dot"></span>

              {{
                featuredGame.is_playable
                  ? 'Live Result'
                  : 'Result'
              }}

            </span>


            <h3 class="result-number mb-0">
              {{ featuredGame.last_result ?? '--' }}
            </h3>

          </div>

        </div>

      </div>

    </div>


    <!-- Live Market -->
    <h3 class="p-1 pt-0 text-black fw-bold">
      📊 Live Market
    </h3>


    <!-- Error -->
    <div v-if="errorMessage" class="alert alert-danger mx-2">

      {{ errorMessage }}

      <button class="btn btn-sm btn-danger ms-2" @click="fetchGames">
        Retry
      </button>

    </div>


    <!-- Empty -->
    <div v-else-if="!isLoading && marketGames.length === 0" class="card mx-2 border-0 shadow-sm">

      <div class="card-body text-center py-5">

        <div class="fs-1">
          📊
        </div>

        <h5 class="fw-bold mt-2">
          No Markets Available
        </h5>

        <p class="text-muted mb-0">
          Please check again later.
        </p>

      </div>

    </div>


    <!-- Live Market Cards -->
    <div v-else class="row g-3 ms-2 me-2">

      <div v-for="(game, index) in marketGames" :key="game.id" class="col-12">

        <div class="card border-0 shadow-sm rounded-4 overflow-hidden custom-card" :class="getCardClass(index)">

          <!-- Main Card -->
          <div class="bg-white p-3 d-flex align-items-center justify-content-between">

            <!-- Left -->
            <div class="d-flex align-items-center gap-2">

              <i class="bi bi-geo-alt-fill fs-2 icon-color"></i>

              <div>

                <h6 class="fw-bold text-dark mb-0 text-uppercase fs-3">
                  {{ game.name }}
                </h6>


                <span class="small fw-semibold d-flex align-items-center gap-1" :class="game.is_playable
                  ? 'text-success'
                  : 'text-danger'
                  ">

                  <span class="dot-running" :class="{
                    'bg-danger': !game.is_playable
                  }"></span>


                  {{
                    game.is_playable
                      ? 'RUNNING'
                      : 'CLOSED'
                  }}

                </span>

              </div>

            </div>


            <!-- Center -->
            <div class="text-center">

              <div class="fw-bold fs-3 text-dark">
                {{ game.last_result ?? '--' }}
              </div>


              <div v-if="game.is_playable" class="text-danger small fw-semibold">
                {{ getRemainingTime(game.play_end) }}
              </div>


              <div v-else class="text-muted small fw-semibold">
                Closed
              </div>

            </div>


            <!-- Right -->
            <div class="d-flex align-items-center gap-2">

              <!-- Chart -->
              <router-link :to="`/monthly-charts?game=${game.id}`"
                class="btn btn-light border btn-sm px-2 py-1 rounded-3 fw-semibold text-secondary d-none d-sm-inline-block">

                <i class="bi bi-bar-chart-line me-1"></i>

                Chart

              </router-link>


              <!-- Play -->
              <router-link v-if="game.is_playable" :to="{
                name: 'play-game',
                params: {
                  id: game.id
                }
              }"
                class="btn btn-success btn-sm px-3 py-2 rounded-pill fw-bold d-flex align-items-center gap-1 shadow-sm">

                <i class="bi bi-play-circle-fill fs-4"></i>

                Play

              </router-link>


              <!-- Closed -->
              <button v-else class="btn btn-secondary btn-sm px-3 py-2 rounded-pill fw-bold" disabled>
                Closed
              </button>

            </div>

          </div>


          <!-- Bottom -->
          <div
            class="bg-success text-white px-3 py-2 d-flex justify-content-between align-items-center fs-7 fw-semibold">

            <span>
              Last Result :
              {{ game.last_result ?? '--' }}
            </span>


            <span>
              RESULT TIME :
              {{ formatTime(game.result_time) }}
            </span>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>


<script setup>

import {
  ref,
  computed,
  onMounted,
  onUnmounted
} from 'vue'

import api from '../plugins/axios'


/*
|--------------------------------------------------------------------------
| Games
|--------------------------------------------------------------------------
*/

const games = ref([])

const isLoading = ref(false)

const errorMessage = ref('')

const noticeText = ref(
  'Welcome to our gaming platform'
)

const currentTime = ref(new Date())

let timer = null


/*
|--------------------------------------------------------------------------
| Featured Game
|--------------------------------------------------------------------------
|
| API se jis game ka is_featured === true hai,
| wahi Today's Result mein show hoga.
|
*/

const featuredGame = computed(() => {

  return games.value.find(
    game => game.is_featured === true
  ) || null

})


/*
|--------------------------------------------------------------------------
| Market Games
|--------------------------------------------------------------------------
|
| Featured game ko Live Market se remove kar diya jayega.
|
*/

const marketGames = computed(() => {

  return games.value.filter(
    game => game.is_featured !== true
  )

})


/*
|--------------------------------------------------------------------------
| Banners
|--------------------------------------------------------------------------
*/

const banners = ref([

  {
    id: 1,
    imageUrl:
      'https://thumbs.dreamstime.com/b/concept-ecommerce-website-marketing-shopping-online-store-online-purchase-e-payment-online-order-discount-coupon-118004198.jpg',
    title: 'Banner 1',
  },

  {
    id: 2,
    imageUrl:
      'https://thumbs.dreamstime.com/b/e-commerce-web-banner-vector-template-business-woman-business-suit-sitting-computer-office-doing-vector-84831641.jpg',
    title: 'Banner 2',
  },

])


/*
|--------------------------------------------------------------------------
| Fetch Games
|--------------------------------------------------------------------------
*/

const fetchGames = async () => {

  isLoading.value = true

  errorMessage.value = ''

  try {

    const response =
      await api.get('/games/list')


    /*
     * API Response:
     *
     * {
     *   success: true,
     *   data: [...]
     * }
     */

    if (response.data?.success) {

      games.value =
        response.data.data || []

    } else {

      games.value = []

      errorMessage.value =
        'Unable to load markets.'

    }

  } catch (error) {

    console.error(
      'Games API Error:',
      error
    )

    errorMessage.value =
      error.response?.data?.message ||
      'Unable to load games.'

  } finally {

    isLoading.value = false

  }

}


/*
|--------------------------------------------------------------------------
| Format Time
|--------------------------------------------------------------------------
|
| 18:00:00 -> 06:00 PM
|
*/

const formatTime = (time) => {

  if (!time) {
    return '--'
  }

  try {

    const [
      hours,
      minutes
    ] = time.split(':')


    const date =
      new Date()


    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    )


    return date.toLocaleTimeString([], {

      hour: '2-digit',

      minute: '2-digit',

    })

  } catch {

    return '--'

  }

}


/*
|--------------------------------------------------------------------------
| Remaining Time
|--------------------------------------------------------------------------
|
| Example:
| 17:00:00 -> 01h 25m 20s left
|
*/

const getRemainingTime = (endTime) => {

  if (!endTime) {
    return '--'
  }

  try {

    const [
      hours,
      minutes,
      seconds = 0
    ] = endTime.split(':')


    const end =
      new Date()


    end.setHours(
      Number(hours),
      Number(minutes),
      Number(seconds),
      0
    )


    let diff =
      end.getTime() -
      currentTime.value.getTime()


    /*
     * Agar end time next day ka hai
     */

    if (diff < 0) {

      end.setDate(
        end.getDate() + 1
      )


      diff =
        end.getTime() -
        currentTime.value.getTime()

    }


    const totalSeconds =
      Math.max(
        0,
        Math.floor(diff / 1000)
      )


    const hoursLeft =
      Math.floor(
        totalSeconds / 3600
      )


    const minutesLeft =
      Math.floor(
        (totalSeconds % 3600) / 60
      )


    const secondsLeft =
      totalSeconds % 60


    if (hoursLeft > 0) {

      return `${hoursLeft}h ${String(
        minutesLeft
      ).padStart(2, '0')}m ${String(
        secondsLeft
      ).padStart(2, '0')}s left`

    }


    return `${String(
      minutesLeft
    ).padStart(2, '0')}m ${String(
      secondsLeft
    ).padStart(2, '0')}s left`

  } catch {

    return '--'

  }

}


/*
|--------------------------------------------------------------------------
| Card Colors
|--------------------------------------------------------------------------
|
| 1st = purple
| 2nd = blue
| 3rd = purple
| ...
|
*/

const getCardClass = (index) => {

  return index % 2 === 0
    ? 'card-purple'
    : 'card-blue'

}


/*
|--------------------------------------------------------------------------
| Mounted
|--------------------------------------------------------------------------
*/

onMounted(() => {

  fetchGames()


  /*
   * Countdown update every second
   */

  timer =
    setInterval(() => {

      currentTime.value =
        new Date()

    }, 1000)

})


/*
|--------------------------------------------------------------------------
| Cleanup
|--------------------------------------------------------------------------
*/

onUnmounted(() => {

  if (timer) {

    clearInterval(timer)

    timer = null

  }

})

</script>

<style scoped>
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

.btn-add-money {
  background: linear-gradient(135deg, #00b09b, #96c93d);
}

.btn-withdraw {
  background: linear-gradient(135deg, #ff416c, #ff4b2b);
}

.btn-support {
  background: linear-gradient(135deg, #2193b0, #6dd5ed);
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
