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
                    <span class="wallet-label">Available Balance</span>
                  </div>
                  <button type="button" @click="isBalanceVisible = !isBalanceVisible" class="balance-toggle"
                    title="Toggle Balance" aria-label="Toggle balance visibility">
                    <i :class="[
                      'bi',
                      isBalanceVisible ? 'bi-eye-slash' : 'bi-eye'
                    ]"></i>
                  </button>
                </div>
                <div class="d-flex align-items-baseline gap-1 mt-1">
                  <span class="currency-symbol">₹</span>
                  <span class="wallet-balance">
                    {{ isBalanceVisible ? formatCurrency(walletBalance) : '••••••' }}
                  </span>
                </div>
              </div>
              <div class="wallet-summary">
                <div class="wallet-summary-item">
                  <div class="summary-icon credit-icon">
                    <i class="bi bi-arrow-down-left"></i>
                  </div>
                  <div class="summary-content">
                    <span class="summary-label">Cash Added</span>
                    <span class="summary-value credit-value">
                      +₹{{ formatCurrency(wallet.totalCredited) }}
                    </span>
                  </div>
                </div>
                <div class="summary-divider"></div>
                <div class="wallet-summary-item">
                  <div class="summary-icon debit-icon">
                    <i class="bi bi-arrow-up-right"></i>
                  </div>
                  <div class="summary-content">
                    <span class="summary-label">Withdrawn</span>
                    <span class="summary-value debit-value">
                      -₹{{ formatCurrency(wallet.totalDebited) }}
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
                  <h6 class="fw-bold mb-0 text-dark small">
                    Add Money
                  </h6>
                  <p class="text-muted mb-0 d-none d-sm-block" style="font-size: 11px;">
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
                  <h6 class="fw-bold mb-0 text-dark small">
                    Withdrawal
                  </h6>
                  <p class="text-muted mb-0 d-none d-sm-block" style="font-size: 11px;">
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
                <small class="text-muted">Track your credit and debit history</small>
              </div>
              <div class="btn-group btn-group-sm rounded-pill p-1 bg-light">
                <button v-for="type in ['all', 'credit', 'debit']" :key="type"
                  @click="((filterType = type), (currentPage = 1))" :class="[
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
                <p class="text-muted small mt-2">Fetching history...</p>
              </div>
              <div v-else-if="paginatedTransactions.length > 0" class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light text-secondary fs-7 text-uppercase">
                    <tr>
                      <th class="ps-4">Transaction Details</th>
                      <th>Type</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th class="text-end pe-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in paginatedTransactions" :key="item.id" class="transition-row">
                      <td class="ps-4">
                        <div class="d-flex align-items-center gap-3">
                          <div :class="[
                            'avatar-icon',
                            'rounded-circle',
                            item.type === 'credit'
                              ? 'bg-success-soft text-success'
                              : 'bg-danger-soft text-danger',
                          ]">
                            <i :class="[
                              'bi',
                              item.type === 'credit' ? 'bi-arrow-down-left' : 'bi-arrow-up-right',
                            ]"></i>
                          </div>
                          <div>
                            <span class="fw-semibold text-dark d-block mb-0">{{
                              item.description
                              }}</span>
                            <small class="text-muted">Txn ID: {{ item.txn_id }}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span :class="[
                          'badge',
                          'px-2',
                          'py-1',
                          'rounded-pill',
                          item.type === 'credit'
                            ? 'bg-success-soft text-success'
                            : 'bg-danger-soft text-danger',
                        ]">
                          {{ item.type }}
                        </span>
                      </td>
                      <td class="text-muted small">
                        {{ formatDate(item.created_at) }}
                      </td>
                      <td>
                        <span :class="['badge', 'rounded-pill', getStatusBadge(item.status)]">
                          {{ item.status }}
                        </span>
                      </td>
                      <td class="text-end pe-4 fw-bold" :class="item.type === 'credit' ? 'text-success' : 'text-dark'">
                        {{ item.type === 'credit' ? '+' : '-' }}₹{{ formatCurrency(item.amount) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-center py-5">
                <i class="bi bi-receipt-cutoff display-4 text-muted opacity-50"></i>
                <p class="text-muted mt-2 mb-0">No transactions found.</p>
              </div>
            </div>
            <div v-if="totalPages > 1"
              class="card-footer bg-white py-3 px-4 border-0 d-flex align-items-center justify-content-between flex-wrap gap-2">
              <small class="text-muted">
                Showing {{ (currentPage - 1) * perPage + 1 }} to
                {{ Math.min(currentPage * perPage, filteredTransactions.length) }} of
                {{ filteredTransactions.length }}
              </small>
              <nav>
                <ul class="pagination pagination-sm mb-0">
                  <li :class="['page-item', { disabled: currentPage === 1 }]">
                    <button class="page-item-link page-link border-0 rounded-circle me-1" @click="currentPage--">
                      <i class="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  <li v-for="page in totalPages" :key="page" :class="['page-item', { active: currentPage === page }]">
                    <button class="page-item-link page-link border-0 rounded-circle mx-1" @click="currentPage = page">
                      {{ page }}
                    </button>
                  </li>
                  <li :class="['page-item', { disabled: currentPage === totalPages }]">
                    <button class="page-item-link page-link border-0 rounded-circle ms-1" @click="currentPage++">
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/utils/auth'
import api from '@/plugins/axios'

const authStore = useAuthStore()

const isBalanceVisible = ref(true)
const isLoading = ref(false)

const filterType = ref('all')
const currentPage = ref(1)

const transactions = ref([])
const perPage = ref(5)

const wallet = ref({
  balance: 0,
  totalCredited: 0,
  totalDebited: 0,
})

const walletBalance = computed(() => {
  return Number(
    wallet.value.balance ??
    authStore.user?.balance ??
    0
  )
})

const filteredTransactions = computed(() => {
  if (filterType.value === 'all') {
    return transactions.value
  }

  return transactions.value.filter(
    item => item.type === filterType.value
  )
})
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredTransactions.value.slice(start, start + perPage.value)
})
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  )
}

const getStatusBadge = (status) => {
  switch (status) {
    case 'success':
      return 'bg-success-subtle text-success'

    case 'pending':
      return 'bg-warning-subtle text-warning'

    case 'failed':
    case 'rejected':
      return 'bg-danger-subtle text-danger'

    default:
      return 'bg-secondary-subtle text-secondary'
  }
}

const loadWallet = async () => {
  isLoading.value = true

  try {
    const response = await api.get('/wallet')

    if (response.data?.success) {
      const data = response.data.data

      wallet.value = {
        balance: data.balance,
        totalCredited: data.total_credited,
        totalDebited: data.total_debited,
      }

      transactions.value =
        data.transactions?.data || []

      currentPage.value =
        data.transactions?.current_page || 1

      if (authStore.user) {
        authStore.user.balance = data.balance
      }
    }
  } catch (error) {
    console.error(
      'Wallet loading failed:',
      error
    )
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadWallet()
})
</script>

<style scoped>
.wallet-card {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 18px;
  box-shadow: 0 10px 25px rgba(30, 60, 114, 0.22);
}

.wallet-balance-section {
  padding-bottom: 11px;
}

.wallet-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.currency-symbol {
  font-size: 1.35rem;
  font-weight: 600;
  opacity: 0.9;
}

.wallet-balance {
  font-size: 2rem;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.balance-toggle {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.balance-toggle:active {
  transform: scale(0.94);
}

.wallet-summary {
  display: flex;
  align-items: center;
  padding-top: 13px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.wallet-summary-item {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-divider {
  width: 1px;
  height: 34px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 12px;
}

.summary-icon {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

.credit-icon {
  color: #72e6a3;
  background: rgba(25, 135, 84, 0.18);
}

.debit-icon {
  color: #ffd166;
  background: rgba(255, 193, 7, 0.15);
}

.summary-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.65);
  white-space: nowrap;
}

.summary-value {
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.credit-value {
  color: #72e6a3;
}

.debit-value {
  color: #ffd166;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(45px);
  opacity: 0.25;
  pointer-events: none;
}

.orb-1 {
  width: 130px;
  height: 130px;
  background: #00f2fe;
  top: -60px;
  right: -45px;
}

.orb-2 {
  width: 100px;
  height: 100px;
  background: #4facfe;
  bottom: -60px;
  left: 30%;
}

@media (max-width: 360px) {
  .wallet-card {
    padding: 15px;
  }

  .wallet-balance {
    font-size: 1.75rem;
  }

  .summary-divider {
    margin: 0 8px;
  }

  .summary-value {
    font-size: 0.75rem;
  }

  .summary-icon {
    width: 27px;
    height: 27px;
    flex-basis: 27px;
  }
}


.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.4;
  animation: float 8s infinite alternate ease-in-out;
}

.orb-1 {
  width: 180px;
  height: 180px;
  background: #00f2fe;
  top: -40px;
  right: -40px;
}

.orb-2 {
  width: 140px;
  height: 140px;
  background: #4facfe;
  bottom: -30px;
  left: 20%;
  animation-delay: -4s;
}

@keyframes float {
  0% {
    transform: translateY(0) scale(1);
  }

  100% {
    transform: translateY(-20px) scale(1.1);
  }
}

.bg-white-10 {
  background: rgba(255, 255, 255, 0.1);
}

.backdrop-blur {
  backdrop-filter: blur(8px);
}

.border-white-20 {
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.card-hover {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08) !important;
}

.icon-shape {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-primary-soft {
  background-color: rgba(13, 110, 253, 0.1);
}

.bg-warning-soft {
  background-color: rgba(255, 193, 7, 0.15);
}

.bg-success-soft {
  background-color: rgba(25, 135, 84, 0.12);
}

.bg-danger-soft {
  background-color: rgba(220, 53, 69, 0.12);
}

.fs-7 {
  font-size: 0.75rem;
}

.avatar-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.transition-row {
  transition: background-color 0.2s ease;
}

.btn-white {
  background-color: #ffffff;
}

.page-item-link {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.page-item.active .page-item-link {
  background-color: #0d6efd;
  color: #fff;
}

@media (min-width: 768px) {
  .border-start-md {
    border-left: 1px solid !important;
  }
}
</style>
