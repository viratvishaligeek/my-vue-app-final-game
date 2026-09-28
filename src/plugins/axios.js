// src/plugins/axios.js
import axios from 'axios'
import router from '../router'
import { getAuthToken, clearAuthStorage } from '../utils/auth'

const api = axios.create({
  // baseURL: 'https://palevioletred-lemur-564721.hostingersite.com/public/api/v1',
  baseURL: 'http://127.0.0.1:8000/api/v1',
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
