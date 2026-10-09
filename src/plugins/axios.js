// src/plugins/axios.js
import axios from 'axios'
import router from '../router'
import { getAuthToken, clearAuthStorage } from '../utils/auth'
import { beginGlobalRequest, endGlobalRequest } from '../utils/requestLoader'

const api = axios.create({
  // Set VITE_API_BASE_URL for local/staging environments; use the live API by default.
  baseURL: 'http://127.0.0.1:8000/api/v1',
  // baseURL: 'https://galidisawar.com/api/v1',
  headers: {
    Accept: 'application/json',
  },
})

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (config.showGlobalLoader !== false) {
    config._globalLoaderTracked = true
    beginGlobalRequest()
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    if (response.config?._globalLoaderTracked) {
      endGlobalRequest()
      response.config._globalLoaderTracked = false
    }
    return response
  },
  (error) => {
    if (error.config?._globalLoaderTracked) {
      endGlobalRequest()
      error.config._globalLoaderTracked = false
    }
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      clearAuthStorage()
      router.push({ name: 'login' })
    }
    return Promise.reject(error)
  },
)

export default api
