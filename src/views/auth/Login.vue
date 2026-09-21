<template>
  <div class="overlay" id="overlay"></div>

  <!-- Auth Container -->
  <div class="auth-container">
    <!-- Logo and Header -->
    <div class="text-center mb-4">
      <div class="app-logo mb-3">
        <i class="bi bi-bus-front display-4 text-primary"></i>
      </div>
      <h4 class="fw-bold text-primary-color">BusGo</h4>
      <p class="text-muted">Sign in to your account</p>
    </div>

    <!-- General API Error Alert -->
    <div v-if="errors.api" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ errors.api }}
      <button type="button" class="btn-close" @click="errors.api = ''" aria-label="Close"></button>
    </div>

    <!-- Sign In Form -->
    <form @submit.prevent="handleLogin" class="auth-form" novalidate>
      <!-- Email Input -->
      <div class="mb-3">
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
            v-model.trim="form.email"
            placeholder="Enter your email"
            @input="validateEmail"
          />
        </div>
        <div v-if="errors.email" class="text-danger small mt-1">
          {{ errors.email }}
        </div>
      </div>

      <!-- Password Input -->
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <label for="password" class="form-label mb-0">Password</label>
          <router-link to="/forgot-password" class="small text-primary-color text-decoration-none">
            Forgot Password?
          </router-link>
        </div>
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
            placeholder="Enter your password"
            @input="validatePassword"
          />
          <button
            type="button"
            class="input-group-text bg-transparent border-start-0"
            id="togglePassword"
            @click="showPassword = !showPassword"
          >
            <i :class="['bi', showPassword ? 'bi-eye-slash' : 'bi-eye', 'text-muted']"></i>
          </button>
        </div>
        <div v-if="errors.password" class="text-danger small mt-1">
          {{ errors.password }}
        </div>
      </div>

      <!-- Remember Me Checkbox -->
      <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" id="rememberMe" v-model="form.rememberMe" />
        <label class="form-check-label" for="rememberMe">Remember me</label>
      </div>

      <!-- Submit Button -->
      <div class="d-grid gap-2 mb-4">
        <button type="submit" class="btn btn-app btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          <span>{{ isLoading ? 'Signing In...' : 'Sign In' }}</span>
        </button>
      </div>

      <!-- Sign Up Link -->
      <div class="text-center">
        <p class="mb-0">
          Don't have an account?
          <router-link to="/sign-up" class="text-primary-color text-decoration-none fw-bold">
            Sign Up
          </router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

const showPassword = ref(false)
const isLoading = ref(false)

const errors = reactive({
  email: '',
  password: '',
  api: '',
})

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email) {
    errors.email = 'Email address is required.'
    return false
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
    return false
  } else {
    errors.email = ''
    return true
  }
}

const validatePassword = () => {
  if (!form.password) {
    errors.password = 'Password is required.'
    return false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.'
    return false
  } else {
    errors.password = ''
    return true
  }
}

const handleLogin = async () => {
  errors.api = ''

  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()

  if (!isEmailValid || !isPasswordValid) {
    return
  }

  isLoading.value = true

  // for testing only
  sessionStorage.setItem('auth_token', 'sdfsdfsdf456sd4f65s4d5f64sdf465')
  localStorage.setItem('auth_token', 'sdfsdfsdf456sd4f65s4d5f64sdf465')
  router.push('/dashboard')
  try {
    const response = await axios.post('https://api.example.com/v1/auth/login', {
      email: form.email,
      password: form.password,
      remember_me: form.rememberMe,
    })

    if (response.data && response.data.token) {
      if (form.rememberMe) {
        localStorage.setItem('auth_token', response.data.token)
      } else {
        sessionStorage.setItem('auth_token', response.data.token)
      }

      router.push('/dashboard')
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      errors.api = error.response.data.message
    } else {
      errors.api = 'Invalid credentials or server error. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
