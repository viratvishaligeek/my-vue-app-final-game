import { defineStore } from 'pinia'
import api from '@/plugins/axios'

const AUTH_TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

/**
 * Get the currently stored authentication token.
 * Persistent login has priority over session login.
 */
export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY) || null
}

/**
 * Get the currently stored user.
 */
export function getStoredUser() {
  const storedUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch {
    return null
  }
}

/**
 * Save authentication token according to remember preference.
 *
 * remember = true  -> localStorage
 * remember = false -> sessionStorage
 */
export function setAuthToken(token, remember = false) {
  if (!token) {
    return
  }

  if (remember) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
  } else {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

/**
 * Save user data in the same storage where the token lives.
 */
export function setStoredUser(user, remember = false) {
  if (!user) {
    return
  }

  const serializedUser = JSON.stringify(user)

  if (remember) {
    localStorage.setItem(USER_KEY, serializedUser)
    sessionStorage.removeItem(USER_KEY)
  } else {
    sessionStorage.setItem(USER_KEY, serializedUser)
    localStorage.removeItem(USER_KEY)
  }
}

/**
 * Clear all authentication-related storage.
 */
export function clearAuthStorage() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(AUTH_TOKEN_KEY)

  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(USER_KEY)

  // Remove old/legacy keys if they exist.
  localStorage.removeItem('user')
  localStorage.removeItem('user_token')
  sessionStorage.removeItem('user')
  sessionStorage.removeItem('user_token')
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: getStoredUser(),
    token: getAuthToken(),
    isAuthVerified: false,
    isVerifying: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    name: (state) => state.user?.name || 'User',
    amount: (state) => Number(state.user?.balance ?? 0),
    userId: (state) => state.user?.id ?? null,
    phone: (state) => state.user?.phone ?? '',
    email: (state) => state.user?.email ?? '',
  },

  actions: {
    /**
     * Set complete authentication state.
     *
     * This should be used after login/register.
     */
    setAuth(token, user = null, remember = false) {
      this.token = token
      this.user = user
      this.isAuthVerified = true
      setAuthToken(token, remember)
      if (user) {
        setStoredUser(user, remember)
      }
    },
    /**
     * Update user information while preserving
     * the current storage strategy.
     */
    updateUserData(userData) {
      if (!userData) {
        return
      }
      this.user = {
        ...(this.user || {}),
        ...userData,
      }
      const remember = Boolean(localStorage.getItem(AUTH_TOKEN_KEY))
      setStoredUser(this.user, remember)
    },
    /**
     * Replace user data completely.
     *
     * Useful when /user API returns the complete
     * authoritative user object.
     */
    setUser(userData) {
      if (!userData) {
        return
      }
      this.user = userData
      const remember = Boolean(localStorage.getItem(AUTH_TOKEN_KEY))
      setStoredUser(this.user, remember)
    },
    /**
     * Verify the currently authenticated user.
     */
    async verifyAuthToken() {
      const token = getAuthToken()
      if (!token) {
        this.logoutLocal()
        return false
      }
      if (this.isVerifying) {
        return this.isAuthenticated
      }
      this.isVerifying = true
      try {
        const response = await api.get('/user')
        if (response.status === 200) {
          const userData =
            response.data?.data?.user || response.data?.data || response.data?.user || response.data
          if (userData && typeof userData === 'object') {
            this.setUser(userData)
          }
          this.token = token
          this.isAuthVerified = true
          return true
        }
        return false
      } catch (error) {
        const status = error.response?.status
        /*
         * Only invalidate authentication when the backend
         * explicitly says the token is unauthorized/forbidden.
         *
         * Do NOT logout on network errors or 5xx errors.
         */
        if (status === 401 || status === 403) {
          this.logoutLocal()
          return false
        }
        console.error('Unable to verify authentication:', error)
        return this.isAuthenticated
      } finally {
        this.isVerifying = false
      }
    },
    /**
     * Logout from backend and clear local authentication.
     */
    async performLogout() {
      const token = getAuthToken()
      try {
        if (token) {
          await api.post('/logout')
        }
      } catch (error) {
        console.warn('Backend logout failed or token already expired:', error)
      } finally {
        this.logoutLocal()
      }
    },
    /**
     * Clear local authentication state.
     */
    logoutLocal() {
      this.token = null
      this.user = null
      this.isAuthVerified = false
      this.isVerifying = false
      clearAuthStorage()
    },
  },
})

export async function verifyAuthToken() {
  const store = useAuthStore()
  return store.verifyAuthToken()
}

export async function performLogout() {
  const store = useAuthStore()
  return store.performLogout()
}
