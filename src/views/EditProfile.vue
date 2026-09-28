<template>
  <div class="container-fluid py-4">
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-header bg-transparent border-0 pt-4 px-4 d-flex align-items-center justify-content-between">
            <h5 class="fw-bold mb-0 text-primary">
              <i class="bi bi-person-gear me-2"></i>Edit Profile
            </h5>
            <span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
              Wallet Balance: ₹ {{ authStore.walletBalance }}
            </span>
          </div>
          <div class="card-body p-4">
            <div v-if="statusMessage.text"
              :class="['alert alert-dismissible fade show', statusMessage.type === 'success' ? 'alert-success' : 'alert-danger']"
              role="alert">
              {{ statusMessage.text }}
              <button type="button" class="btn-close" @click="statusMessage.text = ''"></button>
            </div>
            <form @submit.prevent="handleUpdateProfile">
              <div class="row g-3">
                <div class="col-12">
                  <h6 class="text-uppercase text-muted small fw-bold mb-3">Basic Information</h6>
                </div>
                <div class="col-6">
                  <label class="form-label fw-medium">Full Name *</label>
                  <input type="text" v-model="profileForm.name" class="form-control"
                    :class="{ 'is-invalid': errors.name }" placeholder="Enter your full name" />
                  <div class="invalid-feedback" v-if="errors.name">{{ errors.name }}</div>
                </div>
                <div class="col-6">
                  <label class="form-label fw-medium">Phone Number (Read-only)</label>
                  <input type="text" :value="authStore.user?.phone" class="form-control bg-light" disabled />
                </div>

                <div class="col-6">
                  <label class="form-label fw-medium">Gender</label>
                  <select v-model="profileForm.gender" class="form-select">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div class="col-6">
                  <label class="form-label fw-medium">City</label>
                  <input type="text" v-model="profileForm.city" class="form-control" placeholder="City" />
                </div>

                <div class="col-12">
                  <label class="form-label fw-medium">Address</label>
                  <textarea v-model="profileForm.address" class="form-control" rows="2"
                    placeholder="Full address"></textarea>
                </div>

                <div class="col-12 mt-4">
                  <h6 class="text-uppercase text-muted small fw-bold mb-3">Bank & UPI Details (For Withdrawals)</h6>
                </div>

                <div class="col-6">
                  <label class="form-label fw-medium">Bank Name</label>
                  <input type="text" v-model="profileForm.bank" class="form-control" placeholder="e.g. HDFC Bank" />
                </div>

                <div class="col-6">
                  <label class="form-label fw-medium">Account Number</label>
                  <input type="text" v-model="profileForm.acc" class="form-control" placeholder="Account Number" />
                </div>

                <div class="col-6">
                  <label class="form-label fw-medium">IFSC Code</label>
                  <input type="text" v-model="profileForm.ifsc" class="form-control" placeholder="IFSC Code" />
                </div>

                <div class="col-6">
                  <label class="form-label fw-medium">Account Holder Name</label>
                  <input type="text" v-model="profileForm.holdername" class="form-control"
                    placeholder="Account Holder Name" />
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-medium">PhonePe Number</label>
                  <input type="text" v-model="profileForm.phonepe" class="form-control" placeholder="PhonePe" />
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-medium">Google Pay Number</label>
                  <input type="text" v-model="profileForm.gpay" class="form-control" placeholder="GPay" />
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-medium">Paytm Number</label>
                  <input type="text" v-model="profileForm.paytm" class="form-control" placeholder="Paytm" />
                </div>

                <div class="col-12 mt-4 text-end">
                  <button type="submit" class="btn btn-primary px-4 py-2 rounded-3" :disabled="isProfileLoading">
                    <span v-if="isProfileLoading" class="spinner-border spinner-border-sm me-2"></span>
                    Save Changes
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Password Change Card -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-header bg-transparent border-0 pt-4 px-4">
            <h5 class="fw-bold mb-0 text-primary">
              <i class="bi bi-shield-lock me-2"></i>Security
            </h5>
          </div>

          <div class="card-body p-4">
            <form @submit.prevent="handleChangePassword">
              <div class="mb-3">
                <label class="form-label fw-medium">Current Password</label>
                <input type="password" v-model="passwordForm.current_password" class="form-control"
                  :class="{ 'is-invalid': passErrors.current_password }" />
                <div class="invalid-feedback" v-if="passErrors.current_password">{{ passErrors.current_password }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">New Password</label>
                <input type="password" v-model="passwordForm.new_password" class="form-control"
                  :class="{ 'is-invalid': passErrors.new_password }" />
                <div class="invalid-feedback" v-if="passErrors.new_password">{{ passErrors.new_password }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Confirm New Password</label>
                <input type="password" v-model="passwordForm.new_password_confirmation" class="form-control" />
              </div>

              <button type="submit" class="btn btn-dark w-100 py-2 rounded-3" :disabled="isPasswordLoading">
                <span v-if="isPasswordLoading" class="spinner-border spinner-border-sm me-2"></span>
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/utils/auth'
import api from '@/plugins/axios'

const authStore = useAuthStore()

const isProfileLoading = ref(false)
const isPasswordLoading = ref(false)

const statusMessage = reactive({ type: '', text: '' })
const errors = reactive({})
const passErrors = reactive({})

const profileForm = reactive({
  name: '',
  gender: '',
  city: '',
  address: '',
  bank: '',
  acc: '',
  ifsc: '',
  holdername: '',
  phonepe: '',
  gpay: '',
  paytm: '',
})

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
})

// Bind profile fields with state
const populateUserData = () => {
  const user = authStore.user
  if (user) {
    Object.keys(profileForm).forEach((key) => {
      profileForm[key] = user[key] || ''
    })
  }
}

onMounted(() => {
  populateUserData()
})

// Profile Submission
const handleUpdateProfile = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  statusMessage.text = ''
  isProfileLoading.value = true

  try {
    const response = await api.put('/update-profile', profileForm)
    if (response.data?.success) {
      authStore.updateUserData(response.data.data.user)
      statusMessage.type = 'success'
      statusMessage.text = response.data.message || 'Profile updated successfully.'
    }
  } catch (error) {
    if (error.response?.status === 422 && error.response.data.errors) {
      const errs = error.response.data.errors
      Object.keys(errs).forEach((key) => {
        errors[key] = errs[key][0]
      })
    } else {
      statusMessage.type = 'danger'
      statusMessage.text = error.response?.data?.message || 'Failed to update profile.'
    }
  } finally {
    isProfileLoading.value = false
  }
}

// Password Submission
const handleChangePassword = async () => {
  Object.keys(passErrors).forEach((k) => (passErrors[k] = ''))
  statusMessage.text = ''
  isPasswordLoading.value = true

  try {
    const response = await api.put('/update-password', passwordForm)
    if (response.data?.success) {
      statusMessage.type = 'success'
      statusMessage.text = response.data.message
      passwordForm.current_password = ''
      passwordForm.new_password = ''
      passwordForm.new_password_confirmation = ''
    }
  } catch (error) {
    if (error.response?.status === 422 && error.response.data.errors) {
      const errs = error.response.data.errors
      Object.keys(errs).forEach((key) => {
        passErrors[key] = errs[key][0]
      })
    } else {
      statusMessage.type = 'danger'
      statusMessage.text = error.response?.data?.message || 'Password update failed.'
    }
  } finally {
    isPasswordLoading.value = false
  }
}
</script>
