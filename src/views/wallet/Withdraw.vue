<template>
  <div class="withdraw-page pb-5">
    <main class="container-fluid px-3">
      <section class="activity-section">
        <transition name="activity-slide" mode="out-in">
          <div :key="withdrawActivityIndex" class="activity-card">
            <div class="activity-avatar">
              {{ currentWithdrawActivity.initials }}
            </div>
            <div class="activity-content">
              <div class="activity-message">
                <strong>
                  {{ currentWithdrawActivity.name }}
                </strong>
                withdrew
                <strong>
                  ₹{{ currentWithdrawActivity.amount }}
                </strong>
                from wallet
              </div>
              <small>
                <i class="bi bi-check-circle-fill"></i>
                Withdrawal completed • Just now
              </small>
            </div>
            <div class="activity-money">
              ₹{{ currentWithdrawActivity.amount }}
            </div>
          </div>

        </transition>

      </section>

      <transition name="slide-fade">
        <div v-if="apiMessage.text" class="api-message" :class="apiMessage.type === 'error'
          ? 'message-error'
          : 'message-success'
          ">
          <div class="message-icon">
            <i :class="apiMessage.type === 'error'
              ? 'bi bi-exclamation-circle-fill'
              : 'bi bi-check-circle-fill'
              "></i>
          </div>
          <div class="flex-grow-1">
            {{ apiMessage.text }}
          </div>
          <button type="button" class="message-close" @click="apiMessage.text = ''">
            ×
          </button>

        </div>
      </transition>


      <form @submit.prevent="handleWithdraw" enctype="multipart/form-data" novalidate>
        <section class="withdraw-card">
          <div class="section-heading">
            <div class="section-icon">
              <i class="bi bi-arrow-up-right"></i>
            </div>
            <div>
              <strong>Withdraw money</strong>
              <small>
                Choose where you want to receive your funds
              </small>
            </div>
          </div>

          <div class="field-label">
            Withdrawal destination
          </div>
          <div class="destination-grid">
            <button type="button" class="destination-option" :class="{
              selected: transferMode === 'upi'
            }" @click="transferMode = 'upi'">
              <span class="destination-icon upi">
                <i class="bi bi-qr-code"></i>
              </span>
              <span class="destination-text">
                <strong>UPI</strong>
                <small>
                  UPI ID or QR code
                </small>
              </span>
              <span class="destination-radio">
                <span></span>
              </span>
            </button>
            <button type="button" class="destination-option" :class="{
              selected: transferMode === 'bank'
            }" @click="transferMode = 'bank'">
              <span class="destination-icon bank">
                <i class="bi bi-building"></i>
              </span>
              <span class="destination-text">
                <strong>Bank Account</strong>
                <small>
                  Direct bank transfer
                </small>
              </span>
              <span class="destination-radio">
                <span></span>
              </span>
            </button>
          </div>


          <div class="form-field amount-field">
            <div class="field-label-row">
              <label class="field-label">
                Withdrawal amount
              </label>
              <span class="minimum-label">
                Min ₹{{ formatCurrency(minWithdrawAmount) }}
              </span>
            </div>
            <div class="amount-input" :class="{
              invalid: errors.amount
            }">
              <span class="amount-symbol">
                ₹
              </span>
              <input v-model.number="form.amount" type="number" min="1" inputmode="decimal" placeholder="0"
                autocomplete="off" @input="errors.amount = ''" />
              <span class="amount-currency">
                INR
              </span>
            </div>
            <div v-if="errors.amount" class="field-error">
              <i class="bi bi-exclamation-circle"></i>
              {{ errors.amount }}
            </div>
          </div>


          <div class="quick-amounts">
            <button v-for="amount in quickWithdrawAmounts" :key="amount" type="button" :class="{
              selected:
                Number(form.amount) === amount
            }" @click="
              form.amount =
              Math.max(
                amount,
                minWithdrawAmount
              )
              ">
              ₹{{ formatCurrency(amount) }}
            </button>
          </div>


          <div v-if="transferMode === 'bank'" class="details-panel">
            <div class="details-heading">
              <span class="details-heading-icon">
                <i class="bi bi-bank"></i>
              </span>
              <div>
                <strong>Bank details</strong>
                <small>
                  Enter details exactly as registered
                </small>
              </div>
            </div>
            <div class="form-field">
              <label class="field-label">
                Account holder name
              </label>
              <div class="text-input">
                <i class="bi bi-person"></i>
                <input type="text" v-model="form.accountName" placeholder="Name as per bank account"
                  autocomplete="name" />
              </div>
            </div>
            <div class="form-field">
              <label class="field-label">
                Account number
              </label>
              <div class="text-input">
                <i class="bi bi-credit-card"></i>
                <input type="text" v-model="form.accountNumber" class="font-monospace"
                  placeholder="Enter account number" autocomplete="off" />
              </div>
            </div>
            <div class="form-field">
              <label class="field-label">
                IFSC code
              </label>
              <div class="text-input">
                <i class="bi bi-upc-scan"></i>
                <input type="text" v-model="form.ifsc" class="text-uppercase font-monospace"
                  placeholder="e.g. SBIN0001234" autocomplete="off" />
              </div>
            </div>
          </div>


          <div v-else class="details-panel">
            <div class="details-heading">
              <span class="details-heading-icon upi-heading">
                <i class="bi bi-phone"></i>
              </span>
              <div>
                <strong>UPI details</strong>
                <small>
                  Enter UPI ID or upload QR
                </small>
              </div>
            </div>
            <div class="form-field">
              <label class="field-label">
                UPI ID
              </label>
              <div class="text-input">
                <i class="bi bi-at"></i>
                <input type="text" v-model="form.upiId" placeholder="username@upi" autocomplete="off" />
              </div>
            </div>
            <!-- QR -->
            <div class="form-field">
              <div class="field-label-row">
                <label class="field-label">
                  UPI QR code
                </label>
                <span class="optional-label">
                  Optional
                </span>
              </div>
              <div class="qr-upload-box" :class="{
                'has-preview': qrPreviewUrl
              }">
                <div v-if="qrPreviewUrl" class="qr-preview-wrap">
                  <img :src="qrPreviewUrl" alt="UPI QR Preview" class="qr-preview" />
                  <button type="button" class="qr-remove" @click="removeQrCode">
                    <i class="bi bi-x-lg"></i>
                  </button>
                  <div class="qr-preview-label">
                    <i class="bi bi-check-circle-fill"></i>
                    QR selected
                  </div>
                </div>
                <label v-else class="qr-empty">
                  <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleQrUpload" />
                  <div class="qr-upload-icon">
                    <i class="bi bi-cloud-arrow-up"></i>
                  </div>
                  <strong>
                    Upload UPI QR
                  </strong>
                  <small>
                    PNG, JPG or WEBP • Max 2MB
                  </small>
                  <span class="qr-upload-action">
                    Choose image
                  </span>
                </label>
              </div>
              <div v-if="errors.qrImage" class="field-error">
                <i class="bi bi-exclamation-circle"></i>
                {{ errors.qrImage }}
              </div>
            </div>
          </div>


          <button type="submit" class="withdraw-button" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
            <template v-else>
              <span class="withdraw-button-left">
                <i class="bi bi-shield-lock-fill"></i>
                Secure Withdrawal
              </span>
              <span class="withdraw-button-right">
                ₹{{ formatCurrency(form.amount) }}
                <i class="bi bi-arrow-right"></i>
              </span>
            </template>
          </button>

          <div class="secure-note">
            <i class="bi bi-shield-check"></i>
            Your withdrawal request is processed securely.
          </div>

        </section>
      </form>

      <section class="pending-section">

        <div class="section-heading pending-heading">
          <div>
            <strong>Pending withdrawals</strong>
            <small>
              Your recent withdrawal requests
            </small>
          </div>

          <button type="button" class="refresh-btn" :class="{
            spinning: pendingLoading
          }" @click="loadPendingWithdrawals">
            <i class="bi bi-arrow-clockwise"></i>
          </button>

        </div>


        <!-- Loading -->

        <div v-if="
          pendingLoading &&
          pendingWithdrawals.length === 0
        " class="pending-loading">
          <div class="spinner-border spinner-border-sm"></div>
          <span>
            Loading withdrawals...
          </span>

        </div>


        <!-- Empty -->

        <div v-else-if="
          !pendingLoading &&
          pendingWithdrawals.length === 0
        " class="empty-pending">
          <div class="empty-icon">
            <i class="bi bi-arrow-up-right-square"></i>
          </div>
          <strong>
            No pending withdrawals
          </strong>
          <span>
            Your recent withdrawal requests will appear here.
          </span>

        </div>


        <!-- List -->

        <div v-else class="pending-list">
          <div v-for="withdrawal in pendingWithdrawals" :key="withdrawal.id" class="pending-item">
            <div class="pending-left">
              <div class="pending-icon">
                <i class="bi bi-arrow-up-right"></i>
              </div>
              <div>
                <strong>
                  ₹{{ formatCurrency(withdrawal.amount) }}
                </strong>
                <small>
                  {{ formatWithdrawalDate(withdrawal.created_at) }}
                </small>
              </div>
            </div>
            <div class="pending-right">
              <span class="status-pill" :class="getStatusClass(
                withdrawal.status
              )
                ">
                <span class="status-dot"></span>
                {{
                  formatStatus(
                    withdrawal.status
                  )
                }}
              </span>
              <small>
                {{
                  withdrawal.mode === 'upi'
                    ? 'UPI'
                    : 'Bank'
                }}
              </small>
            </div>
          </div>
        </div>
      </section>


      <div class="page-footer-note">
        <i class="bi bi-info-circle"></i>
        Withdrawal requests are reviewed and processed securely.
      </div>
    </main>
  </div>
</template>


<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/utils/auth'
import api from '@/plugins/axios'
import { useSettings } from '@/composables/useSettings'


const router = useRouter()
const authStore = useAuthStore()

const {
  loadSettings,
  getSetting,
} = useSettings()


const isLoading = ref(false)
const transferMode = ref('bank')
const qrPreviewUrl = ref(null)

const balance = ref(
  Number(
    authStore.user?.balance || 0
  )
)


const form = reactive({
  amount: '',
  accountName: '',
  accountNumber: '',
  ifsc: '',
  upiId: '',
  qrImage: null,
})


const errors = reactive({
  amount: '',
  qrImage: '',
})


const apiMessage = reactive({
  text: '',
  type: 'error',
})


const minWithdrawAmount = computed(() => {
  return Number(getSetting('min_withdraw'), 100)
})

const availableBalance = computed(() => {

  return Number(
    balance.value || 0
  )

})


/*
|--------------------------------------------------------------------------
| Quick withdrawal amounts
|--------------------------------------------------------------------------
*/

const quickWithdrawAmounts = computed(() => {

  const minimum =
    minWithdrawAmount.value


  const defaults = [
    100,
    500,
    1000,
    2000,
  ]


  const amounts = [
    minimum,
    ...defaults,
  ]


  return [
    ...new Set(
      amounts.filter(
        amount =>
          amount >= minimum
      )
    ),
  ].slice(0, 4)

})


/*
|--------------------------------------------------------------------------
| Dummy activity
|--------------------------------------------------------------------------
*/

const demoWithdrawActivities = [
  {
    name: 'Rahul',
    amount: '500',
    initials: 'R',
  },
  {
    name: 'Aman',
    amount: '1,000',
    initials: 'A',
  },
  {
    name: 'Vikas',
    amount: '2,000',
    initials: 'V',
  },
  {
    name: 'Neha',
    amount: '500',
    initials: 'N',
  },
  {
    name: 'Rohit',
    amount: '1,500',
    initials: 'R',
  },
  {
    name: 'Pooja',
    amount: '1,000',
    initials: 'P',
  },
  {
    name: 'Arjun',
    amount: '2,500',
    initials: 'A',
  },
]


const withdrawActivityIndex =
  ref(0)


const currentWithdrawActivity =
  computed(() => {

    return demoWithdrawActivities[
      withdrawActivityIndex.value
    ]

  })


let activityTimer = null
let pendingTimer = null


/*
|--------------------------------------------------------------------------
| Pending withdrawals
|--------------------------------------------------------------------------
*/

const PENDING_WITHDRAWAL_ENDPOINT =
  '/wallet/get-money-request'

const pendingWithdrawals =
  ref([])

const pendingLoading =
  ref(false)

const formatCurrency = (value) => {

  return new Intl.NumberFormat(
    'en-IN',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  ).format(
    Number(value || 0)
  )

}


/*
|--------------------------------------------------------------------------
| Date
|--------------------------------------------------------------------------
*/

const formatWithdrawalDate = (
  value
) => {

  if (!value) {
    return '--'
  }


  const date =
    new Date(value)


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(value)

  }


  return date.toLocaleString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }
  )

}


/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

const formatStatus = (
  status
) => {

  const value =
    String(
      status || ''
    ).toLowerCase()


  const map = {
    pending: 'Pending',
    processing: 'Processing',
    approved: 'Approved',
    success: 'Success',
    completed: 'Completed',
    rejected: 'Rejected',
    failed: 'Failed',
  }


  return (
    map[value] ||
    'Pending'
  )

}


const getStatusClass = (
  status
) => {

  const value =
    String(
      status || ''
    ).toLowerCase()


  if (
    value === 'approved' ||
    value === 'success' ||
    value === 'completed'
  ) {

    return 'status-success'

  }


  if (
    value === 'rejected' ||
    value === 'failed'
  ) {

    return 'status-danger'

  }


  return 'status-pending'

}


/*
|--------------------------------------------------------------------------
| Load balance
|--------------------------------------------------------------------------
*/

const loadBalance = async () => {

  try {

    const response =
      await api.get(
        '/wallet'
      )


    if (
      response.data?.success
    ) {

      balance.value =
        Number(
          response.data.data.balance ||
          0
        )

    }

  } catch (error) {

    console.error(
      'Balance error:',
      error
    )

  }

}


/*
|--------------------------------------------------------------------------
| QR upload
|--------------------------------------------------------------------------
*/

const handleQrUpload = (
  event
) => {

  const file =
    event.target.files?.[0]


  if (!file) {
    return
  }


  if (
    ![
      'image/png',
      'image/jpeg',
      'image/webp',
    ].includes(file.type)
  ) {

    errors.qrImage =
      'Please upload PNG, JPG or WEBP.'

    return

  }


  if (
    file.size >
    2 * 1024 * 1024
  ) {

    errors.qrImage =
      'File size should not exceed 2MB.'

    return

  }


  errors.qrImage = ''

  form.qrImage = file


  if (qrPreviewUrl.value) {

    URL.revokeObjectURL(
      qrPreviewUrl.value
    )

  }


  qrPreviewUrl.value =
    URL.createObjectURL(
      file
    )

}


/*
|--------------------------------------------------------------------------
| Remove QR
|--------------------------------------------------------------------------
*/

const removeQrCode = () => {

  form.qrImage = null


  if (qrPreviewUrl.value) {

    URL.revokeObjectURL(
      qrPreviewUrl.value
    )

  }


  qrPreviewUrl.value =
    null

}


/*
|--------------------------------------------------------------------------
| Withdrawal
|--------------------------------------------------------------------------
*/

const handleWithdraw = async () => {

  apiMessage.text = ''

  errors.amount = ''

  errors.qrImage = ''


  const amount =
    Number(form.amount)


  /*
   * Basic validation
   */

  if (
    !amount ||
    Number.isNaN(amount) ||
    amount <= 0
  ) {

    errors.amount =
      'Enter a valid withdrawal amount.'

    return

  }


  /*
   * Minimum withdrawal
   */

  if (
    amount <
    minWithdrawAmount.value
  ) {

    errors.amount =
      `Minimum withdrawal amount is ₹${formatCurrency(minWithdrawAmount.value)}.`

    return

  }


  /*
   * Balance
   */

  if (
    amount >
    availableBalance.value
  ) {

    errors.amount =
      'Amount exceeds available balance.'

    return

  }


  /*
   * Bank validation
   */

  if (
    transferMode.value === 'bank' &&
    (
      !form.accountName ||
      !form.accountNumber ||
      !form.ifsc
    )
  ) {

    apiMessage.type =
      'error'

    apiMessage.text =
      'Please enter complete bank details.'

    return

  }


  /*
   * UPI validation
   */

  if (
    transferMode.value === 'upi' &&
    !form.upiId
  ) {

    apiMessage.type =
      'error'

    apiMessage.text =
      'Please enter your UPI ID.'

    return

  }


  isLoading.value = true


  try {

    const formData =
      new FormData()


    formData.append(
      'amount',
      amount
    )


    formData.append(
      'mode',
      transferMode.value
    )


    if (
      transferMode.value === 'bank'
    ) {

      formData.append(
        'account_name',
        form.accountName
      )


      formData.append(
        'account_number',
        form.accountNumber
      )


      formData.append(
        'ifsc',
        form.ifsc.toUpperCase()
      )

    }


    if (
      transferMode.value === 'upi'
    ) {

      formData.append(
        'upi_id',
        form.upiId
      )


      if (form.qrImage) {

        formData.append(
          'qr_code_image',
          form.qrImage
        )

      }

    }


    const response =
      await api.post(
        '/wallet/withdraw',
        formData
      )


    if (
      response.data?.success
    ) {

      apiMessage.type =
        'success'


      apiMessage.text =
        response.data.message ||
        'Withdrawal request submitted successfully.'


      await loadBalance()

      await loadPendingWithdrawals()


      setTimeout(() => {

        router.push(
          '/wallet'
        )

      }, 1500)

    }

  } catch (error) {

    console.error(
      'Withdrawal error:',
      error
    )


    apiMessage.type =
      'error'


    apiMessage.text =
      error.response?.data?.message ||
      'Withdrawal failed. Try again.'

  } finally {

    isLoading.value =
      false

  }

}


/*
|--------------------------------------------------------------------------
| Pending withdrawals API
|--------------------------------------------------------------------------
*/

const loadPendingWithdrawals =
  async () => {

    pendingLoading.value =
      true


    try {

      const response =
        await api.get(
          PENDING_WITHDRAWAL_ENDPOINT,
          {
            params: {
              status: 'pending',
              type: 'debit',
            },
          }
        )
      const responseData =
        response.data
      let list =
        responseData?.data

      if (
        list &&
        !Array.isArray(list) &&
        Array.isArray(
          list.data
        )
      ) {

        list =
          list.data

      }


      pendingWithdrawals.value =
        Array.isArray(list)
          ? list
          : []

    } catch (error) {

      console.error(
        'Pending withdrawals error:',
        error
      )

    } finally {

      pendingLoading.value =
        false

    }

  }


/*
|--------------------------------------------------------------------------
| Activity rotation
|--------------------------------------------------------------------------
*/

const startActivityRotation =
  () => {

    if (activityTimer) {

      clearInterval(
        activityTimer
      )

    }


    activityTimer =
      setInterval(() => {

        withdrawActivityIndex.value =
          (
            withdrawActivityIndex.value +
            1
          ) %
          demoWithdrawActivities.length

      }, 4500)

  }


/*
|--------------------------------------------------------------------------
| Pending refresh
|--------------------------------------------------------------------------
*/

const startPendingRefresh =
  () => {

    if (pendingTimer) {

      clearInterval(
        pendingTimer
      )

    }


    pendingTimer =
      setInterval(() => {

        loadPendingWithdrawals()

      }, 30000)

  }


/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(async () => {

  await Promise.all([
    loadBalance(),
    loadSettings([
      'min_withdraw',
    ]),
    loadPendingWithdrawals(),
  ])


  startActivityRotation()

  startPendingRefresh()

})


onBeforeUnmount(() => {

  if (activityTimer) {

    clearInterval(
      activityTimer
    )

    activityTimer = null

  }


  if (pendingTimer) {

    clearInterval(
      pendingTimer
    )

    pendingTimer = null

  }


  if (qrPreviewUrl.value) {

    URL.revokeObjectURL(
      qrPreviewUrl.value
    )

  }

})
</script>


<style scoped>
/* =========================================================
   BASE
========================================================= */

.withdraw-page {
  min-height: 100vh;
  background:
    linear-gradient(180deg,
      #f7faf9 0%,
      #f5f7f8 45%,
      #f8f9fa 100%);

  color: #172033;
  overflow-x: hidden;
}


.container-fluid {
  width: 100%;
  max-width: 760px;
  margin: auto;
}


/* =========================================================
   HEADER
========================================================= */

.page-header {
  padding-top: 12px;
}


.header-back {
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 11px;
}


.back-btn {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 14px;
  border: 1px solid #e6ebea;
  background: #fff;
  color: #172033;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-shadow:
    0 5px 15px rgba(20,
      35,
      45,
      .06);

  transition: .2s ease;
}


.back-btn:active {
  transform: scale(.93);
}


.header-title {
  flex: 1;
  min-width: 0;
}


.header-title h5 {
  margin: 0;
  font-size: 17px;
  font-weight: 900;
}


.header-title span {
  display: block;
  margin-top: 2px;
  color: #8a94a0;
  font-size: 10px;
  font-weight: 600;
}


.header-secure {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  color: #008f69;
  background: #e8faf3;
  display: flex;
  align-items: center;
  justify-content: center;
}


/* =========================================================
   ACTIVITY
========================================================= */

.activity-section {
  margin-top: 14px;
  padding: 13px;
  border-radius: 21px;
  border: 1px solid #e2efea;
  background:
    linear-gradient(145deg,
      #ffffff,
      #f7fffb);

  box-shadow:
    0 8px 25px rgba(24,
      40,
      52,
      .05);
}


.activity-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 9px;
}


.activity-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 900;
}


.activity-top small {
  display: block;
  margin-top: 2px;
  color: #9aa3ad;
  font-size: 8px;
}


.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00b67d;
  box-shadow:
    0 0 0 4px rgba(0,
      182,
      125,
      .1),
    0 0 8px rgba(0,
      182,
      125,
      .5);

  animation:
    pulse 1.3s infinite;
}


.activity-live {
  padding: 4px 7px;
  border-radius: 7px;
  color: #008b65;
  background: #e3f9f0;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: .5px;
}


.activity-card {
  min-height: 57px;
  padding: 9px;
  border-radius: 13px;
  border: 1px solid #e0eee9;
  background: #f4faf8;
  display: flex;
  align-items: center;
  gap: 9px;
}


.activity-avatar {
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  border-radius: 11px;
  color: #fff;
  background:
    linear-gradient(135deg,
      #d32f2f,
      #f04d4d);

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 11px;
  font-weight: 900;
}


.activity-content {
  flex: 1;
  min-width: 0;
}


.activity-message {
  color: #4d5966;
  font-size: 9px;
  line-height: 1.35;
}


.activity-message strong {
  color: #172033;
}


.activity-content small {
  display: block;
  margin-top: 3px;
  color: #00a878;
  font-size: 7px;
  font-weight: 700;
}


.activity-money {
  color: #d02e3a;
  font-size: 10px;
  font-weight: 900;
}


/* =========================================================
   BALANCE
========================================================= */

.balance-card {
  margin-top: 14px;
  padding: 17px;
  border-radius: 22px;
  color: #fff;
  background:
    linear-gradient(135deg,
      #171c25,
      #252c37);

  box-shadow:
    0 10px 28px rgba(20,
      25,
      35,
      .16);

  position: relative;
  overflow: hidden;
}


.balance-card::after {
  content: '';
  position: absolute;
  width: 160px;
  height: 160px;
  right: -65px;
  top: -75px;
  border-radius: 50%;
  background:
    rgba(211,
      47,
      47,
      .12);
}


.balance-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}


.balance-label {
  display: block;
  color: rgba(255,
      255,
      255,
      .58);

  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .5px;
}


.balance-content h2 {
  margin: 3px 0 2px;
  font-size: 27px;
  font-weight: 950;
  letter-spacing: -.5px;
}


.balance-content small {
  color: rgba(255,
      255,
      255,
      .55);

  font-size: 9px;
}


.balance-icon {
  width: 48px;
  height: 48px;
  border-radius: 15px;
  color: #fff;
  background:
    linear-gradient(135deg,
      #d32f2f,
      #ed4545);

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 19px;

  box-shadow:
    0 7px 16px rgba(211,
      47,
      47,
      .28);
}


.balance-bottom {
  position: relative;
  z-index: 1;

  margin-top: 13px;
  padding-top: 10px;

  border-top:
    1px solid rgba(255,
      255,
      255,
      .08);

  color: rgba(255,
      255,
      255,
      .53);

  font-size: 8px;
}


.balance-bottom i {
  color: #ff6868;
  margin-right: 4px;
}


/* =========================================================
   API MESSAGE
========================================================= */

.api-message {
  margin-top: 13px;
  padding: 11px 13px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 11px;
  font-weight: 700;
  box-shadow:
    0 5px 18px rgba(20,
      35,
      45,
      .06);
}


.message-success {
  color: #087953;
  background: #edfff8;
  border: 1px solid #c8f2e3;
}


.message-error {
  color: #bd3043;
  background: #fff2f4;
  border: 1px solid #ffd6dc;
}


.message-icon {
  font-size: 16px;
}


.message-close {
  border: 0;
  background: transparent;
  color: inherit;
  opacity: .6;
  font-size: 20px;
}


/* =========================================================
   WITHDRAW CARD
========================================================= */

.withdraw-card {
  margin-top: 14px;
  padding: 18px;
  border-radius: 22px;
  background: #fff;
  border: 1px solid #e8eded;
  box-shadow:
    0 8px 25px rgba(24,
      40,
      52,
      .055);
}


.section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 17px;
}


.section-icon {
  width: 39px;
  height: 39px;
  border-radius: 12px;
  color: #d32f2f;
  background: #fff0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}


.section-heading strong {
  display: block;
  font-size: 14px;
  font-weight: 900;
}


.section-heading small {
  display: block;
  margin-top: 2px;
  color: #8a94a0;
  font-size: 9px;
}


/* =========================================================
   DESTINATION
========================================================= */

.field-label {
  display: block;
  margin-bottom: 7px;
  color: #4b5663;
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .35px;
}


.destination-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}


.destination-option {
  min-width: 0;
  padding: 12px 10px;
  border: 1.5px solid #e4e9e8;
  border-radius: 16px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  cursor: pointer;
  transition: .2s ease;
}


.destination-option:active {
  transform: scale(.98);
}


.destination-option.selected {
  border-color: #d32f2f;
  background: #fff8f8;
  box-shadow:
    0 5px 15px rgba(211,
      47,
      47,
      .07);
}


.destination-icon {
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}


.destination-icon.bank {
  color: #d32f2f;
  background: #fff0f0;
}


.destination-icon.upi {
  color: #5864d9;
  background: #eef0ff;
}


.destination-text {
  flex: 1;
  min-width: 0;
}


.destination-text strong {
  display: block;
  color: #26313d;
  font-size: 10px;
  font-weight: 900;
}


.destination-text small {
  display: block;
  margin-top: 2px;
  color: #9099a3;
  font-size: 7px;
}


.destination-radio {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
  border: 2px solid #d1d8d6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}


.destination-option.selected .destination-radio {
  border-color: #d32f2f;
}


.destination-option.selected .destination-radio span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d32f2f;
}


/* =========================================================
   AMOUNT
========================================================= */

.form-field {
  margin-top: 15px;
}


.amount-field {
  margin-top: 17px;
}


.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}


.minimum-label {
  color: #b05a5a;
  font-size: 8px;
  font-weight: 800;
}


.amount-input {
  height: 54px;
  padding: 0 12px;
  border-radius: 16px;
  border: 1px solid #e2e7e6;
  background: #f8faf9;
  display: flex;
  align-items: center;
  transition: .2s ease;
}


.amount-input:focus-within {
  border-color: #d32f2f;
  background: #fff;
  box-shadow:
    0 0 0 4px rgba(211,
      47,
      47,
      .06);
}


.amount-input.invalid {
  border-color: #dc3545;
  background: #fff7f8;
}


.amount-symbol {
  color: #d32f2f;
  font-size: 26px;
  font-weight: 950;
}


.amount-input input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0 8px;
  border: 0;
  outline: 0;
  background: transparent;
  color: #172033;
  font-size: 25px;
  font-weight: 950;
}


.amount-input input::placeholder {
  color: #b8c0c7;
}


.amount-input input::-webkit-inner-spin-button,
.amount-input input::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}


.amount-currency {
  color: #99a2aa;
  font-size: 9px;
  font-weight: 800;
}


.field-error {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  color: #d52f42;
  font-size: 9px;
  font-weight: 700;
}


/* =========================================================
   QUICK AMOUNTS
========================================================= */

.quick-amounts {
  display: grid;
  grid-template-columns:
    repeat(4,
      1fr);

  gap: 7px;
  margin-top: 9px;
}


.quick-amounts button {
  min-height: 36px;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid #e1e6e5;
  background: #fff;
  color: #596572;
  font-size: 9px;
  font-weight: 800;
  transition: .2s ease;
}


.quick-amounts button:active {
  transform: scale(.95);
}


.quick-amounts button.selected {
  color: #c82f3b;
  background: #fff0f0;
  border-color: #f0b6b6;
}


/* =========================================================
   DETAILS
========================================================= */

.details-panel {
  margin-top: 16px;
  padding-top: 15px;
  border-top: 1px dashed #dfe6e4;
}


.details-heading {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 12px;
}


.details-heading-icon {
  width: 35px;
  height: 35px;
  border-radius: 10px;
  color: #d32f2f;
  background: #fff0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}


.details-heading-icon.upi-heading {
  color: #5964d8;
  background: #eef0ff;
}


.details-heading strong {
  display: block;
  font-size: 11px;
  font-weight: 900;
}


.details-heading small {
  display: block;
  margin-top: 2px;
  color: #929ca6;
  font-size: 8px;
}


.text-input {
  height: 44px;
  padding: 0 11px;
  border-radius: 12px;
  border: 1px solid #dfe5e4;
  background: #fafcfc;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: .2s ease;
}


.text-input:focus-within {
  border-color: #d32f2f;
  background: #fff;
}


.text-input i {
  color: #8a9694;
  font-size: 13px;
}


.text-input input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #26313d;
  font-size: 10px;
}


.optional-label {
  color: #9aa3ac;
  font-size: 8px;
  font-weight: 600;
}


/* =========================================================
   QR
========================================================= */

.qr-upload-box {
  min-height: 125px;
  border: 1.5px dashed #cbd8d4;
  border-radius: 14px;
  background: #f9fcfb;
  transition: .2s ease;
}


.qr-upload-box:hover {
  border-color: #d32f2f;
  background: #fff9f9;
}


.qr-upload-box.has-preview {
  padding: 10px;
  text-align: center;
}


.qr-empty {
  min-height: 122px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: pointer;
}


.qr-empty input {
  display: none;
}


.qr-upload-icon {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  color: #d32f2f;
  background: #fff0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}


.qr-empty strong {
  margin-top: 6px;
  color: #26313d;
  font-size: 10px;
}


.qr-empty small {
  margin-top: 3px;
  color: #959ea7;
  font-size: 7px;
}


.qr-upload-action {
  margin-top: 7px;
  color: #d32f2f;
  font-size: 8px;
  font-weight: 900;
}


.qr-preview-wrap {
  position: relative;
  display: inline-block;
}


.qr-preview {
  max-width: 180px;
  max-height: 155px;
  border-radius: 11px;
  object-fit: contain;
  border: 1px solid #e3e9e7;
  background: #fff;
}


.qr-remove {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 25px;
  height: 25px;
  border: 0;
  border-radius: 50%;
  color: #fff;
  background: #dc3545;
  box-shadow:
    0 4px 10px rgba(0,
      0,
      0,
      .15);
}


.qr-preview-label {
  margin-top: 5px;
  color: #008e67;
  font-size: 8px;
  font-weight: 800;
}


/* =========================================================
   SUBMIT
========================================================= */

.withdraw-button {
  width: 100%;
  min-height: 56px;
  margin-top: 17px;
  padding: 0 16px;
  border: 0;
  border-radius: 17px;
  color: #fff;
  background:
    linear-gradient(135deg,
      #b8232e,
      #d8323d,
      #e64a54);

  box-shadow:
    0 10px 24px rgba(211,
      47,
      47,
      .22);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  transition: .2s ease;
}


.withdraw-button:active {
  transform: scale(.98);
}


.withdraw-button:disabled {
  opacity: .7;
}


.withdraw-button-left {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  font-weight: 900;
}


.withdraw-button-right {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 950;
}


.secure-note {
  margin-top: 7px;
  text-align: center;
  color: #9aa3ac;
  font-size: 8px;
}


.secure-note i {
  color: #00a878;
}


/* =========================================================
   PENDING
========================================================= */

.pending-section {
  margin-top: 14px;
  padding: 16px;
  border-radius: 22px;
  border: 1px solid #e8eded;
  background: #fff;
  box-shadow:
    0 8px 25px rgba(24,
      40,
      52,
      .05);
}


.pending-heading {
  margin-bottom: 12px;
  justify-content: space-between;
}


.pending-heading>div {
  min-width: 0;
}


.pending-heading strong {
  display: block;
  font-size: 13px;
  font-weight: 900;
}


.pending-heading small {
  display: block;
  margin-top: 2px;
  color: #929ca6;
  font-size: 9px;
}


.refresh-btn {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 10px;
  border: 1px solid #e3e8e7;
  background: #fff;
  color: #66727d;
}


.refresh-btn.spinning i {
  display: inline-block;
  animation:
    spin .7s linear infinite;
}


.pending-loading {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #89939d;
  font-size: 9px;
}


.pending-loading .spinner-border {
  color: #d32f2f;
}


.empty-pending {
  padding: 25px 10px;
  text-align: center;
}


.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 9px;
  border-radius: 15px;
  color: #8b96a1;
  background: #f1f4f4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}


.empty-pending strong {
  display: block;
  font-size: 11px;
}


.empty-pending span {
  display: block;
  max-width: 260px;
  margin: 4px auto 0;
  color: #98a1ab;
  font-size: 8px;
  line-height: 1.4;
}


.pending-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}


.pending-item {
  min-height: 60px;
  padding: 9px;
  border-radius: 14px;
  border: 1px solid #edf1ef;
  background: #f8faf9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}


.pending-left {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
}


.pending-icon {
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  border-radius: 10px;
  color: #d32f2f;
  background: #fff0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}


.pending-left strong {
  display: block;
  color: #26313d;
  font-size: 11px;
  font-weight: 900;
}


.pending-left small {
  display: block;
  margin-top: 2px;
  color: #929ca6;
  font-size: 8px;
}


.pending-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}


.pending-right>small {
  color: #929ca6;
  font-size: 7px;
}


.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 7px;
  border-radius: 20px;
  font-size: 7px;
  font-weight: 900;
}


.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}


.status-pending {
  color: #a16a00;
  background: #fff6dc;
}


.status-pending .status-dot {
  background: #f2a900;
  box-shadow:
    0 0 5px #f2a900;
}


.status-success {
  color: #087c58;
  background: #e7faf2;
}


.status-success .status-dot {
  background: #00a878;
}


.status-danger {
  color: #c12e40;
  background: #fff0f2;
}


.status-danger .status-dot {
  background: #dc3545;
}


/* =========================================================
   FOOTER
========================================================= */

.page-footer-note {
  padding: 14px 5px;
  text-align: center;
  color: #9ba3ad;
  font-size: 8px;
}


.page-footer-note i {
  margin-right: 3px;
  color: #00a878;
}


/* =========================================================
   ANIMATIONS
========================================================= */

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.3);
  }

}


@keyframes spin {

  to {
    transform: rotate(360deg);
  }

}


.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: .25s ease;
}


.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-7px);
}


.activity-slide-enter-active,
.activity-slide-leave-active {
  transition: all .35s ease;
}


.activity-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}


.activity-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 380px) {

  .withdraw-card,
  .pending-section {
    padding: 14px;
  }


  .destination-option {
    padding: 10px 8px;
  }


  .destination-text strong {
    font-size: 9px;
  }


  .destination-text small {
    font-size: 6px;
  }


  .quick-amounts {
    gap: 5px;
  }


  .amount-input input {
    font-size: 22px;
  }

}


/* =========================================================
   DESKTOP
========================================================= */

@media (min-width: 768px) {

  .page-header {
    padding-top: 18px;
  }

}


/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {

  *,
  *::before,
  *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }

}
</style>
