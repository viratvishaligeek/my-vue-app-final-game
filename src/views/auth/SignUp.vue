<template>
  <div class="overlay" id="overlay"></div>

  <div class="auth-container">
    <div class="text-center mb-4">
      <div class="app-logo mb-3">
        <img src="../../assets/img/logo.png" style="height: 90px; width: auto;" alt="">
      </div>
      <h4 class="fw-bold text-primary-color">Gali Disawar Bazar</h4>
      <p class="text-muted">Sign up to get started with BusGo</p>
    </div>

    <div v-if="errors.api" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ errors.api }}
      <button type="button" class="btn-close" @click="errors.api = ''" aria-label="Close"></button>
    </div>

    <form @submit.prevent="handleSignUp" class="auth-form" novalidate>
      <div class="mb-3">
        <label for="fullName" class="form-label">Full Name</label>
        <div class="input-group">
          <span class="input-group-text bg-transparent border-end-0">
            <i class="bi bi-person text-muted"></i>
          </span>
          <input type="text" class="form-control border-start-0" :class="{ 'is-invalid': errors.fullName }"
            id="fullName" v-model.trim="form.fullName" placeholder="Enter full name"
            @input="clearFieldError('fullName')" />
        </div>
        <div v-if="errors.fullName" class="invalid-feedback d-block small mt-1">
          {{ errors.fullName }}
        </div>
      </div>
      <div class="mb-3">
        <label for="phone" class="form-label">Phone Number</label>
        <div class="input-group">
          <span class="input-group-text bg-transparent border-end-0">
            <i class="bi bi-telephone text-muted"></i>
          </span>
          <input type="tel" class="form-control border-start-0" :class="{ 'is-invalid': errors.phone }" id="phone"
            v-model.trim="form.phone" placeholder="Enter phone number" @input="clearFieldError('phone')" />
        </div>
        <div v-if="errors.phone" class="invalid-feedback d-block small mt-1">
          {{ errors.phone }}
        </div>
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <div class="input-group">
          <span class="input-group-text bg-transparent border-end-0">
            <i class="bi bi-lock text-muted"></i>
          </span>
          <input :type="showPassword ? 'text' : 'password'" class="form-control border-start-0 border-end-0"
            :class="{ 'is-invalid': errors.password }" id="password" v-model="form.password"
            placeholder="Create password" @input="clearFieldError('password')" />
          <button type="button" class="input-group-text bg-transparent border-start-0"
            @click="showPassword = !showPassword" aria-label="Toggle password visibility">
            <i :class="['bi', showPassword ? 'bi-eye-slash' : 'bi-eye', 'text-muted']"></i>
          </button>
        </div>
        <div v-if="errors.password" class="invalid-feedback d-block small mt-1">
          {{ errors.password }}
        </div>

        <div v-if="form.password" class="mt-2">
          <div class="d-flex justify-content-between align-items-center mb-1 small">
            <span class="text-muted">Strength:</span>
            <span :class="['fw-bold', strengthTextClass]">{{ passwordStrengthText }}</span>
          </div>
          <div class="progress" style="height: 4px">
            <div v-for="i in 4" :key="i" class="progress-bar me-1" :class="getBarClass(i)" style="width: 25%"></div>
          </div>
        </div>
      </div>

      <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" :class="{ 'is-invalid': errors.termsAgree }" id="termsAgree"
          v-model="form.termsAgree" @change="clearFieldError('termsAgree')" />
        <label class="form-check-label small" for="termsAgree">
          I agree to the <a href="#" class="text-primary-color">Terms</a> &
          <a href="#" class="text-primary-color">Privacy Policy</a>
        </label>
        <div v-if="errors.termsAgree" class="invalid-feedback d-block small mt-1">
          {{ errors.termsAgree }}
        </div>
      </div>

      <div class="d-grid gap-2 mb-4">
        <button type="submit" class="btn btn-app btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          <span>{{ isLoading ? 'Creating Account...' : 'Sign Up' }}</span>
        </button>
      </div>

      <div class="text-center">
        <p class="mb-0">
          Already have an account?
          <router-link to="/" class="text-primary-color text-decoration-none fw-bold">
            Sign In
          </router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/plugins/axios'
import { useAuthStore } from '@/utils/auth'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  fullName: '',
  phone: '',
  password: '',
  termsAgree: false,
})

const showPassword = ref(false)
const isLoading = ref(false)

const errors = reactive({
  fullName: '',
  phone: '',
  password: '',
  termsAgree: '',
  api: '',
})

const clearFieldError = (field) => {
  errors[field] = ''
  errors.api = ''
}

// Client Validation
const validateForm = () => {
  let isValid = true
  const phoneRegex = /^[0-9+\-\s]{7,15}$/

  if (!form.fullName) {
    errors.fullName = 'Full name is required.'
    isValid = false
  } else if (form.fullName.length < 2) {
    errors.fullName = 'Name must be at least 2 characters.'
    isValid = false
  }

  if (!form.phone) {
    errors.phone = 'Phone number is required.'
    isValid = false
  } else if (!phoneRegex.test(form.phone)) {
    errors.phone = 'Please enter a valid phone number.'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Password is required.'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
    isValid = false
  }

  if (!form.termsAgree) {
    errors.termsAgree = 'You must agree to the Terms and Privacy Policy.'
    isValid = false
  }

  return isValid
}

// Password Strength Computation
const passwordScore = computed(() => {
  const p = form.password
  let score = 0
  if (!p) return 0
  if (p.length >= 6) score++
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const passwordStrengthText = computed(() => {
  switch (passwordScore.value) {
    case 1:
      return 'Weak'
    case 2:
      return 'Medium'
    case 3:
      return 'Strong'
    case 4:
      return 'Very Strong'
    default:
      return 'Too Short'
  }
})

const strengthTextClass = computed(() => {
  switch (passwordScore.value) {
    case 1:
      return 'text-danger'
    case 2:
      return 'text-warning'
    case 3:
    case 4:
      return 'text-success'
    default:
      return 'text-muted'
  }
})

const getBarClass = (barIndex) => {
  if (barIndex <= passwordScore.value) {
    if (passwordScore.value === 1) return 'bg-danger'
    if (passwordScore.value === 2) return 'bg-warning'
    return 'bg-success'
  }
  return 'bg-light'
}

const handleSignUp = async () => {
  errors.api = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    const response = await api.post('/register', {
      name: form.fullName,
      phone: form.phone,
      password: form.password,
    })

    const responseData = response.data

    if (
      responseData?.success &&
      responseData?.data?.token
    ) {
      const userData = responseData.data.user || {}
      authStore.setAuth(
        responseData.data.token,
        userData,
        false
      )
      await router.push({ name: 'dashboard' })
      return
    }

    errors.api =
      responseData?.message ||
      'Account creation failed. Please try again.'
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response

      if (status === 422 && data?.errors) {
        errors.fullName = data.errors.name?.[0] || ''
        errors.phone = data.errors.phone?.[0] || ''
        errors.password = data.errors.password?.[0] || ''

        errors.api =
          data.message ||
          'Validation failed. Please review the highlighted fields.'
      } else {
        errors.api =
          data?.message ||
          'Account creation failed. Please try again.'
      }
    } else {
      errors.api =
        'Network error. Please check your internet connection.'
    }
  } finally {
    isLoading.value = false
  }
}

</script>
