<template>
  <div class="overlay" id="overlay"></div>
  <div class="auth-container">
    <div class="text-center mb-4">
      <div class="app-logo mb-3">
        <img src="../../assets/img/logo.png" style="height: 90px; width: auto;" alt="">
      </div>
      <h4 class="fw-bold text-primary-color">Play Online Khaiwal</h4>
      <p class="text-muted">Sign in to your account</p>
    </div>
    <div v-if="errors.api" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ errors.api }}
      <button type="button" class="btn-close" @click="errors.api = ''" aria-label="Close"></button>
    </div>
    <form @submit.prevent="handleLogin" class="auth-form" novalidate>
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
          <input :type="showPassword ? 'text' : 'password'" class="form-control border-start-0 border-end-0"
            :class="{ 'is-invalid': errors.password }" id="password" v-model="form.password"
            placeholder="Enter your password" @input="clearFieldError('password')" />
          <button type="button" class="input-group-text bg-transparent border-start-0" id="togglePassword"
            @click="showPassword = !showPassword" aria-label="Toggle password visibility">
            <i :class="['bi', showPassword ? 'bi-eye-slash' : 'bi-eye', 'text-muted']"></i>
          </button>
        </div>
        <div v-if="errors.password" class="invalid-feedback d-block small mt-1">
          {{ errors.password }}
        </div>
      </div>

      <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" id="rememberMe" v-model="form.rememberMe" />
        <label class="form-check-label" for="rememberMe">Remember me</label>
      </div>

      <div class="d-grid gap-2 mb-4">
        <button type="submit" class="btn btn-app btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <span>{{ isLoading ? 'Signing In...' : 'Sign In' }}</span>
        </button>
      </div>

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
import { useRouter, useRoute } from 'vue-router'
import api from '@/plugins/axios'
import { useAuthStore } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  phone: '',
  password: '',
  rememberMe: false,
})

const showPassword = ref(false)
const isLoading = ref(false)

const errors = reactive({
  phone: '',
  password: '',
  api: '',
})

const clearFieldError = (field) => {
  errors[field] = ''
  errors.api = ''
}

const normalizePhone = (value) => value.replace(/[\s-]/g, '')

const validateForm = () => {
  let isValid = true
  const phoneRegex = /^\+?[0-9]{7,15}$/

  if (!form.phone) {
    errors.phone = 'Phone number is required.'
    isValid = false
  } else if (!phoneRegex.test(normalizePhone(form.phone))) {
    errors.phone = 'Please enter a valid phone number.'
    isValid = false
  } else {
    errors.phone = ''
  }

  if (!form.password) {
    errors.password = 'Password is required.'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.'
    isValid = false
  } else {
    errors.password = ''
  }

  return isValid
}

const handleLogin = async () => {
  errors.api = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    const response = await api.post('/login', {
      phone: normalizePhone(form.phone),
      password: form.password,
      remember: form.rememberMe,
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
        form.rememberMe
      )

      const redirectPath =
        typeof route.query.redirect === 'string'
          ? route.query.redirect
          : '/dashboard'

      await router.push(redirectPath)

      return
    }

    errors.api =
      responseData?.message ||
      'Login failed. Please try again.'
  } catch (error) {
    errors.api =
      error.response?.data?.message ||
      'Unable to login. Please try again.'
  } finally {
    isLoading.value = false
  }
}

</script>
