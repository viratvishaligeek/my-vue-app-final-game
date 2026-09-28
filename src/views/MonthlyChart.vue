<template>
  <div class="content-area pb-5 mb-5 history-bg">
    <div class="container-fluid px-2 px-md-3 py-2">
      <!-- 1. HEADER & MONTH/YEAR FILTER BAR -->
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
              <i class="bi bi-grid-3x3-gap-fill fs-5"></i>
            </div>
            <div>
              <h6 class="fw-black text-white mb-0">Monthly Result Chart</h6>
              <span class="fs-8 text-white-50">Day-wise winning results matrix</span>
            </div>
          </div>

          <!-- Date Selector Controls -->
          <div
            class="d-flex align-items-center gap-2 bg-white bg-opacity-10 p-1 px-2 rounded-pill border border-white-15"
          >
            <select
              v-model="selectedMonth"
              @change="fetchMonthlyResults"
              class="form-select form-select-sm bg-transparent text-white border-0 fw-bold fs-8 cursor-pointer shadow-none py-0"
            >
              <option v-for="(m, idx) in months" :key="idx" :value="idx + 1" class="text-dark">
                {{ m }}
              </option>
            </select>
            <select
              v-model="selectedYear"
              @change="fetchMonthlyResults"
              class="form-select form-select-sm bg-transparent text-white border-0 fw-bold fs-8 cursor-pointer shadow-none py-0"
            >
              <option v-for="y in years" :key="y" :value="y" class="text-dark">{{ y }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 2. QUICK STATS & LIVE HIGHLIGHT CARDS -->
      <div class="row g-2 mb-3">
        <div v-for="game in gameHeaders" :key="game.key" class="col-6 col-sm-3">
          <div
            class="card border-0 shadow-xs rounded-3 p-2 bg-white text-center border-top border-3"
            :style="{ borderColor: game.color }"
          >
            <span class="fs-8 text-muted fw-bold text-uppercase d-block mb-1">{{ game.name }}</span>
            <div class="d-flex align-items-center justify-content-center gap-2">
              <span class="badge bg-light text-dark font-monospace border fs-7 fw-black">
                {{ getLatestResult(game.key) }}
              </span>
              <span class="fs-8 text-success fw-bold"
                ><i class="bi bi-lightning-charge-fill me-1"></i>Today</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 3. MONTHLY RESULT CHART TABLE -->
      <div class="card border-0 shadow-xs rounded-4 bg-white overflow-hidden">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-warning" role="status"></div>
          <p class="text-muted fs-8 mt-2 fw-semibold">
            Loading result chart for {{ getMonthName(selectedMonth) }} {{ selectedYear }}...
          </p>
        </div>

        <!-- Table View -->
        <div v-else class="table-responsive">
          <table
            class="table table-bordered table-hover align-middle mb-0 text-center font-monospace fs-8"
          >
            <thead class="table-dark text-uppercase fs-8">
              <tr>
                <th style="width: 70px" class="bg-black text-warning py-3">Date</th>
                <th v-for="game in gameHeaders" :key="game.key" class="py-3">
                  <div class="d-flex align-items-center justify-content-center gap-1">
                    <i class="bi bi-controller text-warning"></i>
                    <span>{{ game.name }}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in monthlyData"
                :key="row.date"
                :class="{ 'table-warning fw-bold border-2 border-warning': row.isToday }"
              >
                <!-- Date Column -->
                <td class="fw-black bg-light text-dark font-monospace py-2">
                  {{ row.formattedDay }}
                  <span
                    v-if="row.isToday"
                    class="badge bg-danger text-white rounded-pill ms-1 d-block"
                    style="font-size: 0.6rem"
                    >TODAY</span
                  >
                </td>

                <!-- Game Result Cells -->
                <td v-for="game in gameHeaders" :key="game.key" class="py-2">
                  <span
                    v-if="row.results[game.key]"
                    class="result-badge fw-black"
                    :class="row.isToday ? 'text-danger fs-6' : 'text-dark fs-7'"
                  >
                    {{ row.results[game.key] }}
                  </span>
                  <span v-else class="text-muted opacity-25 fw-bold">--</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table Legend/Footer -->
        <div
          class="card-footer bg-light p-3 border-0 d-flex flex-wrap align-items-center justify-content-between gap-2 fs-8 text-muted"
        >
          <div class="d-flex align-items-center gap-3">
            <span><i class="bi bi-square-fill text-warning me-1"></i> Today's Live Row</span>
            <span><i class="bi bi-dash-lg me-1"></i> Result Awaited</span>
          </div>
          <span>Updated automatically upon result declaration</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const currentDay = new Date().getDate()

const selectedMonth = ref(currentMonth)
const selectedYear = ref(currentYear)
const isLoading = ref(false)

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const years = [currentYear, currentYear - 1]

const gameHeaders = [
  { name: 'Disawar', key: 'disawar', color: '#ffc107' },
  { name: 'Faridabad', key: 'faridabad', color: '#0d6efd' },
  { name: 'Ghaziabad', key: 'ghaziabad', color: '#198754' },
  { name: 'Gali', key: 'gali', color: '#dc3545' },
]

const monthlyData = ref([])

const getMonthName = (monthNum) => months[monthNum - 1]

// Generate Days in Month
const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate()

const getLatestResult = (gameKey) => {
  const todayRow = monthlyData.value.find((r) => r.isToday)
  if (todayRow && todayRow.results[gameKey]) {
    return todayRow.results[gameKey]
  }
  return '--'
}

// Fetch & Mock Result Generator
const fetchMonthlyResults = () => {
  isLoading.value = true
  const totalDays = getDaysInMonth(selectedMonth.value, selectedYear.value)
  const rows = []

  setTimeout(() => {
    for (let day = 1; day <= totalDays; day++) {
      const isToday =
        day === currentDay &&
        selectedMonth.value === currentMonth &&
        selectedYear.value === currentYear

      // Future days in current month will be empty
      const isFuture =
        selectedYear.value === currentYear &&
        selectedMonth.value === currentMonth &&
        day > currentDay

      const formattedDay = day < 10 ? `0${day}` : `${day}`

      rows.push({
        date: `${selectedYear.value}-${selectedMonth.value}-${formattedDay}`,
        formattedDay: `${formattedDay} ${getMonthName(selectedMonth.value).substring(0, 3)}`,
        isToday,
        results: {
          disawar: isFuture ? null : (Math.floor(Math.random() * 90) + 10).toString(),
          faridabad: isFuture ? null : (Math.floor(Math.random() * 90) + 10).toString(),
          ghaziabad: isFuture ? null : (Math.floor(Math.random() * 90) + 10).toString(),
          gali: isFuture ? null : (Math.floor(Math.random() * 90) + 10).toString(),
        },
      })
    }

    monthlyData.value = rows
    isLoading.value = false
  }, 400)
}

onMounted(() => {
  fetchMonthlyResults()
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

.result-badge {
  letter-spacing: 0.5px;
}
</style>
