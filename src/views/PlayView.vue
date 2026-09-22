<template>
  <div class="content-area pb-5 mb-5 position-relative">
    <!-- Top Header -->
    <div
      class="d-flex align-items-center justify-content-between p-2 mb-2 bg-white rounded-3 shadow-sm border"
    >
      <h5 class="m-0 text-dark fw-bold d-flex align-items-center gap-2">
        <i class="bi bi-controller text-warning fs-4"></i> Gali
      </h5>
    </div>

    <!-- Mode Selector Tabs -->
    <div class="px-1 mb-3">
      <ul class="nav nav-pills nav-fill bg-light p-1 rounded-4 border shadow-xs">
        <li class="nav-item">
          <button
            class="nav-link fw-bold rounded-3 py-2 transition-all"
            :class="{ 'active bg-warning text-dark shadow-sm': activeTab === 'single' }"
            @click="activeTab = 'single'"
          >
            🎯 Single (Jodi)
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link fw-bold rounded-3 py-2 transition-all"
            :class="{ 'active bg-warning text-dark shadow-sm': activeTab === 'harup' }"
            @click="activeTab = 'harup'"
          >
            🎲 Harup
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link fw-bold rounded-3 py-2 transition-all"
            :class="{ 'active bg-warning text-dark shadow-sm': activeTab === 'crossing' }"
            @click="activeTab = 'crossing'"
          >
            🔀 Crossing
          </button>
        </li>
      </ul>
    </div>

    <!-- TAB 1: SINGLE (JODI 00 - 99) -->
    <div v-if="activeTab === 'single'" class="px-1">
      <!-- Quick Amount Selector Chips -->
      <div class="card p-2 mb-3 shadow-xs border-0 bg-white rounded-3">
        <small class="fw-bold text-muted mb-2 d-block fs-7">Select Quick Coin / Point Value:</small>
        <div class="d-flex gap-2 flex-wrap">
          <button
            v-for="chip in chipOptions"
            :key="chip"
            class="btn btn-sm rounded-pill fw-bold px-3 transition-all"
            :class="
              selectedChip === chip ? 'btn-warning text-dark shadow-sm' : 'btn-outline-secondary'
            "
            @click="selectedChip = chip"
          >
            ₹{{ chip }}
          </button>
        </div>
      </div>

      <!-- 00-99 Grid -->
      <div class="row g-2 pb-5">
        <div v-for="num in singleNumbers" :key="num" class="col-2 col-sm-2 col-md-1">
          <button
            class="btn w-100 p-2 position-relative d-flex flex-column align-items-center justify-content-center rounded-3 border transition-all"
            :class="
              singleBets[num]
                ? 'btn-success text-white border-success shadow-sm scale-up'
                : 'btn-white bg-white text-dark shadow-xs'
            "
            @click="toggleSingleBet(num)"
          >
            <span class="fw-bold fs-6">{{ num }}</span>
            <span
              v-if="singleBets[num]"
              class="badge bg-warning text-dark p-1 mt-1 rounded-2 w-100 text-truncate"
              style="font-size: 0.65rem"
            >
              ₹{{ singleBets[num] }}
            </span>
          </button>
        </div>
      </div>
      <br />
      <br />
    </div>

    <!-- TAB 2: HARUP (ANDER / BAHAR) -->
    <div v-if="activeTab === 'harup'" class="px-1">
      <div class="card p-3 mb-3 shadow-xs border-0 bg-white rounded-3">
        <div class="d-flex justify-content-between align-items-center">
          <span class="fw-bold text-dark">Points Per Digit:</span>
          <div class="input-group input-group-sm w-50">
            <span class="input-group-text bg-light fw-bold">₹</span>
            <input
              type="number"
              v-model.number="harupAmount"
              class="form-control text-center fw-bold fs-6"
              min="5"
              step="5"
            />
          </div>
        </div>
      </div>

      <div class="row g-3">
        <!-- Ander (Inside) -->
        <div class="col-12 col-md-6">
          <div class="card shadow-xs border-0 rounded-3 overflow-hidden">
            <div class="card-header bg-primary text-white fw-bold py-2 fs-6">
              🅰️ Ander (Inside Digit)
            </div>
            <div class="card-body p-2 bg-white">
              <div class="row g-2">
                <div v-for="digit in 10" :key="'ander-' + (digit - 1)" class="col-2 col-sm-2">
                  <button
                    class="btn w-100 p-2 position-relative rounded-3 fw-bold transition-all"
                    :class="
                      harupBets.ander[digit - 1]
                        ? 'btn-primary shadow-xs'
                        : 'btn-light border text-dark'
                    "
                    @click="toggleHarupBet('ander', digit - 1)"
                  >
                    {{ digit - 1 }}
                    <span
                      v-if="harupBets.ander[digit - 1]"
                      class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    >
                      ✓
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bahar (Outside) -->
        <div class="col-12 col-md-6">
          <div class="card shadow-xs border-0 rounded-3 overflow-hidden">
            <div class="card-header bg-info text-white fw-bold py-2 fs-6">
              🅱️ Bahar (Outside Digit)
            </div>
            <div class="card-body p-2 bg-white">
              <div class="row g-2">
                <div v-for="digit in 10" :key="'bahar-' + (digit - 1)" class="col-2 col-sm-2">
                  <button
                    class="btn w-100 p-2 position-relative rounded-3 fw-bold transition-all"
                    :class="
                      harupBets.bahar[digit - 1]
                        ? 'btn-info text-white shadow-xs'
                        : 'btn-light border text-dark'
                    "
                    @click="toggleHarupBet('bahar', digit - 1)"
                  >
                    {{ digit - 1 }}
                    <span
                      v-if="harupBets.bahar[digit - 1]"
                      class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    >
                      ✓
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: CROSSING -->
    <div v-if="activeTab === 'crossing'" class="px-1">
      <div class="card p-3 shadow-xs border-0 mb-3 bg-white rounded-3">
        <h6 class="fw-bold mb-2 text-dark">1. Select Digits for Crossing</h6>
        <div class="d-flex gap-2 flex-wrap mb-3">
          <button
            v-for="digit in 10"
            :key="'cross-' + (digit - 1)"
            class="btn rounded-circle fw-bold transition-all"
            :class="
              selectedCrossingDigits.includes(digit - 1)
                ? 'btn-dark shadow-sm scale-up'
                : 'btn-light border text-dark'
            "
            style="width: 42px; height: 42px"
            @click="toggleCrossingDigit(digit - 1)"
          >
            {{ digit - 1 }}
          </button>
        </div>

        <div
          class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 bg-light p-2 rounded-3 border"
        >
          <div class="form-check form-switch m-0">
            <input class="form-check-input" type="checkbox" id="joraSwitch" v-model="includeJora" />
            <label class="form-check-label fw-bold text-dark fs-7" for="joraSwitch">
              Include Jora (11, 22...)
            </label>
          </div>
          <div class="d-flex align-items-center gap-2">
            <small class="fw-bold text-muted">Point/Jodi:</small>
            <input
              type="number"
              v-model.number="crossingAmount"
              class="form-control form-control-sm text-center fw-bold rounded-2"
              style="width: 75px"
            />
          </div>
        </div>

        <div
          class="alert alert-secondary py-2 mb-0 d-flex justify-content-between align-items-center border-0 rounded-3"
        >
          <small class="fw-bold">Generated Combinations: {{ generatedCrossingJodis.length }}</small>
        </div>
      </div>

      <!-- Generated Combinations Preview -->
      <div
        v-if="generatedCrossingJodis.length > 0"
        class="card p-2 border-0 shadow-xs bg-white rounded-3"
      >
        <small class="text-muted fw-bold mb-2 d-block fs-7">Combinations Preview:</small>
        <div class="d-flex flex-wrap gap-1 max-h-150 overflow-auto">
          <span
            v-for="jodi in generatedCrossingJodis"
            :key="jodi"
            class="badge bg-light text-dark border p-2 rounded-2"
          >
            {{ jodi }} (₹{{ crossingAmount }})
          </span>
        </div>
      </div>
    </div>

    <!-- 📌 FLOATING ELEVATED STICKY BOTTOM SUMMARY BAR -->
    <div class="sticky-bottom-bar position-fixed bottom-custom start-0 end-0 p-3 z-3">
      <div class="container p-0">
        <div
          class="card bg-dark text-white rounded-4 shadow-lg border-0 p-3 mx-auto max-w-600 border-top border-warning border-3"
        >
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <small class="text-uppercase text-muted fw-semibold fs-8 d-block"
                >Bets Selection</small
              >
              <div class="d-flex align-items-baseline gap-2">
                <span class="fs-4 fw-bold text-warning">₹{{ grandTotalAmount }}</span>
                <span class="badge bg-secondary rounded-pill fs-8">{{ totalBetsCount }} Bets</span>
              </div>
            </div>

            <button
              class="btn btn-warning btn-lg px-4 rounded-pill fw-bold text-dark shadow-sm d-flex align-items-center gap-2"
              :disabled="totalBetsCount === 0 || isSubmitting"
              @click="submitBetsAPI"
            >
              <span
                v-if="isSubmitting"
                class="spinner-border spinner-border-sm"
                role="status"
              ></span>
              <span v-else><i class="bi bi-check-circle-fill"></i> Place Bet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('single')
const isSubmitting = ref(false)

// --- SINGLE TAB LOGIC ---
const chipOptions = [10, 50, 100, 500, 1000]
const selectedChip = ref(10)
const singleBets = ref({})
const singleNumbers = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'))

const toggleSingleBet = (num) => {
  if (singleBets.value[num]) {
    delete singleBets.value[num]
  } else {
    singleBets.value[num] = selectedChip.value
  }
}

// --- HARUP TAB LOGIC ---
const harupAmount = ref(10)
const harupBets = ref({
  ander: {},
  bahar: {},
})

const toggleHarupBet = (type, digit) => {
  if (harupBets.value[type][digit]) {
    delete harupBets.value[type][digit]
  } else {
    harupBets.value[type][digit] = harupAmount.value
  }
}

// --- CROSSING TAB LOGIC ---
const selectedCrossingDigits = ref([])
const includeJora = ref(true)
const crossingAmount = ref(10)

const toggleCrossingDigit = (digit) => {
  const index = selectedCrossingDigits.value.indexOf(digit)
  if (index > -1) {
    selectedCrossingDigits.value.splice(index, 1)
  } else {
    selectedCrossingDigits.value.push(digit)
  }
}

const generatedCrossingJodis = computed(() => {
  const digits = selectedCrossingDigits.value
  const result = []
  if (digits.length < 2) return result

  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      if (!includeJora.value && digits[i] === digits[j]) continue
      result.push(`${digits[i]}${digits[j]}`)
    }
  }
  return result
})

// --- LIVE CALCULATIONS ---
const totalSingleAmount = computed(() => Object.values(singleBets.value).reduce((a, b) => a + b, 0))

const totalHarupAmount = computed(() => {
  const anderSum = Object.values(harupBets.value.ander).reduce((a, b) => a + b, 0)
  const baharSum = Object.values(harupBets.value.bahar).reduce((a, b) => a + b, 0)
  return anderSum + baharSum
})

const totalCrossingAmount = computed(() => {
  return generatedCrossingJodis.value.length * (crossingAmount.value || 0)
})

const grandTotalAmount = computed(() => {
  return totalSingleAmount.value + totalHarupAmount.value + totalCrossingAmount.value
})

const totalBetsCount = computed(() => {
  const singleCount = Object.keys(singleBets.value).length
  const harupCount =
    Object.keys(harupBets.value.ander).length + Object.keys(harupBets.value.bahar).length
  const crossingCount = generatedCrossingJodis.value.length
  return singleCount + harupCount + crossingCount
})

// --- MOCK API SUBMIT METHOD ---
const submitBetsAPI = async () => {
  if (grandTotalAmount.value <= 0) return

  isSubmitting.value = true

  const payload = {
    mode: activeTab.value,
    total_amount: grandTotalAmount.value,
    total_bets: totalBetsCount.value,
    single_bets: singleBets.value,
    harup_bets: harupBets.value,
    crossing_jodis: generatedCrossingJodis.value,
    crossing_amount_per_jodi: crossingAmount.value,
  }

  try {
    // Static API Simulation
    console.log('API Payload Sent:', payload)
    await new Promise((resolve) => setTimeout(resolve, 1200)) // 1.2 Second delay

    alert(`Success! Your bets worth ₹${grandTotalAmount.value} placed successfully.`)

    // Clear State after successful submit
    singleBets.value = {}
    harupBets.value = { ander: {}, bahar: {} }
    selectedCrossingDigits.value = []
  } catch (error) {
    alert('Something went wrong!')
  } finally {
    isSubmitting.value = false
  }
}
</script>
<style scoped>
.bottom-custom {
  bottom: 80px;
}
</style>
