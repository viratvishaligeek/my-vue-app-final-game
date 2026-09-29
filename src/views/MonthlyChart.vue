<template>
  <div class="content-area pb-5 mb-5 history-bg">
    <div class="container-fluid px-2 px-md-3 py-2">
      <div class="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-dark text-white position-relative overflow-hidden">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 position-relative z-1">
          <div class="d-flex align-items-center gap-2">
            <div
              class="icon-circle bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center fw-black">
              <i class="bi bi-grid-3x3-gap-fill fs-5"></i>
            </div>

            <div>
              <h6 class="fw-black text-white mb-0">Monthly Result Chart</h6>
              <span class="fs-8 text-white-50">
                Day-wise winning results matrix
              </span>
            </div>
          </div>

          <div
            class="d-flex align-items-center gap-2 bg-white bg-opacity-10 p-1 px-2 rounded-pill border border-white-15">
            <select v-model="selectedMonth" @change="fetchMonthlyResults"
              class="form-select form-select-sm bg-transparent text-white border-0 fw-bold fs-8 cursor-pointer shadow-none py-0">
              <option v-for="(month, index) in months" :key="index" :value="index + 1" class="text-dark">
                {{ month }}
              </option>
            </select>

            <select v-model="selectedYear" @change="fetchMonthlyResults"
              class="form-select form-select-sm bg-transparent text-white border-0 fw-bold fs-8 cursor-pointer shadow-none py-0">
              <option v-for="year in years" :key="year" :value="year" class="text-dark">
                {{ year }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="gameHeaders.length" class="row g-2 mb-3">
        <div v-for="game in gameHeaders" :key="game.id" class="col-6 col-sm-3">
          <div class="card border-0 shadow-xs rounded-3 p-2 bg-white text-center border-top border-3"
            :style="{ borderColor: game.color }">
            <span class="fs-8 text-muted fw-bold text-uppercase d-block mb-1">
              {{ game.name }}
            </span>

            <div class="d-flex align-items-center justify-content-center gap-2">
              <span class="badge bg-light text-dark font-monospace border fs-7 fw-black">
                {{ getLatestResult(game.id) }}
              </span>

              <span v-if="hasTodayResult(game.id)" class="fs-8 text-success fw-bold">
                <i class="bi bi-lightning-charge-fill me-1"></i>
                Today
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-xs rounded-4 bg-white overflow-hidden">
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-warning" role="status"></div>

          <p class="text-muted fs-8 mt-2 fw-semibold mb-0">
            Loading result chart for
            {{ getMonthName(selectedMonth) }}
            {{ selectedYear }}...
          </p>
        </div>

        <div v-else-if="!gameHeaders.length" class="text-center py-5">
          <i class="bi bi-bar-chart-line text-muted fs-1"></i>

          <p class="text-muted mt-2 mb-0">
            No games available.
          </p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-bordered table-hover align-middle mb-0 text-center font-monospace fs-8">
            <thead class="table-dark text-uppercase fs-8">
              <tr>
                <th style="width: 70px" class="bg-black text-warning py-3">
                  Date
                </th>

                <th v-for="game in gameHeaders" :key="game.id" class="py-3">
                  <div class="d-flex align-items-center justify-content-center gap-1">
                    <i class="bi bi-controller text-warning"></i>
                    <span>{{ game.name }}</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="row in monthlyData" :key="row.date" :class="{
                'table-warning fw-bold border-2 border-warning': row.is_today,
              }">
                <td class="fw-black bg-light text-dark font-monospace py-2">
                  {{ row.formatted_day }}

                  <span v-if="row.is_today" class="badge bg-danger text-white rounded-pill ms-1 d-block"
                    style="font-size: 0.6rem">
                    TODAY
                  </span>
                </td>

                <td v-for="game in gameHeaders" :key="game.id" class="py-2">
                  <span v-if="row.results[game.id]" class="result-badge fw-black" :class="row.is_today
                    ? 'text-danger fs-6'
                    : 'text-dark fs-7'
                    ">
                    {{ row.results[game.id] }}
                  </span>

                  <span v-else class="text-muted opacity-25 fw-bold">
                    --
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="card-footer bg-light p-3 border-0 d-flex flex-wrap align-items-center justify-content-between gap-2 fs-8 text-muted">
          <div class="d-flex align-items-center gap-3">
            <span>
              <i class="bi bi-square-fill text-warning me-1"></i>
              Today's Live Row
            </span>

            <span>
              <i class="bi bi-dash-lg me-1"></i>
              Result Awaited
            </span>
          </div>

          <span>
            Updated automatically upon result declaration
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import api from '@/plugins/axios'

const route = useRoute()

const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = currentDate.getMonth() + 1

const selectedMonth = ref(currentMonth)
const selectedYear = ref(currentYear)

const isLoading = ref(false)
const monthlyData = ref([])
const games = ref([])

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

const years = computed(() => {
  const result = []

  for (let year = currentYear; year >= currentYear - 5; year--) {
    result.push(year)
  }

  return result
})

const colors = [
  '#ffc107',
  '#0d6efd',
  '#198754',
  '#dc3545',
  '#6f42c1',
  '#fd7e14',
  '#20c997',
  '#0dcaf0',
]

const gameHeaders = computed(() =>
  games.value.map((game, index) => ({
    ...game,
    color: colors[index % colors.length],
  }))
)

const getMonthName = (month) => months[month - 1]

const selectedGameId = computed(() => {
  const gameId = route.query.game

  if (!gameId) {
    return null
  }

  const id = Number(gameId)

  return Number.isInteger(id) && id > 0 ? id : null
})

const fetchMonthlyResults = async () => {
  isLoading.value = true

  try {
    const params = {
      month: selectedMonth.value,
      year: selectedYear.value,
    }

    if (selectedGameId.value) {
      params.game_id = selectedGameId.value
    }

    const response = await api.get('/result-chart/index', {
      params,
    })
    const payload = response.data

    games.value = payload.games || []
    monthlyData.value = payload.data || []
  } catch (error) {
    games.value = []
    monthlyData.value = []

    console.error(
      'Monthly chart fetch failed:',
      error
    )
  } finally {
    isLoading.value = false
  }
}

const getLatestResult = (gameId) => {
  const todayRow = monthlyData.value.find(
    (row) => row.is_today
  )

  if (todayRow?.results?.[gameId]) {
    return todayRow.results[gameId]
  }

  const game = games.value.find(
    (item) => item.id === gameId
  )

  return game?.last_result || '--'
}

const hasTodayResult = (gameId) => {
  const todayRow = monthlyData.value.find(
    (row) => row.is_today
  )

  return Boolean(todayRow?.results?.[gameId])
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
