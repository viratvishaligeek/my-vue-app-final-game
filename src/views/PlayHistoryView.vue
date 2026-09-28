<template>
  <div class="content-area pb-5 mb-5 position-relative history-bg">
    <div class="container-fluid px-2 px-md-3 py-2">
      <!-- 1. SLEEK TOP CONTROL BAR -->
      <div
        class="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-dark text-white position-relative overflow-hidden"
      >
        <div
          class="d-flex align-items-center justify-content-between flex-wrap gap-2 position-relative z-1"
        >
          <div class="d-flex align-items-center gap-2">
            <div
              class="icon-circle bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center fw-black"
            >
              <i class="bi bi-clock-history fs-5"></i>
            </div>
            <div>
              <h6 class="fw-black text-white mb-0">Play History & Slip Ledger</h6>
              <span class="fs-8 text-white-50">Instant Bet & Result Breakdown</span>
            </div>
          </div>

          <!-- Compact Pill Date Picker -->
          <div
            class="d-flex align-items-center gap-2 bg-white bg-opacity-10 px-3 py-1-5 rounded-pill border border-white-15"
          >
            <i class="bi bi-calendar-event text-warning fs-7"></i>
            <input
              type="date"
              class="form-control-plaintext form-control-sm text-white fw-bold fs-8 font-monospace p-0 border-0 shadow-none cursor-pointer"
              style="width: 110px"
              v-model="selectedDate"
              :max="todayDateStr"
              @change="fetchPlayHistory"
            />
            <button
              v-if="selectedDate !== todayDateStr"
              @click="resetToToday"
              class="btn btn-xs btn-warning text-dark fw-bold rounded-pill px-2 py-0 fs-8"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      <!-- 2. MINI STATS BAR -->
      <div class="row g-2 mb-3">
        <div class="col-4">
          <div
            class="card border-0 shadow-xs rounded-3 p-2 text-center bg-white border-start border-3 border-danger"
          >
            <span class="fs-8 text-muted fw-bold text-uppercase d-block">Staked</span>
            <strong class="text-dark fs-7 font-monospace"
              >₹{{ formatCurrency(dailyStats.totalSpent) }}</strong
            >
          </div>
        </div>
        <div class="col-4">
          <div
            class="card border-0 shadow-xs rounded-3 p-2 text-center bg-white border-start border-3 border-warning"
          >
            <span class="fs-8 text-muted fw-bold text-uppercase d-block">Total Slips</span>
            <strong class="text-dark fs-7 font-monospace">{{ dailyStats.totalSlips }}</strong>
          </div>
        </div>
        <div class="col-4">
          <div
            class="card border-0 shadow-xs rounded-3 p-2 text-center bg-white border-start border-3 border-success"
          >
            <span class="fs-8 text-muted fw-bold text-uppercase d-block">Winnings</span>
            <strong class="text-success fs-7 font-monospace"
              >₹{{ formatCurrency(dailyStats.totalWon) }}</strong
            >
          </div>
        </div>
      </div>

      <!-- 3. COMPACT SLIPS LIST -->
      <div class="row">
        <div class="col-12 col-xl-10 mx-auto">
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-4">
            <div class="spinner-grow spinner-grow-sm text-warning" role="status"></div>
            <p class="text-muted fs-8 mt-2">Loading play history...</p>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="filteredHistory.length === 0"
            class="card border-0 shadow-xs rounded-4 py-4 text-center bg-white"
          >
            <i class="bi bi-ticket-perforated display-5 text-warning mb-2"></i>
            <h6 class="fw-bold text-dark fs-7 mb-1">No Slips Found for {{ selectedDate }}</h6>
            <p class="text-muted fs-8 mb-2">Try selecting another date or play a new game.</p>
            <div>
              <router-link
                to="/play"
                class="btn btn-sm btn-warning rounded-pill fw-bold px-3 text-dark"
              >
                Play Games Now
              </router-link>
            </div>
          </div>

          <!-- Slips Loop -->
          <div v-else class="d-flex flex-column gap-2">
            <div
              v-for="slip in filteredHistory"
              :key="slip.id"
              class="card border-0 shadow-xs rounded-4 bg-white overflow-hidden history-card"
            >
              <!-- Ticket Main Compact Header -->
              <div
                class="p-2 px-3 d-flex align-items-center justify-content-between gap-2 border-bottom border-light"
              >
                <!-- Game Name & Mode -->
                <div class="d-flex align-items-center gap-2">
                  <span
                    class="badge bg-dark text-warning fw-black px-2 py-1 rounded-2 fs-8 font-monospace"
                  >
                    {{ slip.game_name }}
                  </span>
                  <span
                    class="badge bg-light text-secondary border rounded-pill px-2 py-1 fs-8 fw-semibold"
                  >
                    {{ getModeLabel(slip.mode) }}
                  </span>
                </div>

                <!-- Game Status Badge -->
                <div>
                  <span
                    v-if="slip.status === 'running'"
                    class="badge bg-warning text-dark fw-bold px-2 py-1 rounded-pill fs-8 pulse-gold"
                  >
                    <i class="bi bi-clock-history me-1"></i> RUNNING
                  </span>
                  <span
                    v-else-if="slip.status === 'won'"
                    class="badge bg-success text-white fw-bold px-2 py-1 rounded-pill fs-8"
                  >
                    <i class="bi bi-trophy-fill me-1"></i> WON ({{ slip.winning_number }})
                  </span>
                  <span
                    v-else
                    class="badge bg-secondary text-white fw-semibold px-2 py-1 rounded-pill fs-8"
                  >
                    CLOSED ({{ slip.winning_number }})
                  </span>
                </div>
              </div>

              <!-- Ticket Content Strip -->
              <div
                class="p-2 px-3 bg-light-subtle d-flex align-items-center justify-content-between gap-2"
              >
                <div class="d-flex align-items-center gap-3">
                  <div>
                    <span class="text-muted fs-8 d-block">Time / ID</span>
                    <strong class="text-dark fs-8 font-monospace"
                      >{{ formatTime(slip.created_at) }} • #{{ slip.slip_code }}</strong
                    >
                  </div>
                  <div class="border-start ps-3 d-none d-sm-block">
                    <span class="text-muted fs-8 d-block">Bets Selection</span>
                    <strong class="text-dark fs-8">{{ slip.total_bets_count }} Number(s)</strong>
                  </div>
                </div>

                <!-- Right Side Stake & Action Button -->
                <div class="d-flex align-items-center gap-2">
                  <div class="text-end me-1">
                    <span class="text-muted fs-8 d-block fw-semibold">Total Amount</span>
                    <span class="fs-7 fw-black text-danger font-monospace"
                      >₹{{ formatCurrency(slip.total_amount) }}</span
                    >
                  </div>

                  <button
                    @click="toggleSlipDetails(slip.id)"
                    class="btn btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center transition-all"
                    :class="
                      activeExpandedId === slip.id
                        ? 'btn-danger text-white'
                        : 'btn-light border text-dark'
                    "
                    style="width: 32px; height: 32px"
                  >
                    <i
                      :class="[
                        'bi',
                        activeExpandedId === slip.id ? 'bi-chevron-up' : 'bi-chevron-down',
                      ]"
                    ></i>
                  </button>
                </div>
              </div>

              <!-- COLLAPSIBLE DETAILED BET BREAKDOWN -->
              <div v-if="activeExpandedId === slip.id" class="p-3 bg-white border-top border-light">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="fs-8 fw-bold text-uppercase text-muted tracking-wider"
                    >Itemized Bet List</span
                  >
                  <span class="fs-8 badge bg-secondary-subtle text-secondary font-monospace"
                    >{{ slip.total_bets_count }} Bets Applied</span
                  >
                </div>

                <!-- 1. SINGLE (JODI) BREAKDOWN -->
                <div v-if="slip.mode === 'single'" class="row g-1">
                  <div
                    v-for="(amount, number) in slip.single_bets"
                    :key="number"
                    class="col-3 col-sm-2 col-md-1"
                  >
                    <div class="p-1 rounded-2 border bg-light text-center shadow-xs">
                      <span class="d-block font-monospace fw-black fs-7 text-dark">{{
                        number
                      }}</span>
                      <span class="badge bg-warning text-dark p-0 px-1 rounded-1 fw-bold fs-8"
                        >₹{{ amount }}</span
                      >
                    </div>
                  </div>
                </div>

                <!-- 2. HARUP BREAKDOWN -->
                <div v-else-if="slip.mode === 'harup'" class="row g-2">
                  <div
                    v-if="Object.keys(slip.harup_bets.ander || {}).length > 0"
                    class="col-12 col-sm-6"
                  >
                    <div class="p-2 border rounded-3 bg-primary-subtle border-primary-subtle">
                      <span class="fs-8 fw-bold text-primary d-block mb-1">🅰️ Ander (Inside):</span>
                      <div class="d-flex flex-wrap gap-1">
                        <span
                          v-for="(amt, digit) in slip.harup_bets.ander"
                          :key="'a-' + digit"
                          class="badge bg-white text-primary border border-primary p-1 rounded-2 fs-8 font-monospace"
                        >
                          Digit {{ digit }} = ₹{{ amt }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="Object.keys(slip.harup_bets.bahar || {}).length > 0"
                    class="col-12 col-sm-6"
                  >
                    <div class="p-2 border rounded-3 bg-info-subtle border-info-subtle">
                      <span class="fs-8 fw-bold text-info d-block mb-1">🅱️ Bahar (Outside):</span>
                      <div class="d-flex flex-wrap gap-1">
                        <span
                          v-for="(amt, digit) in slip.harup_bets.bahar"
                          :key="'b-' + digit"
                          class="badge bg-white text-info border border-info p-1 rounded-2 fs-8 font-monospace"
                        >
                          Digit {{ digit }} = ₹{{ amt }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 3. CROSSING BREAKDOWN -->
                <div v-else-if="slip.mode === 'crossing'">
                  <div class="mb-2 d-flex align-items-center gap-1 fs-8 text-muted">
                    <span>Digits Selected:</span>
                    <span
                      v-for="d in slip.crossing_digits"
                      :key="d"
                      class="badge bg-dark text-warning font-monospace py-1 px-2"
                      >{{ d }}</span
                    >
                    <span class="ms-auto text-dark fw-bold"
                      >₹{{ slip.crossing_amount_per_jodi }}/Jodi</span
                    >
                  </div>
                  <div
                    class="d-flex flex-wrap gap-1 max-h-120 overflow-auto p-2 bg-light rounded-3 border"
                  >
                    <span
                      v-for="jodi in slip.crossing_jodis"
                      :key="jodi"
                      class="badge bg-white text-dark border px-2 py-1 rounded-2 fs-8 font-monospace shadow-xs"
                    >
                      {{ jodi }} (₹{{ slip.crossing_amount_per_jodi }})
                    </span>
                  </div>
                </div>

                <!-- Footer Winnings Alert if Won -->
                <div
                  v-if="slip.status === 'won'"
                  class="mt-2 p-2 bg-success text-white rounded-3 d-flex align-items-center justify-content-between fs-8 fw-bold"
                >
                  <span><i class="bi bi-trophy-fill me-1"></i> Winning Amount Credited:</span>
                  <span class="fs-7 font-monospace">+₹{{ formatCurrency(slip.win_amount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const getTodayString = () => new Date().toISOString().split('T')[0]

const todayDateStr = ref(getTodayString())
const selectedDate = ref(getTodayString())
const isLoading = ref(false)
const activeExpandedId = ref(null)

// 6 COMPREHENSIVE MOCK EXAMPLES (2 Single Jodi, 2 Harup, 2 Crossing)
const historyRawData = ref([
  // --- 1. SINGLE JODI (RUNNING) ---
  {
    id: 201,
    slip_code: 'BSG1001',
    game_name: 'Gali',
    mode: 'single',
    date: getTodayString(),
    created_at: `${getTodayString()}T15:20:00`,
    total_amount: 250,
    total_bets_count: 3,
    status: 'running',
    winning_number: null,
    win_amount: 0,
    single_bets: { '05': 100, 22: 50, 89: 100 },
  },
  // --- 2. SINGLE JODI (CLOSED - WON) ---
  {
    id: 202,
    slip_code: 'BSG1002',
    game_name: 'Disawar',
    mode: 'single',
    date: getTodayString(),
    created_at: `${getTodayString()}T08:10:00`,
    total_amount: 300,
    total_bets_count: 3,
    status: 'won',
    winning_number: '47',
    win_amount: 9000,
    single_bets: { 47: 100, 12: 100, 90: 100 },
  },

  // --- 3. HARUP (RUNNING) ---
  {
    id: 203,
    slip_code: 'BSG1003',
    game_name: 'Faridabad',
    mode: 'harup',
    date: getTodayString(),
    created_at: `${getTodayString()}T16:05:00`,
    total_amount: 200,
    total_bets_count: 3,
    status: 'running',
    winning_number: null,
    win_amount: 0,
    harup_bets: {
      ander: { 3: 50, 7: 50 },
      bahar: { 9: 100 },
    },
  },
  // --- 4. HARUP (CLOSED - LOST) ---
  {
    id: 204,
    slip_code: 'BSG1004',
    game_name: 'Ghaziabad',
    mode: 'harup',
    date: getTodayString(),
    created_at: `${getTodayString()}T13:40:00`,
    total_amount: 100,
    total_bets_count: 2,
    status: 'lost',
    winning_number: '52',
    win_amount: 0,
    harup_bets: {
      ander: { 1: 50 },
      bahar: { 8: 50 },
    },
  },

  // --- 5. CROSSING (RUNNING) ---
  {
    id: 205,
    slip_code: 'BSG1005',
    game_name: 'Gali',
    mode: 'crossing',
    date: getTodayString(),
    created_at: `${getTodayString()}T16:30:00`,
    total_amount: 160,
    total_bets_count: 16,
    status: 'running',
    winning_number: null,
    win_amount: 0,
    crossing_digits: [1, 2, 3, 4],
    crossing_amount_per_jodi: 10,
    crossing_jodis: [
      '11',
      '12',
      '13',
      '14',
      '21',
      '22',
      '23',
      '24',
      '31',
      '32',
      '33',
      '34',
      '41',
      '42',
      '43',
      '44',
    ],
  },
  // --- 6. CROSSING (CLOSED - WON) ---
  {
    id: 206,
    slip_code: 'BSG1006',
    game_name: 'Disawar',
    mode: 'crossing',
    date: getTodayString(),
    created_at: `${getTodayString()}T07:15:00`,
    total_amount: 90,
    total_bets_count: 9,
    status: 'won',
    winning_number: '56',
    win_amount: 900,
    crossing_digits: [5, 6, 7],
    crossing_amount_per_jodi: 10,
    crossing_jodis: ['55', '56', '57', '65', '66', '67', '75', '76', '77'],
  },
])

const filteredHistory = computed(() => {
  return historyRawData.value.filter((item) => item.date === selectedDate.value)
})

const dailyStats = computed(() => {
  const slips = filteredHistory.value
  return {
    totalSlips: slips.length,
    totalSpent: slips.reduce((sum, item) => sum + item.total_amount, 0),
    totalWon: slips.reduce((sum, item) => sum + (item.win_amount || 0), 0),
  }
})

const toggleSlipDetails = (id) => {
  activeExpandedId.value = activeExpandedId.value === id ? null : id
}

const resetToToday = () => {
  selectedDate.value = todayDateStr.value
  fetchPlayHistory()
}

const fetchPlayHistory = async () => {
  isLoading.value = true
  activeExpandedId.value = null
  setTimeout(() => {
    isLoading.value = false
  }, 300)
}

const getModeLabel = (mode) => {
  switch (mode) {
    case 'single':
      return '🎯 Single Jodi'
    case 'harup':
      return '🎲 Harup'
    case 'crossing':
      return '🔀 Crossing'
    default:
      return mode
  }
}

const formatCurrency = (val) => new Intl.NumberFormat('en-IN').format(val || 0)

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  return new Date(dateTimeStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

onMounted(() => {
  fetchPlayHistory()
})
</script>

<style scoped>
.history-bg {
  background-color: #f4f5f7;
  min-height: 100vh;
}

.fw-black {
  font-weight: 900;
}
.fs-8 {
  font-size: 0.72rem;
}
.fs-7 {
  font-size: 0.82rem;
}

.shadow-xs {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}
.border-white-15 {
  border-color: rgba(255, 255, 255, 0.15) !important;
}
.cursor-pointer {
  cursor: pointer;
}

.history-card {
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.history-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
}

.icon-circle {
  width: 36px;
  height: 36px;
}

/* Pulsing Gold Glow Effect for Ongoing Running Games */
.pulse-gold {
  animation: pulseGoldGlow 1.6s infinite ease-in-out;
}

@keyframes pulseGoldGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.6);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(255, 193, 7, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
  }
}

.max-h-120 {
  max-height: 120px;
}
</style>
