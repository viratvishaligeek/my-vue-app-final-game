<template>
  <div class="content-area pb-5 mb-5 position-relative history-bg">
    <div class="container-fluid px-2 px-md-3 py-2">
      <div class="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-dark text-white position-relative overflow-hidden">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 position-relative z-1">
          <div class="d-flex align-items-center gap-2">
            <div
              class="icon-circle bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center fw-black">
              <i class="bi bi-clock-history fs-5"></i>
            </div>

            <div>
              <h6 class="fw-black text-white mb-0">
                Play History & Slip Ledger
              </h6>
              <span class="fs-8 text-white-50">
                Instant Bet & Result Breakdown
              </span>
            </div>
          </div>

          <div
            class="d-flex align-items-center gap-2 bg-white bg-opacity-10 px-3 py-1-5 rounded-pill border border-white-15">
            <i class="bi bi-calendar-event text-warning fs-7"></i>

            <input type="date"
              class="form-control-plaintext form-control-sm text-white fw-bold fs-8 font-monospace p-0 border-0 shadow-none cursor-pointer"
              style="width: 110px" v-model="selectedDate" :max="todayDateStr" @change="fetchPlayHistory(1)" />

            <button v-if="selectedDate !== todayDateStr" @click="resetToToday"
              class="btn btn-xs btn-warning text-dark fw-bold rounded-pill px-2 py-0 fs-8">
              Today
            </button>
          </div>
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-4">
          <div class="card border-0 shadow-xs rounded-3 p-2 text-center bg-white border-start border-3 border-danger">
            <span class="fs-8 text-muted fw-bold text-uppercase d-block">
              Staked
            </span>

            <strong class="text-dark fs-7 font-monospace">
              ₹{{ formatCurrency(dailyStats.totalSpent) }}
            </strong>
          </div>
        </div>

        <div class="col-4">
          <div class="card border-0 shadow-xs rounded-3 p-2 text-center bg-white border-start border-3 border-warning">
            <span class="fs-8 text-muted fw-bold text-uppercase d-block">
              Total Slips
            </span>

            <strong class="text-dark fs-7 font-monospace">
              {{ dailyStats.totalSlips }}
            </strong>
          </div>
        </div>

        <div class="col-4">
          <div class="card border-0 shadow-xs rounded-3 p-2 text-center bg-white border-start border-3 border-success">
            <span class="fs-8 text-muted fw-bold text-uppercase d-block">
              Winnings
            </span>

            <strong class="text-success fs-7 font-monospace">
              ₹{{ formatCurrency(dailyStats.totalWon) }}
            </strong>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-xl-10 mx-auto">
          <div v-if="isLoading" class="card border-0 shadow-xs rounded-4">
            <div class="text-center py-5">
              <div class="spinner-grow spinner-grow-sm text-warning" role="status"></div>

              <p class="text-muted fs-8 mt-2 mb-0">
                Loading play history...
              </p>
            </div>
          </div>

          <div v-else-if="history.length === 0" class="card border-0 shadow-xs rounded-4 py-4 text-center bg-white">
            <i class="bi bi-ticket-perforated display-5 text-warning mb-2"></i>

            <h6 class="fw-bold text-dark fs-7 mb-1">
              No Slips Found for {{ selectedDate }}
            </h6>

            <p class="text-muted fs-8 mb-2">
              Try selecting another date or play a new game.
            </p>

            <div>
              <router-link to="/play" class="btn btn-sm btn-warning rounded-pill fw-bold px-3 text-dark">
                Play Games Now
              </router-link>
            </div>
          </div>

          <div v-else class="d-flex flex-column gap-2">
            <div v-for="slip in history" :key="slip.id"
              class="card border-0 shadow-xs rounded-4 bg-white overflow-hidden history-card">
              <div class="p-2 px-3 d-flex align-items-center justify-content-between gap-2 border-bottom border-light">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge bg-dark text-warning fw-black px-2 py-1 rounded-2 fs-8 font-monospace">
                    {{ slip.game_name }}
                  </span>

                  <span class="badge bg-light text-secondary border rounded-pill px-2 py-1 fs-8 fw-semibold">
                    {{ getModeLabel(slip.mode) }}
                  </span>
                </div>

                <div>
                  <span v-if="slip.status === 'running'"
                    class="badge bg-warning text-dark fw-bold px-2 py-1 rounded-pill fs-8 pulse-gold">
                    <i class="bi bi-clock-history me-1"></i>
                    RUNNING
                  </span>

                  <span v-else-if="slip.status === 'won'"
                    class="badge bg-success text-white fw-bold px-2 py-1 rounded-pill fs-8">
                    <i class="bi bi-trophy-fill me-1"></i>
                    WON
                    <span v-if="slip.winning_number">
                      ({{ slip.winning_number }})
                    </span>
                  </span>

                  <span v-else-if="slip.status === 'loss' || slip.status === 'lost'"
                    class="badge bg-secondary text-white fw-semibold px-2 py-1 rounded-pill fs-8">
                    LOST
                    <span v-if="slip.winning_number">
                      ({{ slip.winning_number }})
                    </span>
                  </span>

                  <span v-else class="badge bg-secondary text-white fw-semibold px-2 py-1 rounded-pill fs-8">
                    CLOSED
                    <span v-if="slip.winning_number">
                      ({{ slip.winning_number }})
                    </span>
                  </span>
                </div>
              </div>

              <div class="p-2 px-3 bg-light-subtle d-flex align-items-center justify-content-between gap-2">
                <div class="d-flex align-items-center gap-3">
                  <div>
                    <span class="text-muted fs-8 d-block">
                      Time / ID
                    </span>

                    <strong class="text-dark fs-8 font-monospace">
                      {{ formatTime(slip.created_at) }}
                      • #{{ slip.slip_code }}
                    </strong>
                  </div>

                  <div class="border-start ps-3 d-none d-sm-block">
                    <span class="text-muted fs-8 d-block">
                      Bets Selection
                    </span>

                    <strong class="text-dark fs-8">
                      {{ slip.total_bets_count }} Number(s)
                    </strong>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-2">
                  <div class="text-end me-1">
                    <span class="text-muted fs-8 d-block fw-semibold">
                      Total Amount
                    </span>

                    <span class="fs-7 fw-black text-danger font-monospace">
                      ₹{{ formatCurrency(slip.total_amount) }}
                    </span>
                  </div>

                  <button @click="toggleSlipDetails(slip.id)"
                    class="btn btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center transition-all"
                    :class="activeExpandedId === slip.id
                      ? 'btn-danger text-white'
                      : 'btn-light border text-dark'
                      " style="width: 32px; height: 32px">
                    <i :class="[
                      'bi',
                      activeExpandedId === slip.id
                        ? 'bi-chevron-up'
                        : 'bi-chevron-down',
                    ]"></i>
                  </button>
                </div>
              </div>

              <div v-if="activeExpandedId === slip.id" class="p-3 bg-white border-top border-light">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="fs-8 fw-bold text-uppercase text-muted tracking-wider">
                    Itemized Bet List
                  </span>

                  <span class="fs-8 badge bg-secondary-subtle text-secondary font-monospace">
                    {{ slip.total_bets_count }} Bets Applied
                  </span>
                </div>

                <div v-if="slip.mode === 'single'" class="row g-1">
                  <div v-for="(amount, number) in slip.single_bets" :key="number" class="col-3 col-sm-2 col-md-1">
                    <div class="p-1 rounded-2 border bg-light text-center shadow-xs">
                      <span class="d-block font-monospace fw-black fs-7 text-dark">
                        {{ number }}
                      </span>

                      <span class="badge bg-warning text-dark p-0 px-1 rounded-1 fw-bold fs-8">
                        ₹{{ formatCurrency(amount) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div v-else-if="slip.mode === 'harup'" class="row g-2">

                  <!-- RESULT -->
                  <div v-if="slip.harup_result?.ander !== null || slip.harup_result?.bahar !== null" class="col-12">
                    <div class="p-2 rounded-3 bg-dark text-white">
                      <div class="d-flex align-items-center justify-content-between">
                        <span class="fs-8 fw-bold">
                          <i class="bi bi-trophy-fill text-warning me-1"></i>
                          Result
                        </span>

                        <span class="font-monospace fw-black">
                          {{ slip.harup_result?.ander ?? '-' }}
                          -
                          {{ slip.harup_result?.bahar ?? '-' }}
                        </span>
                      </div>

                      <div class="d-flex gap-2 mt-1 fs-8">
                        <span class="badge bg-primary">
                          Ander: {{ slip.harup_result?.ander ?? '-' }}
                        </span>

                        <span class="badge bg-info text-dark">
                          Bahar: {{ slip.harup_result?.bahar ?? '-' }}
                        </span>

                        <span v-if="slip.winning_number" class="badge bg-warning text-dark">
                          Jodi: {{ slip.winning_number }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- ANDER BETS -->
                  <div v-if="Object.keys(slip.harup_bets?.ander || {}).length" class="col-12 col-sm-6">
                    <div class="p-2 border rounded-3 bg-primary-subtle border-primary-subtle">

                      <span class="fs-8 fw-bold text-primary d-block mb-1">
                        🅰️ Ander (Inside):
                      </span>

                      <div class="d-flex flex-wrap gap-1">

                        <span v-for="(amt, digit) in slip.harup_bets.ander" :key="'a-' + digit"
                          class="badge bg-white text-primary border border-primary p-1 rounded-2 fs-8 font-monospace"
                          :class="{
                            'border-success text-success bg-success-subtle':
                              String(digit) === String(slip.harup_result?.ander)
                          }">
                          Digit {{ digit }} =
                          ₹{{ formatCurrency(amt) }}

                          <span v-if="String(digit) === String(slip.harup_result?.ander)" class="ms-1">
                            ✓ WIN
                          </span>
                        </span>

                      </div>
                    </div>
                  </div>

                  <!-- BAHAR BETS -->
                  <div v-if="Object.keys(slip.harup_bets?.bahar || {}).length" class="col-12 col-sm-6">
                    <div class="p-2 border rounded-3 bg-info-subtle border-info-subtle">

                      <span class="fs-8 fw-bold text-info d-block mb-1">
                        🅱️ Bahar (Outside):
                      </span>

                      <div class="d-flex flex-wrap gap-1">

                        <span v-for="(amt, digit) in slip.harup_bets.bahar" :key="'b-' + digit"
                          class="badge bg-white text-info border border-info p-1 rounded-2 fs-8 font-monospace" :class="{
                            'border-success text-success bg-success-subtle':
                              String(digit) === String(slip.harup_result?.bahar)
                          }">
                          Digit {{ digit }} =
                          ₹{{ formatCurrency(amt) }}

                          <span v-if="String(digit) === String(slip.harup_result?.bahar)" class="ms-1">
                            ✓ WIN
                          </span>
                        </span>

                      </div>
                    </div>
                  </div>

                </div>


                <div v-else-if="slip.mode === 'crossing'">
                  <div class="mb-2 d-flex align-items-center gap-1 fs-8 text-muted flex-wrap">
                    <span>Digits Selected:</span>

                    <span v-for="digit in slip.crossing_digits" :key="digit"
                      class="badge bg-dark text-warning font-monospace py-1 px-2">
                      {{ digit }}
                    </span>

                    <span class="ms-auto text-dark fw-bold">
                      ₹{{ formatCurrency(slip.crossing_amount_per_jodi) }}/Jodi
                    </span>
                  </div>

                  <div class="d-flex flex-wrap gap-1 max-h-120 overflow-auto p-2 bg-light rounded-3 border">
                    <span v-for="jodi in slip.crossing_jodis" :key="jodi"
                      class="badge bg-white text-dark border px-2 py-1 rounded-2 fs-8 font-monospace shadow-xs">
                      {{ jodi }}
                      (₹{{ formatCurrency(slip.crossing_amount_per_jodi) }})
                    </span>
                  </div>
                </div>

                <div v-if="slip.status === 'won'"
                  class="mt-2 p-2 bg-success text-white rounded-3 d-flex align-items-center justify-content-between fs-8 fw-bold">
                  <span>
                    <i class="bi bi-trophy-fill me-1"></i>
                    Winning Amount Credited:
                  </span>

                  <span class="fs-7 font-monospace">
                    +₹{{ formatCurrency(slip.win_amount) }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="pagination.last_page > 1" class="card border-0 shadow-xs rounded-4 bg-white p-2 mt-1">
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <small class="text-muted fs-8">
                  Showing
                  {{ pagination.from || 0 }}
                  -
                  {{ pagination.to || 0 }}
                  of
                  {{ pagination.total }}
                </small>

                <nav>
                  <ul class="pagination pagination-sm mb-0">
                    <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                      <button class="page-link rounded-circle border-0" @click="goToPage(pagination.current_page - 1)"
                        :disabled="pagination.current_page === 1">
                        <i class="bi bi-chevron-left"></i>
                      </button>
                    </li>

                    <li v-for="page in visiblePages" :key="page" class="page-item" :class="{
                      active: pagination.current_page === page,
                    }">
                      <button class="page-link rounded-circle border-0 mx-1" @click="goToPage(page)">
                        {{ page }}
                      </button>
                    </li>

                    <li class="page-item" :class="{
                      disabled:
                        pagination.current_page === pagination.last_page,
                    }">
                      <button class="page-link rounded-circle border-0" @click="goToPage(pagination.current_page + 1)"
                        :disabled="pagination.current_page === pagination.last_page
                          ">
                        <i class="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
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
import api from '@/plugins/axios'

const getTodayString = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const todayDateStr = getTodayString()
const selectedDate = ref(todayDateStr)

const isLoading = ref(false)
const activeExpandedId = ref(null)

const history = ref([])

const dailyStats = ref({
  totalSlips: 0,
  totalSpent: 0,
  totalWon: 0,
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0,
})

const visiblePages = computed(() => {
  const current = pagination.value.current_page
  const last = pagination.value.last_page

  if (last <= 7) {
    return Array.from({ length: last }, (_, index) => index + 1)
  }

  let start = Math.max(1, current - 2)
  let end = Math.min(last, current + 2)

  if (current <= 3) {
    start = 1
    end = 5
  }

  if (current >= last - 2) {
    start = last - 4
    end = last
  }

  return Array.from(
    { length: end - start + 1 },
    (_, index) => start + index
  )
})

const fetchPlayHistory = async (page = 1) => {
  if (page < 1) {
    return
  }

  if (
    pagination.value.last_page > 0 &&
    page > pagination.value.last_page
  ) {
    return
  }

  isLoading.value = true
  activeExpandedId.value = null

  try {
    const params = {
      page,
      per_page: 50,
    }

    // Let the backend apply each game's current business date for today's history.
    if (selectedDate.value !== todayDateStr) {
      params.date = selectedDate.value
    }

    const response = await api.get('/play-history', { params })

    if (response.data?.success) {
      const data = response.data.data

      history.value = data.slips || []

      dailyStats.value = {
        totalSlips: data.stats?.total_slips || 0,
        totalSpent: Number(data.stats?.total_spent || 0),
        totalWon: Number(data.stats?.total_won || 0),
      }

      pagination.value = {
        current_page: data.pagination?.current_page || 1,
        last_page: data.pagination?.last_page || 1,
        per_page: data.pagination?.per_page || 10,
        total: data.pagination?.total || 0,
        from: data.pagination?.from || 0,
        to: data.pagination?.to || 0,
      }
    } else {
      history.value = []

      dailyStats.value = {
        totalSlips: 0,
        totalSpent: 0,
        totalWon: 0,
      }
    }
  } catch (error) {
    console.error('Play history loading failed:', error)

    history.value = []

    dailyStats.value = {
      totalSlips: 0,
      totalSpent: 0,
      totalWon: 0,
    }
  } finally {
    isLoading.value = false
  }
}

const goToPage = (page) => {
  if (
    page < 1 ||
    page > pagination.value.last_page ||
    page === pagination.value.current_page
  ) {
    return
  }

  fetchPlayHistory(page)
}

const toggleSlipDetails = (id) => {
  activeExpandedId.value =
    activeExpandedId.value === id ? null : id
}

const resetToToday = () => {
  selectedDate.value = todayDateStr
  fetchPlayHistory(1)
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

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) {
    return ''
  }

  return new Date(dateTimeStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

onMounted(() => {
  fetchPlayHistory(1)
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

.page-link {
  min-width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.page-item.active .page-link {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #212529;
  font-weight: 700;
}

.page-item.disabled .page-link {
  opacity: 0.5;
  pointer-events: none;
}

.transition-all {
  transition: all 0.2s ease;
}
</style>
