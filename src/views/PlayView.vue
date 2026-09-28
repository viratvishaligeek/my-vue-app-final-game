<template>
  <div class="content-area pb-5 mb-5 position-relative">

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>

      <div class="mt-2 text-muted">
        Loading game...
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="alert alert-danger m-2">
      {{ errorMessage }}

      <div class="mt-2">
        <router-link to="/" class="btn btn-sm btn-danger">
          Back Home
        </router-link>
      </div>
    </div>

    <!-- Game -->
    <template v-else-if="game">

      <!-- Top Header -->
      <div class="d-flex align-items-center justify-content-between p-2 mb-2 bg-white rounded-3 shadow-sm border">

        <h5 class="m-0 text-dark fw-bold d-flex align-items-center gap-2">
          <i class="bi bi-controller text-warning fs-4"></i>

          {{ game.name }}
        </h5>

        <div class="text-end">
          <small class="d-block text-muted">
            Play Time
          </small>

          <small class="fw-bold">
            {{ formatTime(game.play_start) }}
            -
            {{ formatTime(game.play_end) }}
          </small>
        </div>

      </div>

      <!-- Closed -->
      <div v-if="!game.is_playable" class="alert alert-warning mx-1">
        <i class="bi bi-clock me-1"></i>

        Betting time for
        <strong>{{ game.name }}</strong>
        is currently closed.
      </div>

      <template v-else>

        <!-- Mode Tabs -->
        <div class="px-1 mb-3">

          <ul class="nav nav-pills nav-fill bg-light p-1 rounded-4 border shadow-xs">

            <li class="nav-item">

              <button class="nav-link fw-bold rounded-3 py-2" :class="{
                'active bg-warning text-dark shadow-sm':
                  activeTab === 'single'
              }" @click="changeMode('single')">
                🎯 Single (Jodi)
              </button>

            </li>

            <li class="nav-item">

              <button class="nav-link fw-bold rounded-3 py-2" :class="{
                'active bg-warning text-dark shadow-sm':
                  activeTab === 'harup'
              }" @click="changeMode('harup')">
                🎲 Harup
              </button>

            </li>

            <li class="nav-item">

              <button class="nav-link fw-bold rounded-3 py-2" :class="{
                'active bg-warning text-dark shadow-sm':
                  activeTab === 'crossing'
              }" @click="changeMode('crossing')">
                🔀 Crossing
              </button>

            </li>

          </ul>

        </div>

        <!-- SINGLE -->
        <div v-if="activeTab === 'single'" class="px-1">

          <div class="card p-2 mb-3 shadow-xs border-0 bg-white rounded-3">

            <small class="fw-bold text-muted mb-2 d-block fs-7">
              Select Quick Coin / Point Value:
            </small>

            <div class="d-flex gap-2 flex-wrap">

              <button v-for="chip in chipOptions" :key="chip" class="btn btn-sm rounded-pill fw-bold px-3" :class="selectedChip === chip
                ? 'btn-warning text-dark shadow-sm'
                : 'btn-outline-secondary'
                " @click="selectedChip = chip">
                ₹{{ chip }}
              </button>

            </div>

          </div>

          <div class="row g-2 pb-5">

            <div v-for="num in singleNumbers" :key="num" class="col-2 col-sm-2 col-md-1">

              <button
                class="btn w-100 p-2 position-relative d-flex flex-column align-items-center justify-content-center rounded-3 border"
                :class="singleBets[num]
                  ? 'btn-success text-white border-success shadow-sm'
                  : 'btn-white bg-white text-dark shadow-xs'
                  " @click="toggleSingleBet(num)">

                <span class="fw-bold fs-6">
                  {{ num }}
                </span>

                <span v-if="singleBets[num]" class="badge bg-warning text-dark p-1 mt-1 rounded-2 w-100">
                  ₹{{ singleBets[num] }}
                </span>

              </button>

            </div>

          </div>

        </div>

        <!-- HARUP -->
        <div v-if="activeTab === 'harup'" class="px-1">

          <div class="card p-3 mb-3 shadow-xs border-0 bg-white rounded-3">

            <div class="d-flex justify-content-between align-items-center">

              <span class="fw-bold text-dark">
                Points Per Digit:
              </span>

              <div class="input-group input-group-sm w-50">

                <span class="input-group-text bg-light fw-bold">
                  ₹
                </span>

                <input type="number" v-model.number="harupAmount" class="form-control text-center fw-bold fs-6" min="1"
                  step="1" />

              </div>

            </div>

          </div>

          <div class="row g-3">

            <!-- Ander -->
            <div class="col-12 col-md-6">

              <div class="card shadow-xs border-0 rounded-3 overflow-hidden">

                <div class="card-header bg-primary text-white fw-bold">
                  🅰️ Ander
                </div>

                <div class="card-body p-2 bg-white">

                  <div class="row g-2">

                    <div v-for="digit in 10" :key="'ander-' + digit" class="col-2">

                      <button class="btn w-100 p-2 rounded-3 fw-bold" :class="harupBets.ander[digit - 1]
                        ? 'btn-primary'
                        : 'btn-light border text-dark'
                        " @click="
                          toggleHarupBet(
                            'ander',
                            digit - 1
                          )
                          ">
                        {{ digit - 1 }}
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <!-- Bahar -->
            <div class="col-12 col-md-6">

              <div class="card shadow-xs border-0 rounded-3 overflow-hidden">

                <div class="card-header bg-info text-white fw-bold">
                  🅱️ Bahar
                </div>

                <div class="card-body p-2 bg-white">

                  <div class="row g-2">

                    <div v-for="digit in 10" :key="'bahar-' + digit" class="col-2">

                      <button class="btn w-100 p-2 rounded-3 fw-bold" :class="harupBets.bahar[digit - 1]
                        ? 'btn-info text-white'
                        : 'btn-light border text-dark'
                        " @click="
                          toggleHarupBet(
                            'bahar',
                            digit - 1
                          )
                          ">
                        {{ digit - 1 }}
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        <!-- CROSSING -->
        <div v-if="activeTab === 'crossing'" class="px-1">

          <div class="card p-3 shadow-xs border-0 mb-3 bg-white rounded-3">

            <h6 class="fw-bold mb-2 text-dark">
              Select Digits for Crossing
            </h6>

            <div class="d-flex gap-2 flex-wrap mb-3">

              <button v-for="digit in 10" :key="'cross-' + digit" class="btn rounded-circle fw-bold" :class="selectedCrossingDigits.includes(digit - 1)
                ? 'btn-dark'
                : 'btn-light border text-dark'
                " style="
                  width: 42px;
                  height: 42px;
                " @click="
                  toggleCrossingDigit(
                    digit - 1
                  )
                  ">
                {{ digit - 1 }}
              </button>

            </div>

            <div
              class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 bg-light p-2 rounded-3 border">

              <div class="form-check form-switch m-0">

                <input class="form-check-input" type="checkbox" id="joraSwitch" v-model="includeJora" />

                <label class="form-check-label fw-bold text-dark fs-7" for="joraSwitch">
                  Include Jora
                </label>

              </div>

              <div class="d-flex align-items-center gap-2">

                <small class="fw-bold text-muted">
                  Point/Jodi:
                </small>

                <input type="number" v-model.number="crossingAmount"
                  class="form-control form-control-sm text-center fw-bold rounded-2" style="width: 75px" min="1" />

              </div>

            </div>

            <div
              class="alert alert-secondary py-2 mb-0 d-flex justify-content-between align-items-center border-0 rounded-3">

              <small class="fw-bold">
                Generated:
                {{ generatedCrossingJodis.length }}
              </small>

            </div>

          </div>

          <div v-if="generatedCrossingJodis.length" class="card p-2 border-0 shadow-xs bg-white rounded-3">

            <small class="text-muted fw-bold mb-2 d-block fs-7">
              Combinations:
            </small>

            <div class="d-flex flex-wrap gap-1">

              <span v-for="jodi in generatedCrossingJodis" :key="jodi"
                class="badge bg-light text-dark border p-2 rounded-2">
                {{ jodi }}
                ₹{{ crossingAmount }}
              </span>

            </div>

          </div>

        </div>

        <!-- Sticky Summary -->
        <div class="sticky-bottom-bar position-fixed bottom-custom start-0 end-0 p-3 z-3">

          <div class="container p-0">

            <div
              class="card bg-dark text-white rounded-4 shadow-lg border-0 p-3 mx-auto max-w-600 border-top border-warning border-3">

              <div class="d-flex align-items-center justify-content-between">

                <div>

                  <small class="text-uppercase text-muted fw-semibold fs-8 d-block">
                    Selected
                  </small>

                  <div class="d-flex align-items-baseline gap-2">

                    <span class="fs-4 fw-bold text-warning">
                      ₹{{ grandTotalAmount }}
                    </span>

                    <span class="badge bg-secondary rounded-pill fs-8">
                      {{ totalBetsCount }} Bets
                    </span>

                  </div>

                </div>

                <button class="btn btn-warning btn-lg px-4 rounded-pill fw-bold text-dark shadow-sm" :disabled="totalBetsCount === 0 ||
                  grandTotalAmount <= 0 ||
                  isSubmitting ||
                  !game?.is_playable
                  " @click="submitBetsAPI">

                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm"></span>

                  <span v-else>
                    <i class="bi bi-check-circle-fill"></i>
                    Place Bet
                  </span>

                </button>

              </div>

            </div>

          </div>

        </div>

      </template>

    </template>

  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import { useToast } from 'vue-toastification'

import api from '../plugins/axios'

const toast = useToast()

const route = useRoute()
const router = useRouter()

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const game = ref(null)

const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')

const activeTab = ref('single')

/*
|--------------------------------------------------------------------------
| MODE CHANGE
|--------------------------------------------------------------------------
*/

const changeMode = (mode) => {

  if (activeTab.value === mode) {
    return
  }

  activeTab.value = mode

  clearSelections()
}

/*
|--------------------------------------------------------------------------
| SINGLE / JODI
|--------------------------------------------------------------------------
*/

const chipOptions = [
  10,
  50,
  100,
  500,
  1000,
]

const selectedChip = ref(10)

const singleBets = ref({})

const singleNumbers = Array.from(
  { length: 100 },
  (_, i) => String(i).padStart(2, '0')
)

const toggleSingleBet = (num) => {

  const current = singleBets.value[num]

  if (current !== undefined) {

    delete singleBets.value[num]

    return
  }

  singleBets.value[num] =
    Number(selectedChip.value)
}

/*
|--------------------------------------------------------------------------
| HARUP
|--------------------------------------------------------------------------
*/

const harupAmount = ref(10)

const harupBets = ref({
  ander: {},
  bahar: {},
})

const toggleHarupBet = (
  type,
  digit
) => {

  const current =
    harupBets.value[type][digit]

  if (current !== undefined) {

    delete harupBets.value[type][digit]

    return
  }

  const amount =
    Number(harupAmount.value)

  if (!Number.isFinite(amount) || amount < 1) {

    toast.warning(
      'Please enter a valid Harup amount.'
    )

    return
  }

  harupBets.value[type][digit] =
    amount
}

/*
|--------------------------------------------------------------------------
| CROSSING
|--------------------------------------------------------------------------
*/

const selectedCrossingDigits =
  ref([])

const includeJora = ref(true)

const crossingAmount = ref(10)

const toggleCrossingDigit = (digit) => {

  const index =
    selectedCrossingDigits.value.indexOf(digit)

  if (index !== -1) {

    selectedCrossingDigits.value.splice(
      index,
      1
    )

    return
  }

  selectedCrossingDigits.value.push(digit)
}

const generatedCrossingJodis =
  computed(() => {

    const digits =
      selectedCrossingDigits.value

    if (digits.length < 2) {
      return []
    }

    const result = []

    for (let i = 0; i < digits.length; i++) {

      for (let j = 0; j < digits.length; j++) {

        if (
          !includeJora.value &&
          digits[i] === digits[j]
        ) {
          continue
        }

        result.push(
          `${digits[i]}${digits[j]}`
        )
      }
    }

    return [
      ...new Set(result)
    ]
  })

/*
|--------------------------------------------------------------------------
| TOTALS
|--------------------------------------------------------------------------
*/

const totalSingleAmount =
  computed(() => {

    return Object
      .values(singleBets.value)
      .reduce(
        (total, amount) =>
          total + Number(amount || 0),
        0
      )
  })

const totalHarupAmount =
  computed(() => {

    const ander =
      Object
        .values(harupBets.value.ander)
        .reduce(
          (total, amount) =>
            total + Number(amount || 0),
          0
        )

    const bahar =
      Object
        .values(harupBets.value.bahar)
        .reduce(
          (total, amount) =>
            total + Number(amount || 0),
          0
        )

    return ander + bahar
  })

const totalCrossingAmount =
  computed(() => {

    const amount =
      Number(crossingAmount.value || 0)

    if (
      !Number.isFinite(amount) ||
      amount < 1
    ) {
      return 0
    }

    return (
      generatedCrossingJodis.value.length *
      amount
    )
  })

const grandTotalAmount =
  computed(() => {

    if (activeTab.value === 'single') {
      return totalSingleAmount.value
    }

    if (activeTab.value === 'harup') {
      return totalHarupAmount.value
    }

    if (activeTab.value === 'crossing') {
      return totalCrossingAmount.value
    }

    return 0
  })

const totalBetsCount =
  computed(() => {

    if (activeTab.value === 'single') {

      return Object.keys(
        singleBets.value
      ).length
    }

    if (activeTab.value === 'harup') {

      return (
        Object.keys(
          harupBets.value.ander
        ).length
        +
        Object.keys(
          harupBets.value.bahar
        ).length
      )
    }

    if (activeTab.value === 'crossing') {

      return generatedCrossingJodis.value.length
    }

    return 0
  })

/*
|--------------------------------------------------------------------------
| FETCH GAME
|--------------------------------------------------------------------------
*/

const fetchGame = async () => {

  isLoading.value = true
  errorMessage.value = ''

  try {

    const response =
      await api.get(
        `/games/${route.params.id}`
      )

    game.value =
      response.data?.data ?? null

    if (!game.value) {

      errorMessage.value =
        'Game not found.'
    }

  } catch (error) {

    console.error(
      'FETCH GAME ERROR:',
      error
    )

    errorMessage.value =
      error.response?.data?.message ||
      'Unable to load game.'

  } finally {

    isLoading.value = false
  }
}

/*
|--------------------------------------------------------------------------
| SUBMIT
|--------------------------------------------------------------------------
*/

const submitBetsAPI = async () => {

  if (isSubmitting.value) {
    return
  }

  /*
  |--------------------------------------------------------------------------
  | GAME CHECK
  |--------------------------------------------------------------------------
  */

  if (!game.value) {

    toast.error(
      'Game information is unavailable.'
    )

    return
  }

  if (!game.value.is_playable) {

    toast.warning(
      'This game is currently not playable.'
    )

    return
  }

  /*
  |--------------------------------------------------------------------------
  | AMOUNT CHECK
  |--------------------------------------------------------------------------
  */

  const totalAmount =
    Number(grandTotalAmount.value)

  const totalBets =
    Number(totalBetsCount.value)

  if (
    !Number.isFinite(totalAmount) ||
    totalAmount <= 0
  ) {

    toast.warning(
      'Please select at least one bet.'
    )

    return
  }

  if (
    !Number.isInteger(totalBets) ||
    totalBets <= 0
  ) {

    toast.warning(
      'Please select at least one bet.'
    )

    return
  }

  /*
  |--------------------------------------------------------------------------
  | CONFIRM
  |--------------------------------------------------------------------------
  */

  const confirmed = window.confirm(
    `Place bet for ₹${totalAmount.toFixed(2)}? This amount will be deducted from your wallet.`
  )

  if (!confirmed) {
    return
  }

  /*
  |--------------------------------------------------------------------------
  | BUILD PAYLOAD
  |--------------------------------------------------------------------------
  */

  const payload = {
    mode: activeTab.value,

    total_amount:
      Number(totalAmount.toFixed(2)),

    total_bets:
      totalBets,

    single_bets:
      activeTab.value === 'single'
        ? { ...singleBets.value }
        : {},

    harup_bets:
      activeTab.value === 'harup'
        ? {
          ander: {
            ...harupBets.value.ander,
          },
          bahar: {
            ...harupBets.value.bahar,
          },
        }
        : {
          ander: {},
          bahar: {},
        },

    crossing_jodis:
      activeTab.value === 'crossing'
        ? [
          ...generatedCrossingJodis.value
        ]
        : [],

    crossing_amount_per_jodi:
      activeTab.value === 'crossing'
        ? Number(crossingAmount.value)
        : null,
  }

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  isSubmitting.value = true

  try {

    const response =
      await api.post(
        `/games/${game.value.id}/bids`,
        payload
      )

    const data =
      response.data?.data

    toast.success(
      `Bet placed successfully! Order: ${data?.order_no ?? '-'} | Amount: ₹${data?.total_amount ?? totalAmount} | Balance: ₹${data?.balance ?? '-'}`,
      {
        timeout: 5000,
      }
    )

    clearSelections()

    /*
    |--------------------------------------------------------------------------
    | REFRESH GAME
    |--------------------------------------------------------------------------
    */

    await fetchGame()

  } catch (error) {

    console.error(
      'PLACE BET ERROR:',
      error
    )

    const responseData =
      error.response?.data

    const validationErrors =
      responseData?.errors

    let message =
      responseData?.message ||
      'Unable to place bet.'

    /*
    |--------------------------------------------------------------------------
    | LARAVEL VALIDATION ERRORS
    |--------------------------------------------------------------------------
    */

    if (
      validationErrors &&
      typeof validationErrors === 'object'
    ) {

      const messages = Object.values(
        validationErrors
      )
        .flat()
        .filter(Boolean)

      if (messages.length) {
        message = messages.join(' ')
      }
    }

    toast.error(
      message,
      {
        timeout: 6000,
      }
    )

  } finally {

    isSubmitting.value = false
  }
}

/*
|--------------------------------------------------------------------------
| CLEAR
|--------------------------------------------------------------------------
*/

const clearSelections = () => {

  singleBets.value = {}

  harupBets.value = {
    ander: {},
    bahar: {},
  }

  selectedCrossingDigits.value = []
}

/*
|--------------------------------------------------------------------------
| FORMAT TIME
|--------------------------------------------------------------------------
*/

const formatTime = (time) => {

  if (!time) {
    return '--'
  }

  const parts =
    String(time).split(':')

  if (parts.length < 2) {
    return '--'
  }

  const hours =
    Number(parts[0])

  const minutes =
    Number(parts[1])

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes)
  ) {
    return '--'
  }

  const date = new Date()

  date.setHours(
    hours,
    minutes,
    0,
    0
  )

  return date.toLocaleTimeString(
    [],
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  )
}

/*
|--------------------------------------------------------------------------
| MOUNT
|--------------------------------------------------------------------------
*/

onMounted(() => {

  if (!route.params.id) {

    router.push('/')

    return
  }

  fetchGame()
})
</script>

<style scoped>
.bottom-custom {
  bottom: 80px;
}
</style>
