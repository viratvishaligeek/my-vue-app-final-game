<template>
  <div class="content-area pb-5 mb-5 position-relative">
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <div class="mt-2 text-muted">Loading game...</div>
    </div>

    <div v-else-if="errorMessage" class="alert alert-danger m-2">
      {{ errorMessage }}
      <div class="mt-2">
        <router-link to="/" class="btn btn-sm btn-danger"> Back Home </router-link>
      </div>
    </div>
    <template v-else-if="game">
      <div class="d-flex align-items-center justify-content-between p-2 mb-2 bg-white rounded-3 shadow-sm border">
        <h5 class="m-0 text-dark fw-bold d-flex align-items-center gap-2">
          <i class="bi bi-controller text-warning fs-4"></i>
          {{ game.name }}
        </h5>

        <div class="text-end">
          <small class="d-block text-muted"> Play Time </small>
          <small class="fw-bold">
            {{ formatTime(game.play_start) }}
            -
            {{ formatTime(game.play_end) }}
          </small>
        </div>
      </div>

      <div v-if="!game.is_playable" class="alert alert-warning mx-1">
        <i class="bi bi-clock me-1"></i>

        Betting time for
        <strong>{{ game.name }}</strong>
        is currently closed.
      </div>

      <template v-else>
        <div class="px-1 mb-3">
          <ul class="nav nav-pills nav-fill bg-light p-1 rounded-4 border shadow-xs">
            <li class="nav-item">
              <button class="nav-link fw-bold rounded-3 py-2" :class="{
                'active bg-warning text-dark shadow-sm': activeTab === 'single',
              }" @click="changeMode('single')">
                🎯 Single (Jodi)
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link fw-bold rounded-3 py-2" :class="{
                'active bg-warning text-dark shadow-sm': activeTab === 'harup',
              }" @click="changeMode('harup')">
                🎲 Harup
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link fw-bold rounded-3 py-2" :class="{
                'active bg-warning text-dark shadow-sm': activeTab === 'crossing',
              }" @click="changeMode('crossing')">
                🔀 Crossing
              </button>
            </li>
          </ul>
        </div>

        <div v-if="activeTab === 'single'" class="px-1">
          <div class="card p-2 mb-3 shadow-xs border-0 bg-white rounded-3">
            <small class="fw-bold text-muted mb-2 d-block fs-7">
              Select Quick Coin / Point Value:
            </small>
            <div class="d-flex gap-2 flex-wrap">
              <button v-for="chip in chipOptions" :key="chip" type="button" class="btn btn-sm rounded-pill fw-bold px-3"
                :class="selectedChip === chip
                  ? 'btn-warning text-dark shadow-sm'
                  : 'btn-outline-secondary'
                  " @click="selectedChip = chip">
                ₹{{ chip }}
              </button>
            </div>
            <div class="input-group input-group-sm mt-2">
              <span class="input-group-text bg-light fw-bold">
                ₹
              </span>
              <input v-model.number="selectedChip" type="number" min="1" step="1"
                class="form-control text-center fw-bold" placeholder="Enter custom amount" />
            </div>
          </div>
          <div class="row g-2 pb-5">
            <div v-for="num in singleNumbers" :key="num" class="col-2 col-sm-2 col-md-1">
              <button type="button"
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


        <div v-if="activeTab === 'harup'" class="px-1">
          <div class="card p-2 mb-3 shadow-xs border-0 bg-white rounded-3">
            <small class="fw-bold text-muted mb-2 d-block fs-7">
              Select Quick Coin / Point Value:
            </small>
            <div class="d-flex gap-2 flex-wrap mb-2">
              <button v-for="chip in chipOptions" :key="chip" type="button" class="btn btn-sm rounded-pill fw-bold px-3"
                :class="harupAmount === chip ? 'btn-warning text-dark shadow-sm' : 'btn-outline-secondary'
                  " @click="harupAmount = chip">
                ₹{{ chip }}
              </button>
            </div>
            <div class="input-group input-group-sm mt-2">
              <span class="input-group-text bg-light fw-bold"> ₹ </span>
              <input v-model.number="harupAmount" type="number" min="1" step="1"
                class="form-control text-center fw-bold" placeholder="Custom amount" />
            </div>
          </div>
          <div class="card p-2 mb-3 shadow-xs border-0 bg-white rounded-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <small class="fw-bold text-muted"> Ander </small>
              <span class="badge bg-light text-dark border">
                {{ Object.keys(harupBets.ander).length }} Selected
              </span>
            </div>
            <div class="row g-2">
              <div v-for="digit in 10" :key="'ander-' + digit" class="col-2 col-sm-2 col-md-1">
                <button type="button"
                  class="btn w-100 p-2 position-relative d-flex flex-column align-items-center justify-content-center rounded-3 border"
                  :class="harupBets.ander[digit - 1]
                    ? 'btn-success text-white border-success shadow-sm'
                    : 'btn-white bg-white text-dark shadow-xs'
                    " @click="toggleHarupBet('ander', digit - 1)">
                  <span class="fw-bold fs-6">
                    {{ digit - 1 }}
                  </span>
                  <span v-if="harupBets.ander[digit - 1]" class="badge bg-warning text-dark p-1 mt-1 rounded-2 w-100">
                    ₹{{ harupBets.ander[digit - 1] }}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div class="card p-2 mb-3 shadow-xs border-0 bg-white rounded-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <small class="fw-bold text-muted"> Bahar </small>
              <span class="badge bg-light text-dark border">
                {{ Object.keys(harupBets.bahar).length }} Selected
              </span>
            </div>
            <div class="row g-2">
              <div v-for="digit in 10" :key="'bahar-' + digit" class="col-2 col-sm-2 col-md-1">
                <button type="button"
                  class="btn w-100 p-2 position-relative d-flex flex-column align-items-center justify-content-center rounded-3 border"
                  :class="harupBets.bahar[digit - 1]
                    ? 'btn-success text-white border-success shadow-sm'
                    : 'btn-white bg-white text-dark shadow-xs'
                    " @click="toggleHarupBet('bahar', digit - 1)">
                  <span class="fw-bold fs-6">
                    {{ digit - 1 }}
                  </span>
                  <span v-if="harupBets.bahar[digit - 1]" class="badge bg-warning text-dark p-1 mt-1 rounded-2 w-100">
                    ₹{{ harupBets.bahar[digit - 1] }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'crossing'" class="px-1">
          <div class="card p-2 mb-3 shadow-xs border-0 bg-white rounded-3">
            <small class="fw-bold text-muted mb-2 d-block fs-7">
              Select Quick Coin / Point Value:
            </small>
            <div class="d-flex gap-2 flex-wrap mb-2">
              <button v-for="chip in chipOptions" :key="chip" type="button" class="btn btn-sm rounded-pill fw-bold px-3"
                :class="crossingAmount === chip
                  ? 'btn-warning text-dark shadow-sm'
                  : 'btn-outline-secondary'
                  " @click="crossingAmount = chip">
                ₹{{ chip }}
              </button>
            </div>
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light fw-bold"> ₹ </span>
              <input v-model.number="crossingAmount" type="number" min="1" step="1"
                class="form-control text-center fw-bold" placeholder="Custom amount" />
            </div>
          </div>
          <div class="card p-2 mb-3 shadow-xs border-0 bg-white rounded-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <small class="fw-bold text-muted"> Select Digits </small>
              <span class="badge bg-light text-dark border">
                {{ selectedCrossingDigits.length }} Selected
              </span>
            </div>
            <div class="row g-2">
              <div v-for="digit in 10" :key="'cross-' + digit" class="col-2 col-sm-2 col-md-1">
                <button type="button" class="btn w-100 p-2 rounded-3 border fw-bold" :class="selectedCrossingDigits.includes(digit - 1)
                  ? 'btn-success text-white border-success shadow-sm'
                  : 'btn-white bg-white text-dark shadow-xs'
                  " @click="toggleCrossingDigit(digit - 1)">
                  {{ digit - 1 }}
                </button>
              </div>
            </div>
            <div class="form-check form-switch mt-3 mb-1">
              <input id="joraSwitch" v-model="includeJora" class="form-check-input" type="checkbox" />
              <label class="form-check-label fw-bold text-dark fs-7" for="joraSwitch">
                Include Jora
              </label>
            </div>
          </div>
          <div v-if="generatedCrossingJodis.length" class="card p-2 shadow-xs border-0 bg-white rounded-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <small class="text-muted fw-bold fs-7"> Generated Jodis </small>
              <span class="badge bg-light text-dark border">
                {{ generatedCrossingJodis.length }}
              </span>
            </div>
            <div class="row g-2">
              <div v-for="jodi in generatedCrossingJodis" :key="jodi" class="col-2 col-sm-2 col-md-1">
                <div
                  class="btn w-100 p-2 position-relative d-flex flex-column align-items-center justify-content-center rounded-3 border btn-success text-white border-success shadow-sm">
                  <span class="fw-bold fs-6">
                    {{ jodi }}
                  </span>
                  <span class="badge bg-warning text-dark p-1 mt-1 rounded-2 w-100">
                    ₹{{ crossingAmount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-muted py-4">
            <i class="bi bi-grid-3x3-gap fs-3 d-block mb-2"></i>
            <small> Select at least two digits to generate combinations. </small>
          </div>
        </div>

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
                    <span class="fs-4 fw-bold text-warning"> ₹{{ grandTotalAmount }} </span>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
import api from '../plugins/axios'
const toast = useToast()
const route = useRoute()
const router = useRouter()


const game = ref(null)

const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')

const activeTab = ref('single')


const changeMode = (mode) => {
  if (activeTab.value === mode) {
    return
  }

  activeTab.value = mode

  clearSelections()
}


const chipOptions = [10, 50, 100, 500, 1000]

const selectedChip = ref(10)

const singleBets = ref({})

const singleNumbers = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'))

const toggleSingleBet = (num) => {
  const current = singleBets.value[num]

  if (current !== undefined) {
    delete singleBets.value[num]

    return
  }

  singleBets.value[num] = Number(selectedChip.value)
}


const harupAmount = ref(10)

const harupBets = ref({
  ander: {},
  bahar: {},
})

const toggleHarupBet = (type, digit) => {
  const current = harupBets.value[type][digit]

  if (current !== undefined) {
    delete harupBets.value[type][digit]

    return
  }

  const amount = Number(harupAmount.value)

  if (!Number.isFinite(amount) || amount < 1) {
    toast.warning('Please enter a valid Harup amount.')

    return
  }

  harupBets.value[type][digit] = amount
}


const selectedCrossingDigits = ref([])

const includeJora = ref(true)

const crossingAmount = ref(10)

const toggleCrossingDigit = (digit) => {
  const index = selectedCrossingDigits.value.indexOf(digit)

  if (index !== -1) {
    selectedCrossingDigits.value.splice(index, 1)

    return
  }

  selectedCrossingDigits.value.push(digit)
}

const generatedCrossingJodis = computed(() => {
  const digits = selectedCrossingDigits.value

  if (digits.length < 2) {
    return []
  }

  const result = []

  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      if (!includeJora.value && digits[i] === digits[j]) {
        continue
      }

      result.push(`${digits[i]}${digits[j]}`)
    }
  }

  return [...new Set(result)]
})


const totalSingleAmount = computed(() => {
  return Object.values(singleBets.value).reduce((total, amount) => total + Number(amount || 0), 0)
})

const normalizeAmount = (value) => {
  const amount = Number(value)

  return Number.isFinite(amount) && amount > 0 ? amount : 0
}

const totalHarupAmount = computed(() => {
  const ander = Object.values(harupBets.value.ander).reduce(
    (total, amount) => total + normalizeAmount(amount),
    0,
  )

  const bahar = Object.values(harupBets.value.bahar).reduce(
    (total, amount) => total + normalizeAmount(amount),
    0,
  )

  return ander + bahar
})

const totalCrossingAmount = computed(() => {
  const amount = normalizeAmount(crossingAmount.value)
  return generatedCrossingJodis.value.length * amount
})

const grandTotalAmount = computed(() => {
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

const totalBetsCount = computed(() => {
  if (activeTab.value === 'single') {
    return Object.keys(singleBets.value).length
  }

  if (activeTab.value === 'harup') {
    return Object.keys(harupBets.value.ander).length + Object.keys(harupBets.value.bahar).length
  }

  if (activeTab.value === 'crossing') {
    return generatedCrossingJodis.value.length
  }

  return 0
})


const fetchGame = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get(`/games/${route.params.id}`)

    game.value = response.data?.data ?? null

    if (!game.value) {
      errorMessage.value = 'Game not found.'
    }
  } catch (error) {
    console.error('FETCH GAME ERROR:', error)

    errorMessage.value = error.response?.data?.message || 'Unable to load game.'
  } finally {
    isLoading.value = false
  }
}


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
    toast.error('Game information is unavailable.')

    return
  }

  if (!game.value.is_playable) {
    toast.warning('This game is currently not playable.')

    return
  }



  const totalAmount = Number(grandTotalAmount.value)

  const totalBets = Number(totalBetsCount.value)

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    toast.warning('Please select at least one bet.')

    return
  }

  if (!Number.isInteger(totalBets) || totalBets <= 0) {
    toast.warning('Please select at least one bet.')

    return
  }

  /*
  |--------------------------------------------------------------------------
  | CONFIRM
  |--------------------------------------------------------------------------
  */

  const result = await Swal.fire({
    title: 'Place Bet?',
    html: `
    <div class="bet-confirm-box">
      <div class="bet-confirm-amount">
        ₹${totalAmount.toFixed(2)}
      </div>

      <div class="bet-confirm-text">
        ${totalBets} ${totalBets === 1 ? 'bet' : 'bets'} selected
      </div>

      <div class="bet-confirm-warning">
        <i class="bi bi-wallet2"></i>
        This amount will be deducted from your wallet.
      </div>
    </div>
  `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Place Bet',
    cancelButtonText: 'No, Cancel',
    reverseButtons: true,
    focusCancel: true,
    buttonsStyling: false,
    customClass: {
      popup: 'mobile-bet-swal',
      title: 'mobile-bet-swal-title',
      htmlContainer: 'mobile-bet-swal-content',
      confirmButton: 'btn btn-warning fw-bold rounded-pill px-4',
      cancelButton: 'btn btn-light border fw-bold rounded-pill px-4 me-2',
    },
  })

  if (!result.isConfirmed) {
    return
  }


  const payload = {
    mode: activeTab.value,

    total_amount: Number(totalAmount.toFixed(2)),

    total_bets: totalBets,

    single_bets: activeTab.value === 'single' ? { ...singleBets.value } : {},

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

    crossing_jodis: activeTab.value === 'crossing' ? [...generatedCrossingJodis.value] : [],

    crossing_amount_per_jodi: activeTab.value === 'crossing' ? Number(crossingAmount.value) : null,
  }


  isSubmitting.value = true

  try {
    const response = await api.post(`/games/${game.value.id}/bids`, payload)

    const data = response.data?.data

    const placedAmount = Number(data?.total_amount ?? totalAmount)
    const remainingBalance = data?.balance

    toast.success(
      `Bet placed successfully • ₹${placedAmount.toFixed(2)}`,
      {
        timeout: 3000,
        closeOnClick: true,
        pauseOnHover: true,
      },
    )

    clearSelections()

    await fetchGame()
  } catch (error) {
    console.error('PLACE BET ERROR:', error)

    const responseData = error.response?.data

    const validationErrors = responseData?.errors

    let message = responseData?.message || 'Unable to place bet.'

    if (validationErrors && typeof validationErrors === 'object') {
      const messages = Object.values(validationErrors).flat().filter(Boolean)

      if (messages.length) {
        message = messages.join(' ')
      }
    }

    toast.error(message, {
      timeout: 6000,
    })
  } finally {
    isSubmitting.value = false
  }
}


const clearSelections = () => {
  singleBets.value = {}

  harupBets.value = {
    ander: {},
    bahar: {},
  }

  selectedCrossingDigits.value = []
}


const formatTime = (time) => {
  if (!time) {
    return '--'
  }

  const parts = String(time).split(':')

  if (parts.length < 2) {
    return '--'
  }

  const hours = Number(parts[0])

  const minutes = Number(parts[1])

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return '--'
  }

  const date = new Date()

  date.setHours(hours, minutes, 0, 0)

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}


onMounted(() => {
  if (!route.params.id) {
    router.push('/')

    return
  }

  fetchGame()
})
</script>

<style scoped>
.content-area {
  width: 100%;
  overflow-x: hidden;
  padding-bottom: 130px !important;
}



.game-header {
  min-height: 56px;
}



.nav-pills {
  gap: 4px;
}

.nav-pills .nav-link {
  min-height: 42px;
  font-size: 0.72rem;
  white-space: nowrap;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.nav-pills .nav-link:active {
  transform: scale(0.97);
}



.row.g-2 {
  --bs-gutter-x: 0.45rem;
  --bs-gutter-y: 0.45rem;
}

.col-2 {
  width: 20%;
  flex: 0 0 20%;
  max-width: 20%;
}



.btn.w-100.position-relative,
.btn.w-100.p-2.rounded-3 {
  min-height: 54px;
  width: 100%;
  padding: 6px !important;
  border-radius: 12px !important;

  display: flex;
  align-items: center;
  justify-content: center;

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease;

  -webkit-tap-highlight-color: transparent;
}

.btn.w-100.position-relative:active,
.btn.w-100.p-2.rounded-3:active {
  transform: scale(0.94);
}



.btn.w-100.position-relative>.fw-bold.fs-6 {
  font-size: 0.95rem !important;
  line-height: 1;
}



.btn.w-100.position-relative .badge {
  width: 100%;
  min-height: 17px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 0.58rem;
  font-weight: 800;

  margin-top: 4px !important;
  padding: 3px 2px !important;

  overflow: hidden;
  white-space: nowrap;
}



.single-jodi-grid {
  width: 100%;
}



.harup-section-title {
  font-size: 1.05rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: #212529;
}

.harup-section-title.ander-title {
  color: #0d6efd;
}

.harup-section-title.bahar-title {
  color: #dc3545;
}

.harup-title-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 1rem;
}

.ander-title .harup-title-icon {
  background: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.bahar-title .harup-title-icon {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}



.crossing-jodi {
  min-height: 54px;
  width: 100%;
  padding: 6px !important;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border-radius: 12px !important;
}

.crossing-jodi>.fw-bold {
  font-size: 0.92rem;
  line-height: 1;
}

.crossing-jodi .badge {
  width: 100%;
  font-size: 0.58rem;
  padding: 3px 2px !important;
  margin-top: 4px !important;
}



.btn-success {
  box-shadow:
    0 4px 12px rgba(25, 135, 84, 0.22) !important;
}

.btn-success:active {
  transform: scale(0.94);
}



.card {
  border-radius: 16px !important;
}

.card.shadow-xs {
  box-shadow:
    0 3px 12px rgba(20, 35, 70, 0.055) !important;
}



.btn.rounded-pill {
  min-height: 36px;
}

.input-group {
  min-height: 40px;
}

.input-group .form-control {
  min-height: 40px;
}



.harup-card {
  border: 1px solid rgba(0, 0, 0, 0.045) !important;
}


.sticky-bottom-bar {
  bottom: 80px;
  left: 0;
  right: 0;

  padding:
    8px 8px calc(8px + env(safe-area-inset-bottom));

  background: linear-gradient(to top,
      rgba(248, 249, 250, 0.98),
      rgba(248, 249, 250, 0.88),
      transparent);

  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);

  z-index: 1030;
}

.sticky-bottom-bar .card {
  width: 100%;
  border-radius: 18px !important;
  padding: 11px !important;

  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.25) !important;
}

.sticky-bottom-bar .btn-warning {
  min-height: 44px;
  font-size: 0.82rem;
  white-space: nowrap;
}

.sticky-bottom-bar .fs-4 {
  font-size: 1.1rem !important;
}

.sticky-bottom-bar .badge {
  font-size: 0.58rem;
}



.mobile-bet-swal {
  width: calc(100% - 28px) !important;
  max-width: 390px !important;
  border-radius: 22px !important;
  padding: 22px 18px !important;
}

.mobile-bet-swal-title {
  font-size: 1.25rem !important;
  font-weight: 800 !important;
}

.mobile-bet-swal-content {
  margin-top: 5px !important;
}

.bet-confirm-box {
  padding-top: 2px;
}

.bet-confirm-amount {
  font-size: 2rem;
  line-height: 1;
  font-weight: 900;
  color: #f0ad00;
  margin-bottom: 8px;
}

.bet-confirm-text {
  color: #6c757d;
  font-size: 0.82rem;
  font-weight: 600;
}

.bet-confirm-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  margin-top: 13px;
  padding: 9px 10px;

  border-radius: 10px;

  color: #856404;
  background: #fff3cd;

  font-size: 0.72rem;
  font-weight: 600;
}

.swal2-actions {
  width: 100%;
  gap: 7px;
}

.swal2-actions .btn {
  min-height: 42px;
  flex: 1;
  font-size: 0.76rem;
}



.Vue-Toastification__toast {
  border-radius: 14px !important;
  min-height: 48px !important;
  padding: 10px 13px !important;
  font-size: 0.78rem !important;
  font-weight: 600;
}

.Vue-Toastification__toast--success {
  background: #198754 !important;
}

.Vue-Toastification__toast--error {
  background: #dc3545 !important;
}

.Vue-Toastification__toast--warning {
  background: #ffc107 !important;
  color: #212529 !important;
}



@media (max-width: 360px) {

  .nav-pills .nav-link {
    font-size: 0.64rem;
    padding-left: 4px !important;
    padding-right: 4px !important;
  }

  .btn.w-100.position-relative,
  .btn.w-100.p-2.rounded-3,
  .crossing-jodi {
    min-height: 50px;
    border-radius: 10px !important;
  }

  .btn.w-100.position-relative>.fw-bold.fs-6 {
    font-size: 0.85rem !important;
  }

  .btn.w-100.position-relative .badge,
  .crossing-jodi .badge {
    font-size: 0.52rem;
  }

  .sticky-bottom-bar .card {
    padding: 9px !important;
  }

  .sticky-bottom-bar .btn-warning {
    padding-left: 13px !important;
    padding-right: 13px !important;
  }
}



@media (min-width: 576px) {

  .col-2 {
    width: 10%;
    flex: 0 0 10%;
    max-width: 10%;
  }

  .btn.w-100.position-relative,
  .btn.w-100.p-2.rounded-3,
  .crossing-jodi {
    min-height: 58px;
  }
}

.card>.d-flex>small.fw-bold.text-muted {
  font-size: 1.05rem !important;
  font-weight: 900 !important;
  letter-spacing: 0.03em;
  color: #212529 !important;
}

.card>.d-flex>small.fw-bold.text-muted::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 6px;
  margin-bottom: 2px;
  border-radius: 50%;
  background: #0d6efd;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.08);
}
</style>
