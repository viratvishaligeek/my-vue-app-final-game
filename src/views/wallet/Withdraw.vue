<template>
  <div class="content-area pb-5 mb-5 position-relative busgo-theme-bg">
    <div class="container-fluid px-3 px-md-4 py-3">
      <div class="row mb-4">
        <div class="col-12 col-xl-8 mx-auto">
          <div class="d-flex align-items-center gap-3">
            <router-link to="/wallet"
              class="btn btn-white rounded-circle shadow-sm border p-2 d-flex align-items-center justify-content-center"
              style="width: 42px; height: 42px">
              <i class="bi bi-arrow-left fs-5 text-dark"></i>
            </router-link>
            <div>
              <h4 class="fw-black text-dark mb-0">Withdrawal Money</h4>
              <small class="text-muted">Transfer wallet funds to Bank or UPI ID</small>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-xl-8 mx-auto">
          <div class="card border-0 shadow-sm rounded-5 p-4 bg-dark text-white mb-4 position-relative overflow-hidden">
            <div class="d-flex align-items-center justify-content-between position-relative z-1">
              <div>
                <span class="fs-8 text-white-50 text-uppercase tracking-wider fw-bold">Available to Withdraw</span>
                <h2 class="fw-black text-white mb-0 font-monospace">
                  ₹{{ formatCurrency(availableBalance) }}
                </h2>
              </div>
              <div class="wallet-badge bg-danger text-white rounded-circle">
                <i class="bi bi-bank fs-4"></i>
              </div>
            </div>
          </div>

          <div v-if="apiMessage.text" :class="[
            'alert alert-dismissible fade show rounded-4 mb-4',
            apiMessage.type === 'error' ? 'alert-danger' : 'alert-success',
          ]" role="alert">
            {{ apiMessage.text }}
            <button type="button" class="btn-close" @click="apiMessage.text = ''"></button>
          </div>

          <form @submit.prevent="handleWithdraw" enctype="multipart/form-data" novalidate>
            <div class="card border-0 shadow-sm rounded-5 p-4 mb-4">
              <label class="form-label fs-8 text-uppercase tracking-wider text-muted fw-bold mb-3">Withdrawal
                Destination</label>

              <div class="row g-3 mb-4">
                <div class="col-6">
                  <div @click="transferMode = 'bank'" :class="[
                    'p-3',
                    'rounded-4',
                    'border',
                    'text-center',
                    'cursor-pointer',
                    transferMode === 'bank'
                      ? 'border-danger bg-danger-soft fw-bold text-danger'
                      : 'bg-light text-muted',
                  ]">
                    <i class="bi bi-building fs-4 d-block mb-1"></i>
                    <span>Bank Account</span>
                  </div>
                </div>
                <div class="col-6">
                  <div @click="transferMode = 'upi'" :class="[
                    'p-3',
                    'rounded-4',
                    'border',
                    'text-center',
                    'cursor-pointer',
                    transferMode === 'upi'
                      ? 'border-danger bg-danger-soft fw-bold text-danger'
                      : 'bg-light text-muted',
                  ]">
                    <i class="bi bi-qr-code fs-4 d-block mb-1"></i>
                    <span>UPI ID / QR Code</span>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fs-8 text-uppercase tracking-wider text-muted fw-bold">Withdrawal
                  Amount</label>
                <div class="input-group input-group-lg">
                  <span class="input-group-text bg-light border-0 fw-black text-dark fs-3">₹</span>
                  <input type="number" class="form-control bg-light border-0 fw-black text-dark fs-2 font-monospace"
                    :class="{ 'is-invalid': errors.amount }" v-model.number="form.amount" placeholder="Enter amount"
                    @input="errors.amount = ''" />
                </div>
                <div v-if="errors.amount" class="text-danger fs-8 fw-semibold mt-1">
                  {{ errors.amount }}
                </div>
              </div>

              <div v-if="transferMode === 'bank'" class="mt-4 pt-3 border-top">
                <div class="mb-3">
                  <label class="form-label fs-8 text-muted fw-bold">Account Holder Name</label>
                  <input type="text" v-model="form.accountName" class="form-control rounded-3"
                    placeholder="Name as per bank account" />
                </div>
                <div class="mb-3">
                  <label class="form-label fs-8 text-muted fw-bold">Account Number</label>
                  <input type="text" v-model="form.accountNumber" class="form-control rounded-3 font-monospace"
                    placeholder="e.g. 98201029102" />
                </div>
                <div class="mb-3">
                  <label class="form-label fs-8 text-muted fw-bold">IFSC Code</label>
                  <input type="text" v-model="form.ifsc" class="form-control rounded-3 text-uppercase font-monospace"
                    placeholder="e.g. SBIN0001234" />
                </div>
              </div>

              <div v-else class="mt-4 pt-3 border-top">
                <div class="mb-3">
                  <label class="form-label fs-8 text-muted fw-bold">UPI ID</label>
                  <input type="text" v-model="form.upiId" class="form-control rounded-3"
                    placeholder="username@upi or mobile@paytm" />
                </div>

                <div class="mb-3">
                  <label class="form-label fs-8 text-muted fw-bold d-flex justify-content-between">
                    <span>Upload UPI QR Code (Optional)</span>
                    <span class="text-secondary fw-normal">PNG, JPG, WEBP</span>
                  </label>

                  <div class="qr-upload-box p-3 border border-dashed rounded-4 text-center position-relative bg-light">
                    <div v-if="qrPreviewUrl" class="position-relative d-inline-block">
                      <img :src="qrPreviewUrl" alt="QR Preview" class="img-thumbnail rounded-3 shadow-sm mb-2"
                        style="max-height: 160px" />
                      <button type="button" @click="removeQrCode"
                        class="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 translate-middle p-1 shadow"
                        title="Remove QR">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>

                    <div v-else class="py-2">
                      <i class="bi bi-cloud-arrow-up display-6 text-danger mb-2 d-block"></i>
                      <span class="fw-bold fs-8 text-dark d-block">Click to upload or Drag & Drop QR Image</span>
                      <small class="text-muted fs-8">Admin will scan this QR directly to transfer funds</small>

                      <input type="file" accept="image/png, image/jpeg, image/webp" class="qr-file-input"
                        @change="handleQrUpload" />
                    </div>
                  </div>
                  <div v-if="errors.qrImage" class="text-danger fs-8 mt-1">
                    {{ errors.qrImage }}
                  </div>
                </div>
              </div>
            </div>

            <div class="d-grid gap-2 mb-3">
              <button type="submit"
                class="btn btn-dark btn-lg rounded-pill fw-black py-3 d-flex align-items-center justify-content-center gap-2"
                :disabled="isLoading">
                <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-arrow-up-right-circle-fill"></i>
                <span>{{ isLoading ? 'Processing Transfer...' : 'Confirm Withdrawal' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/utils/auth'
import api from '@/plugins/axios'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)

const transferMode = ref('bank')
const qrPreviewUrl = ref(null)

const balance = ref(
  Number(authStore.user?.balance || 0)
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

const availableBalance = computed(() => {
  return Number(balance.value || 0)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
}

const loadBalance = async () => {
  try {
    const response = await api.get('/wallet')

    if (response.data?.success) {
      balance.value =
        Number(response.data.data.balance || 0)
    }
  } catch (error) {
    console.error(error)
  }
}

const handleQrUpload = (event) => {
  const file = event.target.files?.[0]

  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    errors.qrImage =
      'File size should not exceed 2MB.'
    return
  }

  errors.qrImage = ''
  form.qrImage = file

  if (qrPreviewUrl.value) {
    URL.revokeObjectURL(qrPreviewUrl.value)
  }

  qrPreviewUrl.value =
    URL.createObjectURL(file)
}

const removeQrCode = () => {
  form.qrImage = null

  if (qrPreviewUrl.value) {
    URL.revokeObjectURL(qrPreviewUrl.value)
  }

  qrPreviewUrl.value = null
}

const handleWithdraw = async () => {
  apiMessage.text = ''

  errors.amount = ''

  if (!form.amount || form.amount <= 0) {
    errors.amount =
      'Enter a valid withdrawal amount.'
    return
  }

  if (form.amount > availableBalance.value) {
    errors.amount =
      'Amount exceeds available balance.'
    return
  }

  if (
    transferMode.value === 'bank' &&
    (
      !form.accountName ||
      !form.accountNumber ||
      !form.ifsc
    )
  ) {
    apiMessage.type = 'error'
    apiMessage.text =
      'Please enter complete bank details.'
    return
  }

  if (
    transferMode.value === 'upi' &&
    !form.upiId
  ) {
    apiMessage.type = 'error'
    apiMessage.text =
      'Please enter your UPI ID.'
    return
  }

  isLoading.value = true

  try {
    const formData = new FormData()

    formData.append(
      'amount',
      form.amount
    )

    formData.append(
      'mode',
      transferMode.value
    )

    if (transferMode.value === 'bank') {
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

    if (transferMode.value === 'upi') {
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

    const response = await api.post(
      '/wallet/withdraw',
      formData
    )

    if (response.data?.success) {
      apiMessage.type = 'success'
      apiMessage.text =
        response.data.message ||
        'Withdrawal request submitted successfully.'

      setTimeout(() => {
        router.push('/wallet')
      }, 1500)
    }
  } catch (error) {
    apiMessage.type = 'error'

    apiMessage.text =
      error.response?.data?.message ||
      'Withdrawal failed. Try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadBalance()
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

.cursor-pointer {
  cursor: pointer;
}

.wallet-badge {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-danger-soft {
  background-color: rgba(211, 47, 47, 0.1);
}

/* QR Code Upload Drop Area */
.border-dashed {
  border-style: dashed !important;
  border-width: 2px !important;
  border-color: #d6d8db !important;
}

.qr-upload-box {
  transition: all 0.2s ease;
}

.qr-upload-box:hover {
  border-color: #d32f2f !important;
  background-color: #fff9f9 !important;
}

.qr-file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
</style>
