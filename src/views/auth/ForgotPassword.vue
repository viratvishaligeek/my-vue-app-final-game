<template>
  <div>
    <!-- Overlay -->
    <div class="overlay" id="overlay"></div>

    <!-- Auth Container -->
    <div class="auth-container">
      <!-- Back Button -->
      <div class="mb-4">
        <router-link to="/" class="btn back-btn p-0 border-0">
          <i class="bi bi-arrow-left fs-4 text-dark"></i>
        </router-link>
      </div>

      <!-- Logo and Header -->
      <div class="text-center mb-4">
        <div class="app-logo mb-3">
          <i class="bi bi-shield-lock display-4 text-primary"></i>
        </div>
        <h4 class="fw-bold text-primary-color">Forgot Password</h4>
        <p class="text-muted">Enter your email to reset your password</p>
      </div>

      <!-- API Error Alert -->
      <div v-if="errors.api" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ errors.api }}
        <button
          type="button"
          class="btn-close"
          @click="errors.api = ''"
          aria-label="Close"
        ></button>
      </div>

      <!-- Resend Success Alert -->
      <div
        v-if="resendSuccessMessage"
        class="alert alert-success alert-dismissible fade show"
        role="alert"
      >
        {{ resendSuccessMessage }}
        <button
          type="button"
          class="btn-close"
          @click="resendSuccessMessage = ''"
          aria-label="Close"
        ></button>
      </div>

      <!-- Auth Form Container -->
      <div class="auth-form">
        <!-- FORM STATE (When reset link is not sent yet) -->
        <form v-if="!isSubmitted" @submit.prevent="handleResetPassword" novalidate>
          <div class="mb-4">
            <label for="email" class="form-label">Email</label>
            <div class="input-group">
              <span class="input-group-text bg-transparent border-end-0">
                <i class="bi bi-envelope text-muted"></i>
              </span>
              <input
                type="email"
                class="form-control border-start-0"
                :class="{ 'is-invalid': errors.email }"
                id="email"
                v-model.trim="email"
                placeholder="Enter your email"
                @input="validateEmail"
              />
            </div>
            <div v-if="errors.email" class="text-danger small mt-1">
              {{ errors.email }}
            </div>
          </div>

          <div class="d-grid gap-2 mb-4">
            <button type="submit" class="btn btn-app btn-primary" :disabled="isLoading">
              <span
                v-if="isLoading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              <span>{{ isLoading ? 'Sending...' : 'Reset Password' }}</span>
            </button>
          </div>
        </form>

        <!-- RESET INSTRUCTIONS STATE (Shown after successful email submit) -->
        <div v-else class="reset-instructions">
          <div class="text-center mb-4">
            <div class="success-icon mb-3">
              <i class="bi bi-check-circle display-3 text-success"></i>
            </div>
            <h5 class="fw-bold text-primary-color">Check Your Email</h5>
            <p class="text-muted">
              We've sent password reset instructions to <strong>{{ email }}</strong
              >.
            </p>
          </div>

          <div class="d-grid gap-2 mb-4">
            <button
              type="button"
              class="btn btn-outline-primary"
              :disabled="isResending"
              @click="handleResendEmail"
            >
              <span
                v-if="isResending"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              <i v-else class="bi bi-envelope me-2"></i>
              <span>{{ isResending ? 'Resending...' : 'Resend Email' }}</span>
            </button>
          </div>
        </div>

        <!-- Sign In Link -->
        <div class="text-center">
          <p class="mb-0">
            Remember your password?
            <router-link to="/" class="text-primary-color text-decoration-none fw-bold">
              Sign In
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Reactive States
const email = ref('')
const isSubmitted = ref(false)
const isLoading = ref(false)
const isResending = ref(false)
const resendSuccessMessage = ref('')

const errors = reactive({
  email: '',
  api: '',
})

// Validation Logic
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    errors.email = 'Email address is required.'
    return false
  } else if (!emailRegex.test(email.value)) {
    errors.email = 'Please enter a valid email address.'
    return false
  } else {
    errors.email = ''
    return true
  }
}

// Reset Password API Request
const handleResetPassword = async () => {
  errors.api = ''

  if (!validateEmail()) {
    return
  }

  isLoading.value = true

  try {
    const response = await axios.post('https://api.example.com/v1/auth/forgot-password', {
      email: email.value,
    })

    if (response.status === 200 || response.status === 201) {
      // Switch view from Form to Success Instructions
      isSubmitted.value = true
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      errors.api = error.response.data.message
    } else {
      errors.api = 'Unable to send reset email. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

// Resend Email Request
const handleResendEmail = async () => {
  errors.api = ''
  resendSuccessMessage.value = ''
  isResending.value = true

  try {
    const response = await axios.post('https://api.example.com/v1/auth/forgot-password', {
      email: email.value,
    })

    if (response.status === 200 || response.status === 201) {
      resendSuccessMessage.value = 'Password reset instructions have been resent successfully!'
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      errors.api = error.response.data.message
    } else {
      errors.api = 'Failed to resend email. Please try again later.'
    }
  } finally {
    isResending.value = false
  }
}
</script>
