<template>
  <div class="content-area pb-5 mb-5 position-relative">
    <div class="container-fluid px-3 px-md-4 py-3">
      <div class="row mb-4">
        <div class="col-12 col-xl-10 mx-auto">
          <div class="wallet-card text-white rounded-4 shadow position-relative overflow-hidden">
            <div class="glow-orb orb-1"></div>
            <div class="glow-orb orb-2"></div>
            <div class="position-relative z-1">
              <div class="wallet-balance-section">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-2 opacity-75">
                    <i class="bi bi-wallet2"></i>
                    <span class="wallet-label"> Available Balance </span>
                  </div>
                  <button type="button" @click="isBalanceVisible = !isBalanceVisible" class="balance-toggle"
                    title="Toggle Balance" aria-label="Toggle balance visibility">
                    <i :class="['bi', isBalanceVisible ? 'bi-eye-slash' : 'bi-eye']"></i>
                  </button>
                </div>
                <div class="d-flex align-items-baseline gap-1 mt-1">
                  <span class="currency-symbol"> ₹ </span>
                  <span class="wallet-balance">
                    {{ isBalanceVisible ? formatCurrency(walletBalance) : '••••••' }}
                  </span>
                </div>
              </div>
              <div class="wallet-summary">

                <div class="wallet-summary-item">
                  <div class="summary-icon credit-icon">
                    <i class="bi bi-wallet-fill"></i>
                  </div>

                  <div class="summary-content">
                    <span class="summary-label">
                      Cash Added
                    </span>

                    <span class="summary-value credit-value">
                      +₹{{ formatCurrency(wallet.totalCredited) }}
                    </span>
                  </div>
                </div>

                <div class="wallet-summary-item">
                  <div class="summary-icon debit-icon">
                    <i class="bi bi-bank"></i>
                  </div>

                  <div class="summary-content">
                    <span class="summary-label">
                      Withdrawn
                    </span>

                    <span class="summary-value debit-value">
                      -₹{{ formatCurrency(wallet.totalDebited) }}
                    </span>
                  </div>
                </div>

                <div class="wallet-summary-item">
                  <div class="summary-icon bet-icon">
                    <i class="bi bi-controller"></i>
                  </div>

                  <div class="summary-content">
                    <span class="summary-label">
                      Bet Played
                    </span>

                    <span class="summary-value bet-value">
                      ₹{{ formatCurrency(wallet.totalPlayedBet) }}
                    </span>
                  </div>
                </div>

                <div class="wallet-summary-item">
                  <div class="summary-icon win-icon">
                    <i class="bi bi-trophy-fill"></i>
                  </div>

                  <div class="summary-content">
                    <span class="summary-label">
                      Total Win
                    </span>

                    <span class="summary-value win-value">
                      +₹{{ formatCurrency(wallet.totalWin) }}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-12 col-xl-10 mx-auto">
          <div class="row g-2">
            <div class="col-6">
              <router-link to="/wallet/add" class="action-btn text-decoration-none">
                <div class="card card-hover border-0 shadow-sm rounded-3 text-center p-2 h-100">
                  <div class="icon-shape bg-primary-soft text-primary rounded-circle mx-auto mb-1">
                    <i class="bi bi-plus-circle-fill fs-5"></i>
                  </div>
                  <h6 class="fw-bold mb-0 text-dark small">Add Money</h6>
                  <p class="text-muted mb-0 d-none d-sm-block" style="font-size: 11px">
                    Top up via UPI/Cards
                  </p>
                </div>
              </router-link>
            </div>
            <div class="col-6">
              <router-link to="/wallet/withdraw" class="action-btn text-decoration-none">
                <div class="card card-hover border-0 shadow-sm rounded-3 text-center p-2 h-100">
                  <div class="icon-shape bg-warning-soft text-warning rounded-circle mx-auto mb-1">
                    <i class="bi bi-arrow-up-right-circle-fill fs-5"></i>
                  </div>
                  <h6 class="fw-bold mb-0 text-dark small">Withdrawal</h6>
                  <p class="text-muted mb-0 d-none d-sm-block" style="font-size: 11px">
                    Transfer to Bank
                  </p>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12 col-xl-10 mx-auto">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div
              class="card-header bg-white py-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3 border-0">
              <div>
                <h5 class="fw-bold text-dark mb-0">Recent Transactions</h5>
                <small class="text-muted"> Track your credit and debit history </small>
              </div>
              <div class="btn-group btn-group-sm rounded-pill p-1 bg-light">
                <button v-for="type in transactionFilters" :key="type" type="button" @click="changeFilter(type)" :class="[
                  'btn',
                  'rounded-pill',
                  'text-capitalize',
                  filterType === type ? 'btn-white shadow-sm fw-bold text-primary' : 'text-muted',
                ]">
                  {{ type }}
                </button>
              </div>
            </div>
            <div class="card-body p-0">
              <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted small mt-2 mb-0">Fetching history...</p>
              </div>
              <div v-else-if="errorMessage" class="p-4">
                <div class="alert alert-danger mb-0 d-flex align-items-center justify-content-between gap-2">
                  <span>
                    {{ errorMessage }}
                  </span>
                  <button type="button" class="btn btn-sm btn-danger" @click="loadWallet">
                    Retry
                  </button>
                </div>
              </div>
              <div v-else-if="transactions.length > 0" class="transactions-list">
                <div v-for="item in transactions" :key="item.id" class="transaction-card">
                  <div class="transaction-main">

                    <div :class="[
                      'transaction-icon',
                      item.type === 'credit'
                        ? 'transaction-credit'
                        : 'transaction-debit'
                    ]">
                      <i :class="item.type === 'credit'
                        ? 'bi bi-arrow-down-left'
                        : 'bi bi-arrow-up-right'
                        "></i>
                    </div>

                    <div class="transaction-info">

                      <div class="transaction-title-row">
                        <div class="transaction-title">
                          {{ item.description || 'Wallet Transaction' }}
                        </div>

                        <div :class="[
                          'transaction-amount',
                          item.type === 'credit'
                            ? 'amount-credit'
                            : 'amount-debit'
                        ]">
                          {{ item.type === 'credit' ? '+' : '-' }}₹{{
                            formatCurrency(item.amount)
                          }}
                        </div>
                      </div>

                      <div class="transaction-meta">
                        <span>
                          {{ item.txn_id }}
                        </span>

                        <span class="meta-dot">•</span>

                        <span>
                          {{ formatDate(item.created_at) }}
                        </span>
                      </div>

                      <div class="transaction-bottom">
                        <span :class="[
                          'transaction-type',
                          item.type === 'credit'
                            ? 'type-credit'
                            : 'type-debit'
                        ]">
                          <i :class="item.type === 'credit'
                            ? 'bi bi-arrow-down'
                            : 'bi bi-arrow-up'
                            "></i>

                          {{ item.type }}
                        </span>

                        <span :class="[
                          'transaction-status',
                          getStatusBadge(item.status)
                        ]">
                          {{ item.status }}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-5">
                <i class="bi bi-receipt-cutoff display-4 text-muted opacity-50"></i>
                <p class="text-muted mt-2 mb-0">No transactions found.</p>
              </div>
            </div>
            <div v-if="!isLoading && totalPages > 0" class="pagination-wrapper">
              <div class="d-flex flex-column align-items-center gap-2">

                <small class="text-muted">
                  <template v-if="totalTransactions > 0">
                    {{ paginationFrom }}–{{ paginationTo }}
                    of
                    {{ totalTransactions }}
                  </template>

                  <template v-else>
                    No records
                  </template>
                </small>

                <nav v-if="totalPages > 1" aria-label="Transaction pagination">
                  <ul class="pagination pagination-sm mb-0">

                    <li :class="[
                      'page-item',
                      { disabled: currentPage === 1 }
                    ]">
                      <button type="button" class="page-link pagination-btn" :disabled="currentPage === 1"
                        @click="goToPage(currentPage - 1)">
                        <i class="bi bi-chevron-left"></i>
                      </button>
                    </li>

                    <li v-for="page in visiblePages" :key="page" :class="[
                      'page-item',
                      { active: currentPage === page }
                    ]">
                      <button type="button" class="page-link pagination-btn" @click="goToPage(page)">
                        {{ page }}
                      </button>
                    </li>

                    <li :class="[
                      'page-item',
                      { disabled: currentPage === totalPages }
                    ]">
                      <button type="button" class="page-link pagination-btn" :disabled="currentPage === totalPages"
                        @click="goToPage(currentPage + 1)">
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
import { useAuthStore } from '@/utils/auth'
import api from '@/plugins/axios'

const authStore = useAuthStore()
const isBalanceVisible = ref(true)
const isLoading = ref(false)
const errorMessage = ref('')
const transactionFilters = ['all', 'credit', 'debit']
const filterType = ref('all')
const currentPage = ref(1)
const perPage = ref(15)
const totalPages = ref(1)
const totalTransactions = ref(0)
const paginationFrom = ref(0)
const paginationTo = ref(0)
const transactions = ref([])

const wallet = ref({
  balance: 0,
  totalCredited: 0,
  totalDebited: 0,
  totalPlayedBet: 0,
  totalWin: 0,
})

const walletBalance = computed(() => {
  return Number(wallet.value.balance ?? authStore.user?.balance ?? 0)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }
  let start = Math.max(current - 2, 2)
  let end = Math.min(current + 2, total - 1)
  if (current <= 3) {
    start = 2
    end = 5
  }
  if (current >= total - 2) {
    start = total - 4
    end = total - 1
  }
  const pages = []
  for (let page = start; page <= end; page++) {
    pages.push(page)
  }
  return pages
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}


const formatDate = (dateStr) => {
  if (!dateStr) {
    return '--'
  }
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) {
    return '--'
  }
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusBadge = (status) => {
  switch (String(status || '').toLowerCase()) {
    case 'success':
    case 'successful':
    case 'completed':
      return 'bg-success-subtle text-success'
    case 'pending':
      return 'bg-warning-subtle text-warning'
    case 'failed':
      return 'bg-danger-subtle text-danger'
    case 'rejected':
      return 'bg-danger-subtle text-danger'
    default:
      return 'bg-secondary-subtle text-secondary'
  }
}

const loadWallet = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/wallet', {
      params: {
        page: currentPage.value,
        per_page: perPage.value,
        type: filterType.value === 'all' ? undefined : filterType.value,
      },
    })
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Unable to load wallet.')
    }
    const data = response.data.data || {}
    wallet.value = {
      balance: Number(data.balance || 0),
      totalCredited: Number(data.summary?.cash_added || 0),
      totalDebited: Number(data.summary?.withdrawn || 0),
      totalPlayedBet: Number(data.summary?.played_bet || 0),
      totalWin: Number(data.summary?.total_win || 0),
    }
    const pagination = data.transactions || {}
    transactions.value = pagination.data || []
    currentPage.value = Number(pagination.current_page || currentPage.value)
    totalPages.value = Number(pagination.last_page || 1)
    perPage.value = Number(pagination.per_page || perPage.value)
    totalTransactions.value = Number(pagination.total || 0)
    paginationFrom.value = Number(pagination.from || 0)
    paginationTo.value = Number(pagination.to || 0)
    if (authStore.user) {
      authStore.user.balance = Number(data.balance || 0)
    }
  } catch (error) {
    console.error('Wallet loading failed:', error)
    errorMessage.value = error.response?.data?.message || error.message || 'Unable to load wallet.'
  } finally {
    isLoading.value = false
  }
}

const changeFilter = (type) => {
  if (filterType.value === type) {
    return
  }
  filterType.value = type
  currentPage.value = 1
  loadWallet()
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value || isLoading.value) {
    return
  }
  currentPage.value = page
  loadWallet()
}

onMounted(() => {
  loadWallet()
})
</script>
<style scoped>
.wallet-card {
  position: relative;
  overflow: hidden;
  padding: 18px;
  border-radius: 22px !important;
  background:
    radial-gradient(circle at 90% 10%,
      rgba(0, 242, 254, 0.18),
      transparent 30%),
    linear-gradient(135deg,
      var(--primary-color),
      var(--primary-light));
  box-shadow:
    0 12px 30px rgba(30, 60, 114, 0.22);
}

/* ---------------------------------
   WALLET SUMMARY
---------------------------------- */

.wallet-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.wallet-summary-item {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition:
    transform 0.25s ease,
    background 0.25s ease;
}

.wallet-summary-item:active {
  transform: scale(0.97);
  background: rgba(255, 255, 255, 0.11);
}

.summary-icon {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.summary-content {
  min-width: 0;
  overflow: hidden;
}

.summary-label {
  display: block;
  font-size: 0.61rem;
  color: rgba(255, 255, 255, 0.62);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-value {
  display: block;
  margin-top: 2px;
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------------------------------
   TRANSACTIONS
---------------------------------- */

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: #f7f9fc;
}

.transaction-card {
  position: relative;
  padding: 13px;
  border-radius: 17px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.045);
  box-shadow:
    0 4px 14px rgba(20, 35, 70, 0.055);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.transaction-card:active {
  transform: scale(0.985);
}

.transaction-main {
  display: flex;
  align-items: flex-start;
  gap: 11px;
}

.transaction-icon {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.03);
}

.transaction-credit {
  color: #198754;
  background: linear-gradient(135deg,
      rgba(25, 135, 84, 0.14),
      rgba(25, 135, 84, 0.05));
}

.transaction-debit {
  color: #dc3545;
  background: linear-gradient(135deg,
      rgba(220, 53, 69, 0.14),
      rgba(220, 53, 69, 0.05));
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.transaction-title {
  min-width: 0;
  color: #1d2635;
  font-size: 0.84rem;
  line-height: 1.25;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-amount {
  flex-shrink: 0;
  font-size: 0.84rem;
  font-weight: 800;
  white-space: nowrap;
}

.amount-credit {
  color: #198754;
}

.amount-debit {
  color: #dc3545;
}

.transaction-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  color: #8993a4;
  font-size: 0.65rem;
}

.transaction-meta span:first-child {
  max-width: 115px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-dot {
  opacity: 0.5;
}

.transaction-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 9px;
}

.transaction-type,
.transaction-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: capitalize;
}

.type-credit {
  color: #198754;
  background: rgba(25, 135, 84, 0.08);
}

.type-debit {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.08);
}

/* ---------------------------------
   FILTER
---------------------------------- */

.transaction-filter {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: #f1f3f7;
}

.transaction-filter .btn {
  min-width: 55px;
  border: 0;
  font-size: 0.68rem;
}

/* ---------------------------------
   PAGINATION
---------------------------------- */

.pagination-wrapper {
  padding: 12px;
  background: #ffffff;
}

.pagination {
  gap: 4px;
}

.pagination-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0 !important;
  border-radius: 50% !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #6c757d;
  font-size: 0.72rem;
}

.page-item.active .pagination-btn {
  color: #fff;
  background: #0d6efd;
  box-shadow: 0 4px 10px rgba(13, 110, 253, 0.25);
}

.pagination-btn:hover:not(:disabled) {
  color: #0d6efd;
  background: rgba(13, 110, 253, 0.08);
}

/* ---------------------------------
   SMALL DEVICES
---------------------------------- */

@media (max-width: 360px) {
  .wallet-card {
    padding: 14px;
  }

  .wallet-balance {
    font-size: 1.55rem;
  }

  .wallet-summary {
    gap: 7px;
  }

  .wallet-summary-item {
    padding: 8px;
  }

  .summary-icon {
    width: 28px;
    height: 28px;
    min-width: 28px;
    font-size: 0.7rem;
  }

  .summary-label {
    font-size: 0.56rem;
  }

  .summary-value {
    font-size: 0.66rem;
  }

  .transaction-card {
    padding: 11px;
  }

  .transaction-icon {
    width: 38px;
    height: 38px;
    min-width: 38px;
  }

  .transaction-title {
    font-size: 0.78rem;
  }

  .transaction-amount {
    font-size: 0.76rem;
  }
}
</style>
