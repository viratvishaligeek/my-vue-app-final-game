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
          <i class="bi bi-bus-front display-4 text-primary"></i>
        </div>
        <h4 class="fw-bold text-primary-color">Create Account</h4>
        <p class="text-muted">Sign up to get started</p>
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

      <!-- Sign Up Form -->
      <form @submit.prevent="handleSignUp" class="auth-form" novalidate>
        <!-- Full Name Input -->
        <div class="mb-3">
          <label for="fullName" class="form-label">Full Name</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-end-0">
              <i class="bi bi-person text-muted"></i>
            </span>
            <input
              type="text"
              class="form-control border-start-0"
              :class="{ 'is-invalid': errors.fullName }"
              id="fullName"
              v-model.trim="form.fullName"
              placeholder="Enter your full name"
              @input="validateFullName"
            />
          </div>
          <div v-if="errors.fullName" class="text-danger small mt-1">
            {{ errors.fullName }}
          </div>
        </div>

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

        <!-- Phone Input -->
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
              placeholder="Enter your phone number"
              @input="validatePhone"
            />
          </div>
          <div v-if="errors.phone" class="text-danger small mt-1">
            {{ errors.phone }}
          </div>
        </div>

        <!-- Password Input -->
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
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
              placeholder="Create a password"
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

          <!-- Dynamic Password Strength Indicator -->
          <div class="password-strength mt-2" v-if="form.password">
            <div class="d-flex gap-2 mb-1">
              <div
                v-for="index in 4"
                :key="index"
                class="strength-bar flex-grow-1"
                :class="getBarClass(index)"
              ></div>
            </div>
            <small class="text-muted">
              Password strength:
              <strong :class="strengthTextClass">{{ passwordStrengthText }}</strong>
            </small>
          </div>
        </div>

        <!-- Terms Agreement Checkbox -->
        <div class="mb-3 form-check">
          <input
            type="checkbox"
            class="form-check-input"
            :class="{ 'is-invalid': errors.termsAgree }"
            id="termsAgree"
            v-model="form.termsAgree"
            @change="validateTerms"
          />
          <label class="form-check-label" for="termsAgree">
            I agree to the
            <a href="#" class="text-primary-color text-decoration-none">Terms of Service</a>
            and
            <a href="#" class="text-primary-color text-decoration-none">Privacy Policy</a>
          </label>
          <div v-if="errors.termsAgree" class="text-danger small mt-1">
            {{ errors.termsAgree }}
          </div>
        </div>

        <!-- Submit Button -->
        <div class="d-grid gap-2 mb-4">
          <button type="submit" class="btn btn-app btn-primary" :disabled="isLoading">
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm me-2"
              role="status"
            ></span>
            <span>{{ isLoading ? 'Creating Account...' : 'Create Account' }}</span>
          </button>
        </div>

        <!-- Sign In Link -->
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
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Form Data State
const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  termsAgree: false,
})

// UI States
const showPassword = ref(false)
const isLoading = ref(false)

// Errors State
const errors = reactive({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  termsAgree: '',
  api: '',
})

// Validation Methods
const validateFullName = () => {
  if (!form.fullName) {
    errors.fullName = 'Full name is required.'
    return false
  } else if (form.fullName.length < 2) {
    errors.fullName = 'Name must be at least 2 characters.'
    return false
  } else {
    errors.fullName = ''
    return true
  }
}

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

const validatePhone = () => {
  const phoneRegex = /^[0-9]{10,15}$/
  if (!form.phone) {
    errors.phone = 'Phone number is required.'
    return false
  } else if (!phoneRegex.test(form.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Please enter a valid phone number.'
    return false
  } else {
    errors.phone = ''
    return true
  }
}

const validatePassword = () => {
  if (!form.password) {
    errors.password = 'Password is required.'
    return false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
    return false
  } else {
    errors.password = ''
    return true
  }
}

const validateTerms = () => {
  if (!form.termsAgree) {
    errors.termsAgree = 'You must agree to the Terms and Privacy Policy.'
    return false
  } else {
    errors.termsAgree = ''
    return true
  }
}

// Password Strength Calculation (0 to 4 score)
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
  return 'bg-light-gray'
}

// Handle Form Submit & API Integration
const handleSignUp = async () => {
  errors.api = ''

  const isNameValid = validateFullName()
  const isEmailValid = validateEmail()
  const isPhoneValid = validatePhone()
  const isPasswordValid = validatePassword()
  const isTermsValid = validateTerms()

  if (!isNameValid || !isEmailValid || !isPhoneValid || !isPasswordValid || !isTermsValid) {
    return
  }

  isLoading.value = true

  try {
    const response = await axios.post('https://api.example.com/v1/auth/register', {
      full_name: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
    })

    if (response.status === 200 || response.status === 201) {
      // Redirect to Sign In or Dashboard upon successful account creation
      router.push('/')
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      errors.api = error.response.data.message
    } else {
      errors.api = 'Account creation failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
