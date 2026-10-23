// src/plugins/axios.js
import axios from 'axios'
import router from '../router'
import { getAuthToken, clearAuthStorage } from '../utils/auth'
import { beginGlobalRequest, endGlobalRequest } from '../utils/requestLoader'
import { apiResponseCache, stableQueryString } from '../utils/apiCache'

const CACHE_POLICIES = [
  { match: (path) => path === '/settings', ttl: 5 * 60 * 1000 },
  { match: (path) => path === '/games/list', ttl: 2 * 60 * 1000 },
  { match: (path) => path === '/result-chart/index', ttl: 60 * 1000 },
  { match: (path) => path === '/wallet/payment-methods', ttl: 30 * 1000 },
  { match: (path) => path === '/notifications', ttl: 5 * 1000 },
  { match: (path) => path === '/faqs', ttl: 5 * 60 * 1000, public: true, persistent: true },
  { match: (path) => path === '/app-update', ttl: 5 * 60 * 1000, public: true, persistent: true },
]

const resolveCachePolicy = (url, config = {}) => {
  if (config.cache === false) return null
  const path = String(url || '').split('?')[0] || '/'
  return CACHE_POLICIES.find((policy) => policy.match(path)) || null
}

const currentUserScope = () => {
  try {
    const raw = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user')
    const user = raw ? JSON.parse(raw) : null
    return user?.id !== undefined && user?.id !== null ? String(user.id) : null
  } catch {
    return null
  }
}

const cloneData = (data) => {
  if (data === undefined || data === null) return data
  try {
    return JSON.parse(JSON.stringify(data))
  } catch {
    return data
  }
}

const api = axios.create({
  // Set VITE_API_BASE_URL for local/staging environments; use the live API by default.
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
      ? window.location.protocol === 'capacitor:' || window.location.hostname === 'localhost'
        ? 'https://playonlinekhaiwal.com/api/v1'
        : `${window.location.origin}/api/v1`
      : 'http://127.0.0.1:8000/api/v1'),
  headers: {
    Accept: 'application/json',
  },
})

// Cache only explicitly allow-listed, read-only endpoints. Wallet balances,
// payment status, withdrawals, betting state, and transaction history are never cached.
const axiosGet = api.get.bind(api)
api.get = (url, config = {}) => {
  const policy = resolveCachePolicy(url, config)
  if (!policy) return axiosGet(url, config)

  const userScope = policy.public ? 'public' : currentUserScope()
  if (!userScope) return axiosGet(url, config)

  const [basePath, inlineQuery = ''] = String(url || '').split('?')
  const inlineParams = Object.fromEntries(new URLSearchParams(inlineQuery).entries())
  const query = stableQueryString({ ...inlineParams, ...(config.params || {}) })
  const scope = policy.public ? 'public' : `user:${userScope}`
  const cacheKey = policy.public
    ? `app-api-cache:public:${basePath}?${query}`
    : `private:${userScope}:${basePath}?${query}`

  return apiResponseCache
    .getOrFetch(cacheKey, policy.ttl, () => axiosGet(url, config), {
      scope: policy.public ? 'public' : 'private',
      persistent: Boolean(policy.persistent),
      responseFromData: (data) => ({
        data: cloneData(data),
        status: 200,
        statusText: 'OK (app cache)',
        headers: {},
        config,
        request: null,
      }),
    })
    .then((response) => {
      // Return independent response data so callers cannot mutate the cache entry.
      return { ...response, data: cloneData(response.data) }
    })
}

let actualHttpRequests = 0
export const getApiCacheDiagnostics = () => ({
  ...apiResponseCache.diagnostics(),
  actualHttpRequests,
})

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__APP_API_CACHE_DIAGNOSTICS__ = getApiCacheDiagnostics
}

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  actualHttpRequests += 1
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
    if (response.config?.method && response.config.method.toLowerCase() !== 'get') {
      apiResponseCache.clearPrivate()
    }
    return response
  },
  (error) => {
    if (error.config?._globalLoaderTracked) {
      endGlobalRequest()
      error.config._globalLoaderTracked = false
    }
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      apiResponseCache.clearPrivate()
      clearAuthStorage()
      router.push({ name: 'login' })
    }
    return Promise.reject(error)
  },
)

export default api
