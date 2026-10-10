<template>
  <div class="add-money-page pb-5">

    <main class="container-fluid px-3">
      <section class="activity-section">
        <transition name="activity-slide" mode="out-in">
          <div :key="activityIndex" class="activity-card">
            <div class="activity-avatar">
              {{ currentActivity.initials }}
            </div>
            <div class="activity-content">
              <div class="activity-message">
                <strong>{{ currentActivity.name }}</strong>
                added
                <strong>₹{{ currentActivity.amount }}</strong>
                to wallet
              </div>
              <small>
                <i class="bi bi-check-circle-fill"></i>
                Payment completed • Just now
              </small>
            </div>
            <div class="activity-money">
              ₹{{ currentActivity.amount }}
            </div>
          </div>
        </transition>
      </section>

      <section class="amount-card">
        <div class="section-label">
          <span class="section-icon green">
            <i class="bi bi-wallet2"></i>
          </span>
          <div>
            <strong>Add money</strong>
            <small>Choose how much you want to add</small>
          </div>
        </div>
        <div class="amount-input-box">
          <span class="rupee-symbol">₹</span>
          <input v-model.number="form.amount" type="number" min="1" inputmode="decimal" placeholder="0"
            aria-label="Amount" />
          <span class="amount-suffix">INR</span>
        </div>
        <div class="quick-amounts">
          <button v-for="amount in quickAmounts" :key="amount" type="button"
            :class="{ selected: Number(form.amount) === amount }" @click="form.amount = amount">
            ₹{{ amount.toLocaleString('en-IN') }}
          </button>
        </div>
      </section>

      <section class="payment-card">
        <div class="section-heading">
          <div>
            <h6>Choose payment method</h6>
            <span>Fast & secure payment</span>
          </div>
          <span class="secured-pill">
            <i class="bi bi-lock-fill"></i>
            Secure
          </span>
        </div>
        <!-- AUTOMATIC GATEWAY -->
        <div v-if="gatewayEnabled" class="gateway-option" :class="{ selected: form.paymentMethod === 'gateway' }"
          @click="form.paymentMethod = 'gateway'">
          <div class="gateway-top">
            <div class="gateway-radio">
              <span></span>
            </div>
            <div class="gateway-main">
              <div class="gateway-title-row">
                <strong>UPI Payment</strong>
                <span class="recommended-badge">
                  Recommended
                </span>
              </div>
              <small>
                Pay instantly using your preferred UPI app
              </small>
            </div>
            <div class="gateway-lightning">
              <i class="bi bi-lightning-charge-fill"></i>
            </div>
          </div>
          <!-- UPI APP STYLE -->
          <div class="upi-apps">
            <div class="upi-app">
              <div class="upi-icon gpay">
                <span>G</span>
              </div>
              <small>Google Pay</small>
            </div>
            <div class="upi-app">
              <div class="upi-icon phonepe">
                <span>पे</span>
              </div>
              <small>PhonePe</small>
            </div>
            <div class="upi-app">
              <div class="upi-icon paytm">
                <span>₹</span>
              </div>
              <small>Paytm</small>
            </div>
            <div class="upi-app">
              <div class="upi-icon bhim">
                <span>BH</span>
              </div>
              <small>BHIM</small>
            </div>
            <div class="upi-app">
              <div class="upi-icon more">
                <i class="bi bi-three-dots"></i>
              </div>
              <small>More</small>
            </div>
          </div>
          <div class="gateway-note">
            <i class="bi bi-shield-check"></i>
            You'll be redirected to the secure payment page.
          </div>
        </div>
        <!-- MANUAL UPI -->
        <div class="manual-option" :class="{ selected: form.paymentMethod === 'manual_upi' }"
          @click="form.paymentMethod = 'manual_upi'">
          <div class="manual-option-inner">
            <div class="gateway-radio">
              <span></span>
            </div>
            <div class="manual-icon">
              <i class="bi bi-qr-code-scan"></i>
            </div>
            <div class="manual-content">
              <strong>Manual UPI</strong>
              <small>
                Pay by QR and submit UTR
              </small>
            </div>
            <i class="bi bi-chevron-right manual-arrow"></i>
          </div>
        </div>
      </section>

      <transition name="slide-fade">
        <div v-if="apiMessage.text" class="api-message"
          :class="apiMessage.type === 'error' ? 'message-error' : 'message-success'">
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
      <button type="button" class="pay-button" :disabled="isLoading" @click="handleAddMoney">
        <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
        <template v-else>
          <span class="pay-button-left">
            <i class="bi bi-lock-fill"></i>
            Secure Payment
          </span>
          <span class="pay-button-amount">
            ₹{{ formatCurrency(form.amount) }}
            <i class="bi bi-arrow-right"></i>
          </span>
        </template>
      </button>

      <div class="secure-footer">
        <i class="bi bi-shield-check"></i>
        Your payment is processed securely.
      </div>

      <section class="pending-section">
        <div class="section-heading pending-heading">
          <div>
            <h6>Pending payments</h6>
            <span>Your recent add-money requests</span>
          </div>
          <button type="button" class="refresh-btn" :class="{ spinning: pendingLoading }" @click="loadPendingPayments">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
        <!-- LOADING -->
        <div v-if="pendingLoading && pendingPayments.length === 0" class="pending-loading">
          <div class="spinner-border spinner-border-sm"></div>
          <span>Loading requests...</span>
        </div>
        <!-- EMPTY -->
        <div v-else-if="!pendingLoading && pendingPayments.length === 0" class="empty-pending">
          <div class="empty-icon">
            <i class="bi bi-receipt"></i>
          </div>
          <strong>No pending payments</strong>
          <span>
            Your pending add-money requests will appear here.
          </span>
        </div>
        <!-- TABLE / LIST -->
        <div v-else class="pending-list">
          <div v-for="payment in pendingPayments" :key="payment.id" class="pending-item">
            <div class="pending-item-left">
              <div class="pending-payment-icon">
                <i class="bi bi-arrow-down-left"></i>
              </div>
              <div>
                <strong>
                  ₹{{ formatCurrency(payment.amount) }}
                </strong>
                <small>
                  {{ formatPaymentDate(payment.created_at) }}
                </small>
              </div>
            </div>
            <div class="pending-item-right">
              <span class="status-pill" :class="getStatusClass(payment.status)">
                <span class="status-dot"></span>
                {{ formatStatus(payment.status) }}
              </span>
              <small v-if="payment.utr">
                UTR: {{ payment.utr }}
              </small>
            </div>
          </div>
        </div>
      </section>
    </main>


    <transition name="modal">
      <div v-if="showManualModal" class="modal-backdrop-custom" @click.self="closeManualModal">
        <div class="manual-modal">
          <div class="modal-header-custom">
            <div class="modal-title-wrap">
              <div class="modal-upi-icon">
                <i class="bi bi-qr-code"></i>
              </div>
              <div>
                <h5>Pay via UPI</h5>
                <small>
                  ₹{{ formatCurrency(form.amount) }}
                </small>
              </div>
            </div>
            <button type="button" class="modal-close" @click="closeManualModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body-custom">
            <div class="qr-container">
              <div class="qr-label">
                Scan & Pay
              </div>
              <img v-if="paymentInfo.qr_url" :src="paymentInfo.qr_url" class="manual-qr" alt="UPI QR Code" />
              <div v-else class="qr-placeholder">
                <i class="bi bi-qr-code"></i>
                <span>QR unavailable</span>
              </div>
              <strong>
                {{ paymentInfo.name || 'UPI Payment' }}
              </strong>
              <button v-if="paymentInfo.upi_id" type="button" class="upi-copy" @click="copyUpiId">
                {{ paymentInfo.upi_id }}
                <i class="bi bi-copy"></i>
              </button>
            </div>
            <div class="manual-app-row">
              <div>
                <div class="mini-upi-icon gpay">
                  G
                </div>
                <span>GPay</span>
              </div>
              <div>
                <div class="mini-upi-icon phonepe">
                  पे
                </div>
                <span>PhonePe</span>
              </div>
              <div>
                <div class="mini-upi-icon paytm">
                  ₹
                </div>
                <span>Paytm</span>
              </div>
              <div>
                <div class="mini-upi-icon bhim">
                  BH
                </div>
                <span>BHIM</span>
              </div>
            </div>
            <div class="manual-instruction">
              <i class="bi bi-info-circle-fill"></i>
              <span>
                Complete the payment first, then enter your UTR
                and upload the payment screenshot below.
              </span>
            </div>
            <div class="form-field">
              <label>
                UTR / Transaction ID
              </label>
              <div class="field-with-icon">
                <i class="bi bi-receipt"></i>
                <input v-model="manualForm.utr" type="text" autocomplete="off" placeholder="Enter 12 digit UTR" />
              </div>
            </div>
            <div class="form-field">
              <label>
                Payment Screenshot
              </label>
              <label class="upload-box">
                <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleScreenshot" />
                <template v-if="!screenshotPreview">
                  <div class="upload-icon">
                    <i class="bi bi-cloud-arrow-up"></i>
                  </div>
                  <strong>Upload screenshot</strong>
                  <small>
                    JPG, PNG or WEBP • Max 5MB
                  </small>
                </template>
                <template v-else>
                  <img :src="screenshotPreview" class="screenshot-preview" alt="Payment screenshot preview" />
                  <span class="change-image">
                    Tap to change
                  </span>
                </template>
              </label>
            </div>
            <button type="button" class="manual-submit-btn" :disabled="manualLoading" @click="submitManualRequest">
              <span v-if="manualLoading" class="spinner-border spinner-border-sm"></span>
              <template v-else>
                <i class="bi bi-check2-circle"></i>
                Submit Payment
              </template>
            </button>
          </div>
        </div>
      </div>

    </transition>

  </div>
</template>


<script setup>
import {
  reactive,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
} from 'vue'

import { useSettings } from '@/composables/useSettings'
import { useRouter, useRoute } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import { useAuthStore } from '@/utils/auth'
import api from '@/plugins/axios'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const {
  loadSettings,
  getSetting,
} = useSettings()

const minAddMoney = computed(() => {
  return Number(getSetting('min_deposit', 1)) || 1
})

const maxAddMoney = computed(() => {
  const configuredMaximum = Number(getSetting('max_deposit', 0)) || 0
  return configuredMaximum > 0
    ? Math.min(configuredMaximum, 1000000)
    : 1000000
})


/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const isLoading = ref(false)
const manualLoading = ref(false)

const gatewayEnabled = ref(false)
const showManualModal = ref(false)

const pendingLoading = ref(false)
const pendingGatewayRequestId = ref(null)

const quickAmounts = [
  100,
  500,
  1000,
  2000,
]


const form = reactive({
  amount: 500,
  paymentMethod: 'gateway',
})


const paymentInfo = reactive({
  upi_id: '',
  name: '',
  qr_url: '',
})


const manualForm = reactive({
  utr: '',
  screenshot: null,
})


const screenshotPreview = ref(null)


const apiMessage = reactive({
  text: '',
  type: 'error',
})


/*
|--------------------------------------------------------------------------
| Pending payments
|--------------------------------------------------------------------------
|
| Change this endpoint if your backend uses another route.
|--------------------------------------------------------------------------
*/

const PENDING_PAYMENT_ENDPOINT =
  '/wallet/get-money-request'

const pendingPayments = ref([])


/*
|--------------------------------------------------------------------------
| Demo activity
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This is intentionally labelled as demo activity.
| Replace it with real activity API if required.
|--------------------------------------------------------------------------
*/

const demoActivities = [
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

const activityIndex = ref(0)

const currentActivity = computed(() => {
  return demoActivities[
    activityIndex.value
  ]
})

let activityTimer = null
let pendingTimer = null
let browserFinishedListener = null


/*
|--------------------------------------------------------------------------
| Currency
|--------------------------------------------------------------------------
*/

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}


/*
|--------------------------------------------------------------------------
| Payment Date
|--------------------------------------------------------------------------
*/

const formatPaymentDate = (value) => {
  if (!value) {
    return '--'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}


/*
|--------------------------------------------------------------------------
| Payment Status
|--------------------------------------------------------------------------
*/

const formatStatus = (status) => {
  const value = String(status || '').toLowerCase()

  const map = {
    pending: 'Pending',
    processing: 'Processing',
    approved: 'Approved',
    success: 'Success',
    completed: 'Completed',
    rejected: 'Rejected',
    failed: 'Failed',
  }

  return map[value] || 'Pending'
}


const getStatusClass = (status) => {
  const value = String(status || '').toLowerCase()

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
| Load payment methods
|--------------------------------------------------------------------------
*/

const loadPaymentMethods = async () => {
  try {

    const response = await api.get(
      '/wallet/payment-methods'
    )

    if (!response.data?.success) {
      return
    }

    const data =
      response.data.data || {}

    const manualUpi =
      data.manual_upi || {}

    const gateway =
      data.gateway || {}


    paymentInfo.upi_id =
      manualUpi.upi_id || ''

    paymentInfo.name =
      manualUpi.name || ''

    paymentInfo.qr_url =
      manualUpi.qr_url || ''


    gatewayEnabled.value =
      Boolean(gateway.enabled)


    /*
     * Prefer automatic gateway when available.
     */
    if (gatewayEnabled.value) {
      form.paymentMethod = 'gateway'
    } else {
      form.paymentMethod = 'manual_upi'
    }

  } catch (error) {

    console.error(
      'Payment methods error:',
      error
    )

    /*
     * Don't break the page if payment-method
     * configuration API fails.
     */
  }
}


/*
|--------------------------------------------------------------------------
| Add money
|--------------------------------------------------------------------------
*/

const handleAddMoney = async () => {

  apiMessage.text = ''


  const amount =
    Number(form.amount)


  if (
    !amount ||
    Number.isNaN(amount) ||
    amount < minAddMoney.value
  ) {

    apiMessage.type = 'error'

    apiMessage.text =
      `Minimum add money amount is ₹${formatCurrency(minAddMoney.value)}.`

    return
  }

  if (
    maxAddMoney.value > 0 &&
    amount > maxAddMoney.value
  ) {

    apiMessage.type = 'error'

    apiMessage.text =
      `Maximum add money amount is ₹${formatCurrency(maxAddMoney.value)}.`

    return
  }


  if (
    form.paymentMethod === 'manual_upi'
  ) {

    showManualModal.value = true

    return
  }


  await createGatewayOrder()
}


/*
|--------------------------------------------------------------------------
| Automatic Gateway
|--------------------------------------------------------------------------
*/

const createGatewayOrder = async () => {

  isLoading.value = true

  try {

    const response =
      await api.post(
        '/wallet/gateway/create-order',
        {
          amount: Number(form.amount),
        }
      )


    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
        'Unable to start payment.'
      )
    }


    const paymentUrl =
      response.data?.data?.payment_url


    if (!paymentUrl) {
      throw new Error(
        'Payment URL missing.'
      )
    }


    pendingGatewayRequestId.value =
      response.data?.data?.request_id
        ? String(response.data.data.request_id)
        : null

    if (Capacitor.isNativePlatform()) {
      // Keep the app's WebView and auth storage alive while payment runs externally.
      await Browser.open({ url: paymentUrl })
    } else {
      window.location.href = paymentUrl
    }

  } catch (error) {

    console.error(
      'Gateway payment error:',
      error
    )

    apiMessage.type = 'error'

    apiMessage.text =
      error.response?.data?.message ||
      error.message ||
      'Unable to start payment.'

  } finally {

    isLoading.value = false
  }
}


/*
|--------------------------------------------------------------------------
| Screenshot
|--------------------------------------------------------------------------
*/

const handleScreenshot = (event) => {

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

    apiMessage.type = 'error'

    apiMessage.text =
      'Please upload JPG, PNG or WEBP.'

    return
  }


  if (
    file.size >
    5 * 1024 * 1024
  ) {

    apiMessage.type = 'error'

    apiMessage.text =
      'Screenshot must be less than 5MB.'

    return
  }


  manualForm.screenshot =
    file


  if (screenshotPreview.value) {

    URL.revokeObjectURL(
      screenshotPreview.value
    )
  }


  screenshotPreview.value =
    URL.createObjectURL(file)
}


/*
|--------------------------------------------------------------------------
| Submit Manual UPI
|--------------------------------------------------------------------------
*/

const submitManualRequest = async () => {

  apiMessage.text = ''


  if (
    !manualForm.utr.trim()
  ) {

    apiMessage.type = 'error'

    apiMessage.text =
      'Please enter UTR / transaction number.'

    return
  }


  if (
    !manualForm.screenshot
  ) {

    apiMessage.type = 'error'

    apiMessage.text =
      'Please upload payment screenshot.'

    return
  }


  manualLoading.value = true


  try {

    const formData =
      new FormData()


    formData.append(
      'amount',
      Number(form.amount)
    )

    formData.append(
      'utr',
      manualForm.utr.trim()
    )

    formData.append(
      'screenshot',
      manualForm.screenshot
    )


    const response =
      await api.post(
        '/wallet/add-money-request',
        formData
      )


    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
        'Unable to submit payment request.'
      )
    }


    showManualModal.value =
      false


    apiMessage.type =
      'success'


    apiMessage.text =
      response.data.message ||
      'Payment submitted successfully.'


    resetManualForm()


    /*
     * Immediately refresh pending list.
     */
    await loadPendingPayments()


    setTimeout(() => {
      router.push('/wallet')

    }, 1800)

  } catch (error) {

    console.error(
      'Manual payment error:',
      error
    )

    apiMessage.type =
      'error'


    apiMessage.text =
      error.response?.data?.message ||
      error.message ||
      'Unable to submit payment request.'

  } finally {

    manualLoading.value =
      false
  }
}


/*
|--------------------------------------------------------------------------
| Pending Payments API
|--------------------------------------------------------------------------
*/

const loadPendingPayments = async () => {

  pendingLoading.value = true

  try {

    const response =
      await api.get(
        PENDING_PAYMENT_ENDPOINT,
        {
          params: {
            statuses: ['pending', 'processing'],
            type: 'credit',
          },
        }
      )


    /*
     * Supports:
     *
     * { success: true, data: [] }
     *
     * OR
     *
     * { status: true, data: [] }
     *
     * OR
     *
     * { success: true, data: { data: [] } }
     */

    const responseData =
      response.data


    let list =
      responseData?.data


    if (
      list &&
      !Array.isArray(list) &&
      Array.isArray(list.data)
    ) {
      list = list.data
    }


    pendingPayments.value =
      Array.isArray(list)
        ? list
        : []

  } catch (error) {

    console.error(
      'Pending payments error:',
      error
    )

    /*
     * Don't show an error banner here.
     * The payment page should remain usable even
     * if pending-history API is temporarily unavailable.
     */

  } finally {

    pendingLoading.value =
      false
  }
}


const refreshGatewayPaymentStatus = async () => {
  const requestId = pendingGatewayRequestId.value
  if (!requestId) return

  try {
    await authStore.verifyAuthToken()

    // Query all recent credit requests here: filtering to pending/processing would
    // hide the approved/failed row we need to display after returning from checkout.
    const response = await api.get(PENDING_PAYMENT_ENDPOINT, {
      params: { type: 'credit', per_page: 50 },
    })

    let list = response.data?.data
    if (list && !Array.isArray(list) && Array.isArray(list.data)) list = list.data

    const request = Array.isArray(list)
      ? list.find((item) => String(item.id) === String(requestId))
      : null
    const status = String(request?.status || '').toLowerCase()

    if (status === 'approved') {
      apiMessage.type = 'success'
      apiMessage.text = 'Payment successful. Wallet balance has been refreshed.'
    } else if (status === 'failed' || status === 'rejected') {
      apiMessage.type = 'error'
      apiMessage.text = 'Payment failed. If money was deducted, please contact support.'
    } else if (!request) {
      apiMessage.type = 'error'
      apiMessage.text = 'Payment status is not available yet. Please refresh pending payments shortly.'
    } else {
      apiMessage.type = 'error'
      apiMessage.text = 'Payment is still being verified. Please refresh pending payments shortly.'
    }

    await loadPendingPayments()
  } catch (error) {
    console.warn('Unable to refresh gateway payment status:', error)
    apiMessage.type = 'error'
    apiMessage.text = 'Payment status could not be refreshed. Please check your wallet again shortly.'
  }
}


/*
|--------------------------------------------------------------------------
| Reset manual form
|--------------------------------------------------------------------------
*/

const resetManualForm = () => {

  manualForm.utr = ''

  manualForm.screenshot = null


  if (screenshotPreview.value) {

    URL.revokeObjectURL(
      screenshotPreview.value
    )
  }


  screenshotPreview.value =
    null
}


/*
|--------------------------------------------------------------------------
| Close modal
|--------------------------------------------------------------------------
*/

const closeManualModal = () => {

  if (manualLoading.value) {
    return
  }

  showManualModal.value =
    false
}


/*
|--------------------------------------------------------------------------
| Copy UPI
|--------------------------------------------------------------------------
*/

const copyUpiId = async () => {

  if (!paymentInfo.upi_id) {
    return
  }

  try {

    await navigator.clipboard.writeText(
      paymentInfo.upi_id
    )


    apiMessage.type =
      'success'

    apiMessage.text =
      'UPI ID copied.'

  } catch (error) {

    console.error(
      'Copy UPI error:',
      error
    )
  }
}


/*
|--------------------------------------------------------------------------
| Demo activity rotation
|--------------------------------------------------------------------------
*/

const startActivityRotation = () => {

  if (activityTimer) {
    clearInterval(activityTimer)
  }


  /*
   * 4.5 seconds keeps it noticeable
   * without becoming annoying.
   */
  activityTimer =
    setInterval(() => {
      activityIndex.value =
        (
          activityIndex.value + 1
        ) % demoActivities.length

    }, 4500)
}


/*
|--------------------------------------------------------------------------
| Pending refresh
|--------------------------------------------------------------------------
*/

const startPendingRefresh = () => {

  if (pendingTimer) {
    clearInterval(pendingTimer)
  }


  pendingTimer =
    setInterval(() => {
      loadPendingPayments()

    }, 30000)
}


/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      browserFinishedListener = await Browser.addListener(
        'browserFinished',
        () => {
          void refreshGatewayPaymentStatus()
        },
      )
    } catch (error) {
      console.warn('Unable to register payment browser listener:', error)
    }
  }

  await Promise.all([
    loadSettings(['min_deposit']),
    loadPaymentMethods(),
    loadPendingPayments(),
  ])

  if (String(route.query.gateway_return || '') === '1') {
    pendingGatewayRequestId.value = String(route.query.request_id || '')

    if (pendingGatewayRequestId.value) {
      await refreshGatewayPaymentStatus()
    } else {
      const status = String(route.query.status || '').toLowerCase()
      apiMessage.type = status === 'approved' ? 'success' : 'error'
      apiMessage.text = status === 'approved'
        ? 'Payment successful. Wallet balance has been refreshed.'
        : status === 'pending' || status === 'processing'
          ? 'Payment is still being verified. Please refresh pending payments shortly.'
          : 'Payment could not be completed. If money was deducted, please contact support.'

      await authStore.verifyAuthToken()
      await loadPendingPayments()
    }

    const remainingQuery = { ...route.query }
    delete remainingQuery.gateway_return
    delete remainingQuery.status
    delete remainingQuery.request_id
    await router.replace({ path: route.path, query: remainingQuery })
  }

  startActivityRotation()
  startPendingRefresh()
})



onBeforeUnmount(async () => {

  if (browserFinishedListener) {
    await browserFinishedListener.remove()
    browserFinishedListener = null
  }

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


  if (screenshotPreview.value) {

    URL.revokeObjectURL(
      screenshotPreview.value
    )
  }
})
</script>


<style scoped>
/* =========================================================
   BASE
========================================================= */

.add-money-page {
  min-height: 100vh;
  background:
    linear-gradient(180deg,
      #f7faf9 0%,
      #f5f7f8 42%,
      #f8f9fa 100%);
  color: #172033;
  overflow-x: hidden;
}


/* =========================================================
   HEADER
========================================================= */

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, .94);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #edf0f1;
}

.header-inner {
  width: 100%;
  max-width: 760px;
  margin: auto;
  padding:
    12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e8eded;
  color: #172033;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(20, 35, 45, .06);
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
  margin-top: 1px;
  color: #8a94a3;
  font-size: 11px;
  font-weight: 600;
}

.secure-badge {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #e9faf4;
  color: #009b70;
  display: flex;
  align-items: center;
  justify-content: center;
}


/* =========================================================
   CONTAINER
========================================================= */

.container-fluid {
  width: 100%;
  max-width: 760px;
  margin: auto;
}


/* =========================================================
   API MESSAGE
========================================================= */

.api-message {
  margin-top: 12px;
  padding: 11px 13px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 5px 18px rgba(20, 35, 45, .06);
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
  font-size: 17px;
}

.message-close {
  border: 0;
  background: transparent;
  font-size: 20px;
  color: inherit;
  opacity: .6;
}


/* =========================================================
   COMMON SECTION
========================================================= */

.amount-card,
.payment-card,
.pending-section,
.activity-section {
  margin-top: 14px;
  border-radius: 22px;
  background: #fff;
  border: 1px solid #e9eeee;
  box-shadow:
    0 8px 25px rgba(24, 40, 52, .055);
}


/* =========================================================
   AMOUNT
========================================================= */

.amount-card {
  padding: 18px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.section-icon {
  width: 39px;
  height: 39px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-icon.green {
  color: #008e68;
  background: #eafaf4;
}

.section-label strong {
  display: block;
  font-size: 14px;
  font-weight: 900;
}

.section-label small {
  display: block;
  color: #8993a1;
  font-size: 10px;
  margin-top: 2px;
}

.amount-input-box {
  height: 50px;
  padding: 0 12px;
  border-radius: 17px;
  background: #f7f9f9;
  border: 1px solid #e8eeee;
  display: flex;
  align-items: center;
  transition: .2s ease;
}

.amount-input-box:focus-within {
  background: #fff;
  border-color: #00a878;
  box-shadow: 0 0 0 4px rgba(0, 168, 120, .07);
}

.rupee-symbol {
  color: #00966e;
  font-size: 27px;
  font-weight: 900;
}

.amount-input-box input {
  min-width: 0;
  flex: 1;
  height: 100%;
  padding: 0 8px;
  border: 0;
  outline: 0;
  background: transparent;
  color: #172033;
  font-size: 30px;
  font-weight: 950;
}

.amount-input-box input::placeholder {
  color: #b7bec6;
}

.amount-input-box input::-webkit-inner-spin-button,
.amount-input-box input::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}

.amount-suffix {
  color: #98a1ab;
  font-size: 10px;
  font-weight: 800;
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
  margin-top: 11px;
}

.quick-amounts button {
  min-height: 39px;
  padding: 4px;
  border: 1px solid #e2e8e6;
  border-radius: 11px;
  background: #fff;
  color: #536071;
  font-size: 11px;
  font-weight: 800;
  transition: .2s ease;
}

.quick-amounts button:active {
  transform: scale(.95);
}

.quick-amounts button.selected {
  color: #008b65;
  background: #eafaf4;
  border-color: #9ee1cc;
}

.amount-hint {
  margin-top: 10px;
  color: #919aa5;
  font-size: 10px;
  display: flex;
  gap: 5px;
  align-items: center;
}


/* =========================================================
   PAYMENT
========================================================= */

.payment-card {
  padding: 18px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}

.section-heading h6 {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
}

.section-heading span {
  display: block;
  color: #8b95a1;
  font-size: 10px;
  margin-top: 2px;
}

.secured-pill {
  display: inline-flex !important;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border-radius: 20px;
  color: #008c67 !important;
  background: #eafaf4;
  font-size: 9px !important;
  font-weight: 800;
}


/* Gateway */

.gateway-option {
  position: relative;
  padding: 14px;
  border: 1.5px solid #e3e9e7;
  border-radius: 18px;
  background: #fff;
  cursor: pointer;
  transition: .25s ease;
}

.gateway-option.selected {
  border-color: #00a878;
  background:
    linear-gradient(145deg,
      #f5fffb,
      #fff);
  box-shadow:
    0 7px 22px rgba(0, 168, 120, .09);
}

.gateway-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gateway-radio {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  border: 2px solid #ccd5d2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected .gateway-radio {
  border-color: #00a878;
}

.selected .gateway-radio span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #00a878;
}

.gateway-main {
  flex: 1;
  min-width: 0;
}

.gateway-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.gateway-title-row strong {
  font-size: 13px;
  font-weight: 900;
}

.gateway-main small {
  display: block;
  margin-top: 3px;
  color: #7d8792;
  font-size: 10px;
}

.recommended-badge {
  display: inline-block !important;
  padding: 3px 6px;
  border-radius: 5px;
  color: #008b65 !important;
  background: #dff8ee;
  font-size: 7px !important;
  font-weight: 900;
  text-transform: uppercase;
}

.gateway-lightning {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #00a878, #00ca96);
  box-shadow: 0 5px 12px rgba(0, 168, 120, .2);
}


/* UPI apps */

.upi-apps {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  margin-top: 15px;
  padding: 12px 2px 3px;
  border-top: 1px dashed #e2e8e6;
}

.upi-app {
  min-width: 42px;
  text-align: center;
}

.upi-icon {
  width: 37px;
  height: 37px;
  margin: auto;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 900;
  font-size: 14px;
  box-shadow: 0 4px 9px rgba(20, 35, 45, .1);
}

.upi-app small {
  display: block;
  margin-top: 5px;
  color: #7e8994;
  font-size: 7px;
  font-weight: 700;
  white-space: nowrap;
}

.gpay {
  background: linear-gradient(135deg, #4285f4, #34a853);
}

.phonepe {
  background: linear-gradient(135deg, #5f259f, #7e3cc7);
}

.paytm {
  background: linear-gradient(135deg, #00baf2, #008ed6);
}

.bhim {
  background: linear-gradient(135deg, #0084c8, #00a7df);
}

.more {
  color: #687481;
  background: #edf1f2;
}

.gateway-note {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 11px;
  color: #7f8994;
  font-size: 9px;
}


/* Manual */

.manual-option {
  margin-top: 9px;
  padding: 13px 14px;
  border: 1px solid #e5eaea;
  border-radius: 16px;
  cursor: pointer;
  transition: .2s ease;
}

.manual-option.selected {
  border-color: #00a878;
  background: #f7fffc;
}

.manual-option-inner {
  display: flex;
  align-items: center;
  gap: 10px;
}

.manual-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  color: #5361d9;
  background: #eef0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.manual-content {
  flex: 1;
}

.manual-content strong {
  display: block;
  font-size: 12px;
  font-weight: 900;
}

.manual-content small {
  display: block;
  margin-top: 2px;
  color: #8b95a0;
  font-size: 9px;
}

.manual-arrow {
  color: #a3abb3;
}


/* =========================================================
   PAY BUTTON
========================================================= */

.pay-button {
  width: 100%;
  min-height: 57px;
  margin-top: 15px;
  padding: 0 17px;
  border: 0;
  border-radius: 17px;
  color: #fff;
  background:
    linear-gradient(135deg,
      #008e67,
      #00a878,
      #00c592);
  box-shadow:
    0 10px 24px rgba(0, 157, 112, .24);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-weight: 900;
  transition: .2s ease;
}

.pay-button:active {
  transform: scale(.98);
}

.pay-button:disabled {
  opacity: .7;
}

.pay-button-left {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
}

.pay-button-amount {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 15px;
}

.secure-footer {
  margin-top: 7px;
  text-align: center;
  color: #9ba3ad;
  font-size: 9px;
}

.secure-footer i {
  color: #00a878;
}


/* =========================================================
   PENDING
========================================================= */

.pending-section {
  padding: 16px;
}

.pending-heading {
  margin-bottom: 12px;
}

.refresh-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #e4e9e8;
  border-radius: 10px;
  background: #fff;
  color: #65717d;
}

.refresh-btn.spinning i {
  display: inline-block;
  animation: spin .7s linear infinite;
}

.pending-loading {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #89939d;
  font-size: 10px;
}

.pending-loading .spinner-border {
  color: #00a878;
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
  font-size: 21px;
}

.empty-pending strong {
  display: block;
  font-size: 12px;
}

.empty-pending span {
  display: block;
  margin-top: 4px;
  color: #98a1ab;
  font-size: 9px;
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.pending-item {
  min-height: 61px;
  padding: 9px;
  border-radius: 14px;
  background: #f8faf9;
  border: 1px solid #edf1ef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.pending-item-left,
.pending-item-right {
  display: flex;
  align-items: center;
}

.pending-item-left {
  gap: 9px;
}

.pending-item-right {
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}

.pending-payment-icon {
  width: 35px;
  height: 35px;
  border-radius: 10px;
  color: #009b70;
  background: #e7f9f2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pending-item-left strong {
  display: block;
  font-size: 12px;
  font-weight: 900;
}

.pending-item-left small,
.pending-item-right small {
  display: block;
  margin-top: 2px;
  color: #929ca6;
  font-size: 8px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 7px;
  border-radius: 20px;
  font-size: 8px;
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
  box-shadow: 0 0 5px #f2a900;
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
   ACTIVITY
========================================================= */

.activity-section {
  padding: 13px;
  background:
    linear-gradient(145deg,
      #ffffff,
      #f9fffc);
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 9px;
}

.activity-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00b67d;
  box-shadow:
    0 0 0 4px rgba(0, 182, 125, .1),
    0 0 8px rgba(0, 182, 125, .5);
  animation: pulse 1.3s infinite;
}

.activity-header strong {
  display: block;
  font-size: 11px;
  font-weight: 900;
}

.activity-header span {
  display: block;
  margin-top: 1px;
  color: #9aa3ad;
  font-size: 8px;
}

.activity-card {
  min-height: 57px;
  padding: 9px;
  border-radius: 13px;
  background: #f5faf8;
  border: 1px solid #e1f0ea;
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
      #008f69,
      #00c594);
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
  color: #008b65;
  font-size: 10px;
  font-weight: 900;
}


/* =========================================================
   MODAL
========================================================= */

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding: 12px;
  background: rgba(12, 20, 28, .72);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.manual-modal {
  width: 100%;
  max-width: 490px;
  max-height: 94vh;
  overflow-y: auto;
  border-radius: 25px 25px 18px 18px;
  background: #fff;
  box-shadow: 0 -10px 60px rgba(0, 0, 0, .28);
}

.modal-header-custom {
  padding: 15px 16px;
  border-bottom: 1px solid #edf0f1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 9px;
}

.modal-upi-icon {
  width: 39px;
  height: 39px;
  border-radius: 12px;
  color: #5664d9;
  background: #eef0ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title-wrap h5 {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
}

.modal-title-wrap small {
  color: #00a878;
  font-size: 10px;
  font-weight: 800;
}

.modal-close {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 10px;
  background: #f1f3f4;
  color: #69737d;
}

.modal-body-custom {
  padding: 16px;
}

.qr-container {
  text-align: center;
}

.qr-label {
  margin-bottom: 7px;
  color: #7f8993;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .4px;
}

.manual-qr,
.qr-placeholder {
  width: 190px;
  height: 190px;
  margin: auto;
  border-radius: 15px;
  border: 1px solid #e5eaea;
  padding: 8px;
  object-fit: contain;
  background: #fff;
  display: block;
}

.qr-placeholder {
  color: #9ba4ad;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
}

.qr-placeholder i {
  font-size: 40px;
}

.qr-container>strong {
  display: block;
  margin-top: 8px;
  font-size: 11px;
}

.upi-copy {
  margin-top: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #68737f;
  font-size: 9px;
}

.upi-copy i {
  margin-left: 3px;
}

.manual-app-row {
  margin: 14px 0;
  padding: 10px 0;
  border-top: 1px dashed #e2e7e6;
  border-bottom: 1px dashed #e2e7e6;
  display: flex;
  justify-content: center;
  gap: 22px;
}

.manual-app-row>div {
  text-align: center;
}

.mini-upi-icon {
  width: 35px;
  height: 35px;
  margin: auto;
  border-radius: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
}

.manual-app-row span {
  display: block;
  margin-top: 4px;
  color: #7c8791;
  font-size: 7px;
  font-weight: 700;
}

.manual-instruction {
  padding: 9px;
  border-radius: 11px;
  color: #53616d;
  background: #f4f8f7;
  display: flex;
  gap: 7px;
  font-size: 9px;
  line-height: 1.4;
}

.manual-instruction i {
  color: #00a878;
}

.form-field {
  margin-top: 13px;
}

.form-field>label {
  display: block;
  margin-bottom: 6px;
  color: #394552;
  font-size: 10px;
  font-weight: 800;
}

.field-with-icon {
  height: 45px;
  padding: 0 11px;
  border: 1px solid #dfe5e4;
  border-radius: 12px;
  background: #fafcfc;
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-with-icon:focus-within {
  border-color: #00a878;
}

.field-with-icon i {
  color: #82908d;
}

.field-with-icon input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 11px;
}

.upload-box {
  min-height: 105px;
  padding: 12px;
  border: 1.5px dashed #cbd9d5;
  border-radius: 13px;
  background: #f9fcfb;
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-box input {
  display: none;
}

.upload-icon {
  width: 35px;
  height: 35px;
  border-radius: 10px;
  color: #009d72;
  background: #e5f8f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
}

.upload-box strong {
  margin-top: 5px;
  font-size: 10px;
}

.upload-box small {
  margin-top: 2px;
  color: #929ca6;
  font-size: 8px;
}

.screenshot-preview {
  max-width: 100%;
  max-height: 150px;
  border-radius: 9px;
  object-fit: contain;
}

.change-image {
  margin-top: 4px;
  color: #008e67;
  font-size: 8px;
  font-weight: 800;
}

.manual-submit-btn {
  width: 100%;
  min-height: 49px;
  margin-top: 15px;
  border: 0;
  border-radius: 14px;
  color: #fff;
  background:
    linear-gradient(135deg,
      #008e67,
      #00b987);
  box-shadow: 0 8px 18px rgba(0, 157, 112, .2);
  font-size: 12px;
  font-weight: 900;
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

.modal-enter-active,
.modal-leave-active {
  transition: .25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .manual-modal,
.modal-leave-to .manual-modal {
  transform: translateY(30px);
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 380px) {

  .amount-card,
  .payment-card,
  .pending-section {
    padding: 14px;
  }

  .amount-input-box {
    height: 50px;
  }

  .amount-input-box input {
    font-size: 20px;
  }

  .upi-apps {
    gap: 8px;
  }

  .upi-app {
    min-width: 38px;
  }

  .upi-icon {
    width: 34px;
    height: 34px;
  }

  .manual-app-row {
    gap: 16px;
  }
}


/* =========================================================
   TABLET / DESKTOP
========================================================= */

@media (min-width: 768px) {

  .app-header {
    border-radius: 0;
  }

  .modal-backdrop-custom {
    align-items: center;
  }

  .manual-modal {
    border-radius: 25px;
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
