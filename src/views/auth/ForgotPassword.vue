<template>
  <div class="overlay" id="overlay"></div>

  <div class="auth-container">
    <div class="text-center mb-4">
      <div class="app-logo mb-3">
        <i class="bi bi-shield-lock display-4 text-primary"></i>
      </div>
      <h4 class="fw-bold text-primary-color">Reset Password</h4>
      <p class="text-muted small">
        {{
          step === 1
            ? 'Enter your phone number to receive an OTP'
            : 'Enter OTP and set your new password'
        }}
      </p>
    </div>

    <!-- Alert Messages -->
    <div
      v-if="apiMessage.text"
      :class="[
        'alert alert-dismissible fade show',
        apiMessage.type === 'error' ? 'alert-danger' : 'alert-success',
      ]"
      role="alert"
    >
      {{ apiMessage.text }}
      <button
        type="button"
        class="btn-close"
        @click="apiMessage.text = ''"
        aria-label="Close"
      ></button>
    </div>

    <!-- STEP 1: Send OTP -->
    <form v-if="step === 1" @submit.prevent="handleSendOtp" novalidate>
      <div class="mb-3">
        <label for="phone" class="form-label">Phone Number</label>
        <div class="input-group">
          <span class="input-group-text bg-transparent border-end-0">
            <i class="bi bi-telephone text-muted"></i>
          </span>
          <input
            type="tel"
            class="form-control border-start-0"
            :class="{ 'is-invalid': errors.phone }"
            id="phone"
            v-model.trim="form.phone"
            placeholder="Enter registered phone number"
            @input="clearFieldError('phone')"
          />
        </div>
        <div v-if="errors.phone" class="invalid-feedback d-block small mt-1">
          {{ errors.phone }}
        </div>
      </div>

      <div class="d-grid gap-2 mb-4">
        <button type="submit" class="btn btn-app btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          <span>{{ isLoading ? 'Sending OTP...' : 'Send OTP' }}</span>
        </button>
      </div>
    </form>

    <!-- STEP 2: Verify OTP & Reset Password -->
    <form v-else @submit.prevent="handleResetPassword" novalidate>
      <!-- OTP Input -->
      <div class="mb-3">
        <label for="otp" class="form-label">Enter 6-Digit OTP</label>
        <div class="input-group">
          <span class="input-group-text bg-transparent border-end-0">
            <i class="bi bi-key text-muted"></i>
          </span>
          <input
            type="text"
            maxLength="6"
            class="form-control border-start-0 text-center fw-bold fs-5"
            :class="{ 'is-invalid': errors.otp }"
            id="otp"
            v-model.trim="form.otp"
            placeholder="123456"
            @input="clearFieldError('otp')"
          />
        </div>
        <div v-if="errors.otp" class="invalid-feedback d-block small mt-1">
          {{ errors.otp }}
        </div>
      </div>

      <!-- New Password -->
      <div class="mb-3">
        <label for="password" class="form-label">New Password</label>
        <div class="input-group">
          <span class="input-group-text bg-transparent border-end-0">
            <i class="bi bi-lock text-muted"></i>
          </span>
          <input
            :type="showPassword ? 'text' : 'password'"
            class="form-control border-start-0 border-end-0"
            :class="{ 'is-invalid': errors.password }"
            id="password"
            v-model="form.password"
            placeholder="Enter new password"
            @input="clearFieldError('password')"
          />
          <button
            type="button"
            class="input-group-text bg-transparent border-start-0"
            @click="showPassword = !showPassword"
          >
            <i :class="['bi', showPassword ? 'bi-eye-slash' : 'bi-eye', 'text-muted']"></i>
          </button>
        </div>
        <div v-if="errors.password" class="invalid-feedback d-block small mt-1">
          {{ errors.password }}
        </div>
      </div>

      <!-- Confirm Password -->
      <div class="mb-3">
        <label for="password_confirmation" class="form-label">Confirm Password</label>
        <div class="input-group">
          <span class="input-group-text bg-transparent border-end-0">
            <i class="bi bi-lock-fill text-muted"></i>
          </span>
          <input
            :type="showPassword ? 'text' : 'password'"
            class="form-control border-start-0"
            :class="{ 'is-invalid': errors.passwordConfirmation }"
            id="password_confirmation"
            v-model="form.passwordConfirmation"
            placeholder="Confirm new password"
            @input="clearFieldError('passwordConfirmation')"
          />
        </div>
        <div v-if="errors.passwordConfirmation" class="invalid-feedback d-block small mt-1">
          {{ errors.passwordConfirmation }}
        </div>
      </div>

      <div class="d-grid gap-2 mb-3">
        <button type="submit" class="btn btn-app btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          <span>{{ isLoading ? 'Resetting Password...' : 'Reset Password' }}</span>
        </button>
      </div>

      <div class="text-center mb-3">
        <button type="button" class="btn btn-link text-muted p-0 small" @click="step = 1">
          Resend OTP / Change Phone
        </button>
      </div>
    </form>

    <div class="text-center">
      <router-link to="/" class="text-primary-color text-decoration-none fw-bold small">
        <i class="bi bi-arrow-left me-1"></i> Back to Login
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/plugins/axios'

const router = useRouter()

const step = ref(1)
const showPassword = ref(false)
const isLoading = ref(false)

const form = reactive({
  phone: '',
  otp: '',
  password: '',
  passwordConfirmation: '',
})

const errors = reactive({
  phone: '',
  otp: '',
  password: '',
  passwordConfirmation: '',
})

const apiMessage = reactive({
  text: '',
  type: 'error',
})

const clearFieldError = (field) => {
  errors[field] = ''
  apiMessage.text = ''
}

// Send OTP Handler
const handleSendOtp = async () => {
  apiMessage.text = ''
  const phoneRegex = /^[0-9+\-\s]{7,15}$/

  if (!form.phone) {
    errors.phone = 'Phone number is required.'
    return
  } else if (!phoneRegex.test(form.phone)) {
    errors.phone = 'Please enter a valid phone number.'
    return
  }

  isLoading.value = true

  try {
    const response = await api.post('/forgot/send-otp', {
      phone: form.phone,
    })

    if (response.data?.success) {
      step.value = 2
      apiMessage.type = 'success'
      apiMessage.text = response.data.message || 'OTP sent successfully.'
    }
  } catch (error) {
    apiMessage.type = 'error'
    if (error.response) {
      const { status, data } = error.response
      if (status === 422 && data.errors?.phone) {
        errors.phone = data.errors.phone[0]
      } else {
        apiMessage.text = data.message || 'Failed to send OTP.'
      }
    } else {
      apiMessage.text = 'Network error. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

// Reset Password Handler
const handleResetPassword = async () => {
  apiMessage.text = ''
  let isValid = true

  if (!form.otp || form.otp.length < 6) {
    errors.otp = 'Please enter valid 6-digit OTP.'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'New password is required.'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
    isValid = false
  }

  if (form.password !== form.passwordConfirmation) {
    errors.passwordConfirmation = 'Passwords do not match.'
    isValid = false
  }

  if (!isValid) return

  isLoading.value = true

  try {
    const response = await api.post('/forgot/reset', {
      phone: form.phone,
      otp: form.otp,
      password: form.password,
      password_confirmation: form.passwordConfirmation,
    })

    if (response.data?.success) {
      alert('Password reset successfully! Redirecting to login.')
      router.push('/')
    }
  } catch (error) {
    apiMessage.type = 'error'
    if (error.response) {
      const { status, data } = error.response
      if (status === 422 && data.errors) {
        errors.otp = data.errors.otp ? data.errors.otp[0] : ''
        errors.password = data.errors.password ? data.errors.password[0] : ''
        apiMessage.text = data.message || 'Validation error.'
      } else {
        apiMessage.text = data.message || 'Password reset failed.'
      }
    } else {
      apiMessage.text = 'Network error. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
