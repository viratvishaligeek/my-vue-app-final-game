// src/plugins/axios.js
import axios from 'axios'
import router from '../router'
import { getAuthToken, clearAuthStorage } from '../utils/auth'

const api = axios.create({
  // Set VITE_API_BASE_URL for local/staging environments; use the live API by default.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://galidisawar.com/api/v1',
  headers: {
    Accept: 'application/json',
  },
})

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      clearAuthStorage()
      router.push({ name: 'login' })
    }
    return Promise.reject(error)
  },
)

export default api
