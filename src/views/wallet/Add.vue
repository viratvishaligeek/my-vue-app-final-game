<template>
  <div class="content-area pb-5 mb-5 position-relative busgo-theme-bg">
    <div class="container-fluid px-3 px-md-4 py-3">

      <div class="row mb-4">
        <div class="col-12 col-xl-8 mx-auto">
          <div class="d-flex align-items-center gap-3">
            <router-link to="/wallet" class="btn btn-white rounded-circle shadow-sm border p-2"
              style="width:42px;height:42px">
              <i class="bi bi-arrow-left fs-5"></i>
            </router-link>

            <div>
              <h4 class="fw-black mb-0">Add Money to Wallet</h4>
              <small class="text-muted">
                Secure wallet top-up
              </small>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-xl-8 mx-auto">

          <div v-if="apiMessage.text" :class="[
            'alert rounded-4',
            apiMessage.type === 'error'
              ? 'alert-danger'
              : 'alert-success'
          ]">
            {{ apiMessage.text }}
          </div>

          <!-- Amount -->
          <div class="card border-0 shadow-sm rounded-5 p-4 mb-4">
            <label class="form-label fw-bold">
              Enter Amount
            </label>

            <div class="input-group input-group-lg">
              <span class="input-group-text bg-light border-0 fs-3">
                ₹
              </span>

              <input v-model.number="form.amount" type="number" min="1"
                class="form-control bg-light border-0 fs-2 fw-bold" placeholder="Enter amount" />
            </div>

            <div class="d-flex gap-2 flex-wrap mt-3">
              <button v-for="amount in quickAmounts" :key="amount" type="button"
                class="btn btn-outline-secondary rounded-pill"
                :class="{ 'btn-danger text-white': form.amount === amount }" @click="form.amount = amount">
                ₹{{ amount }}
              </button>
            </div>
          </div>

          <!-- Payment methods -->
          <div class="card border-0 shadow-sm rounded-5 p-4 mb-4">

            <h6 class="fw-bold mb-3">
              Select Payment Method
            </h6>

            <div class="payment-option p-3 rounded-4 border mb-3"
              :class="{ 'active-option': form.paymentMethod === 'manual_upi' }"
              @click="form.paymentMethod = 'manual_upi'">
              <div class="d-flex align-items-center gap-3">
                <input v-model="form.paymentMethod" type="radio" value="manual_upi" class="form-check-input" />

                <div class="method-icon bg-primary-soft text-primary rounded-3 p-2">
                  <i class="bi bi-qr-code-scan fs-4"></i>
                </div>

                <div>
                  <h6 class="fw-bold mb-0">
                    Manual UPI
                  </h6>
                  <small class="text-muted">
                    Pay using QR and submit screenshot + UTR
                  </small>
                </div>
              </div>
            </div>

            <div v-if="gatewayEnabled" class="payment-option p-3 rounded-4 border"
              :class="{ 'active-option': form.paymentMethod === 'gateway' }" @click="form.paymentMethod = 'gateway'">
              <div class="d-flex align-items-center gap-3">
                <input v-model="form.paymentMethod" type="radio" value="gateway" class="form-check-input" />

                <div class="method-icon bg-success-subtle text-success rounded-3 p-2">
                  <i class="bi bi-lightning-charge-fill fs-4"></i>
                </div>

                <div>
                  <h6 class="fw-bold mb-0">
                    UPI Express
                  </h6>
                  <small class="text-muted">
                    Automated payment gateway
                  </small>
                </div>
              </div>
            </div>
          </div>

          <button class="btn btn-danger btn-lg rounded-pill w-100 py-3 fw-bold" :disabled="isLoading"
            @click="handleAddMoney">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>

            {{
              isLoading
                ? 'Processing...'
                : `Proceed to Pay ₹${form.amount || 0}`
            }}
          </button>

        </div>
      </div>
    </div>

    <!-- Manual UPI Modal -->
    <div v-if="showManualModal" class="modal-backdrop-custom">
      <div class="manual-modal">

        <div class="modal-header-custom">
          <div>
            <h5 class="fw-bold mb-0">
              Pay via UPI
            </h5>

            <small class="text-muted">
              Amount: ₹{{ formatCurrency(form.amount) }}
            </small>
          </div>

          <button class="btn-close" @click="closeManualModal"></button>
        </div>

        <div class="modal-body-custom">

          <div class="text-center mb-3">
            <img v-if="paymentInfo.qr_url" :src="paymentInfo.qr_url" class="manual-qr" alt="UPI QR Code" />

            <div class="fw-bold mt-2">
              {{ paymentInfo.name }}
            </div>

            <div class="text-muted small">
              {{ paymentInfo.upi_id }}
            </div>
          </div>

          <div class="alert alert-info rounded-4 small">
            Scan this QR using Google Pay, PhonePe, Paytm or any UPI app.
            After payment, upload your screenshot and enter UTR.
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">
              UTR / Transaction Number
            </label>

            <input v-model="manualForm.utr" type="text" class="form-control" placeholder="Enter UTR / Transaction ID" />
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">
              Payment Screenshot
            </label>

            <input type="file" accept="image/png,image/jpeg,image/webp" class="form-control"
              @change="handleScreenshot" />

            <small class="text-muted">
              JPG, PNG or WEBP — maximum 5MB
            </small>
          </div>

          <div v-if="screenshotPreview" class="text-center mb-3">
            <img :src="screenshotPreview" class="screenshot-preview" alt="Payment screenshot" />
          </div>

          <button class="btn btn-danger w-100 rounded-pill py-3 fw-bold" :disabled="manualLoading"
            @click="submitManualRequest">
            <span v-if="manualLoading" class="spinner-border spinner-border-sm me-2"></span>

            {{ manualLoading ? 'Submitting...' : 'Submit Payment' }}
          </button>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/plugins/axios'

const router = useRouter()

const isLoading = ref(false)
const manualLoading = ref(false)

const gatewayEnabled = ref(false)
const showManualModal = ref(false)

const quickAmounts = [100, 500, 1000, 2000]

const form = reactive({
  amount: 500,
  paymentMethod: 'manual_upi',
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

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
}

const loadPaymentMethods = async () => {
  try {
    const response = await api.get('/wallet/payment-methods')

    if (response.data?.success) {
      const data = response.data.data

      paymentInfo.upi_id = data.manual_upi?.upi_id || ''
      paymentInfo.name = data.manual_upi?.name || ''
      paymentInfo.qr_url = data.manual_upi?.qr_url || ''

      gatewayEnabled.value = Boolean(data.gateway?.enabled)
    }
  } catch (error) {
    console.error(error)
  }
}

const handleAddMoney = async () => {
  apiMessage.text = ''

  if (!form.amount || form.amount < 1) {
    apiMessage.type = 'error'
    apiMessage.text = 'Please enter a valid amount.'
    return
  }

  if (form.paymentMethod === 'manual_upi') {
    showManualModal.value = true
    return
  }

  await createGatewayOrder()
}

const createGatewayOrder = async () => {
  isLoading.value = true

  try {
    const response = await api.post(
      '/wallet/gateway/create-order',
      {
        amount: form.amount,
      }
    )

    if (response.data?.success) {
      const paymentUrl =
        response.data?.data?.payment_url

      if (!paymentUrl) {
        throw new Error('Payment URL missing.')
      }

      window.location.href = paymentUrl
    }
  } catch (error) {
    apiMessage.type = 'error'
    apiMessage.text =
      error.response?.data?.message ||
      'Unable to start payment.'
  } finally {
    isLoading.value = false
  }
}

const handleScreenshot = (event) => {
  const file = event.target.files?.[0]

  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    apiMessage.type = 'error'
    apiMessage.text = 'Screenshot must be less than 5MB.'
    return
  }

  manualForm.screenshot = file

  if (screenshotPreview.value) {
    URL.revokeObjectURL(screenshotPreview.value)
  }

  screenshotPreview.value =
    URL.createObjectURL(file)
}

const submitManualRequest = async () => {
  apiMessage.text = ''

  if (!manualForm.utr.trim()) {
    apiMessage.type = 'error'
    apiMessage.text = 'Please enter UTR / transaction number.'
    return
  }

  if (!manualForm.screenshot) {
    apiMessage.type = 'error'
    apiMessage.text = 'Please upload payment screenshot.'
    return
  }

  manualLoading.value = true

  try {
    const formData = new FormData()

    formData.append('amount', form.amount)
    formData.append('utr', manualForm.utr.trim())
    formData.append(
      'screenshot',
      manualForm.screenshot
    )

    const response = await api.post(
      '/wallet/add-money-request',
      formData
    )

    if (response.data?.success) {
      showManualModal.value = false

      apiMessage.type = 'success'
      apiMessage.text =
        response.data.message ||
        'Payment submitted successfully.'

      resetManualForm()

      setTimeout(() => {
        router.push('/wallet')
      }, 1500)
    }
  } catch (error) {
    apiMessage.type = 'error'
    apiMessage.text =
      error.response?.data?.message ||
      'Unable to submit payment request.'
  } finally {
    manualLoading.value = false
  }
}

const resetManualForm = () => {
  manualForm.utr = ''
  manualForm.screenshot = null

  if (screenshotPreview.value) {
    URL.revokeObjectURL(screenshotPreview.value)
  }

  screenshotPreview.value = null
}

const closeManualModal = () => {
  if (manualLoading.value) return

  showManualModal.value = false
}

onMounted(() => {
  loadPaymentMethods()
})

onBeforeUnmount(() => {
  if (screenshotPreview.value) {
    URL.revokeObjectURL(screenshotPreview.value)
  }
})
</script>

<style scoped>
.busgo-theme-bg {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.fw-black {
  font-weight: 900;
}

.fs-8 {
  font-size: 0.75rem;
}

.shadow-danger {
  box-shadow: 0 8px 20px rgba(211, 47, 47, 0.3);
}

.payment-option {
  transition: all 0.2s ease;
  background-color: #ffffff;
}

.payment-option:hover {
  background-color: #fff9f9;
}

.payment-option.active-option {
  border-color: #d32f2f !important;
  background-color: #fff5f5;
}

.busgo-radio:checked {
  background-color: #d32f2f;
  border-color: #d32f2f;
}

.method-icon {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-primary-soft {
  background-color: rgba(13, 110, 253, 0.1);
}

.bg-danger-soft {
  background-color: rgba(211, 47, 47, 0.1);
}

.bg-warning-soft {
  background-color: rgba(255, 193, 7, 0.15);
}

/* ------------------------- */
.payment-option {
  cursor: pointer;
  transition: 0.2s ease;
}

.payment-option:hover,
.active-option {
  border-color: #dc3545 !important;
  background: #fff5f5;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
}

.manual-modal {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.modal-header-custom {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-body-custom {
  padding: 20px;
}

.manual-qr {
  width: 240px;
  height: 240px;
  object-fit: contain;
  border-radius: 12px;
  border: 1px solid #eee;
  padding: 10px;
  background: white;
}

.screenshot-preview {
  max-width: 100%;
  max-height: 220px;
  border-radius: 12px;
  border: 1px solid #ddd;
}
</style>
