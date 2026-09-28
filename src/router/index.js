import { createRouter, createWebHistory } from 'vue-router'
import publicRoutes from './publicRoutes'
import protectedRoutes from './protectedRoutes'
import { getAuthToken, useAuthStore } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...publicRoutes,
    ...protectedRoutes,
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)
  const authStore = useAuthStore()
  const token = getAuthToken()

  if (requiresAuth) {
    if (!token) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }
    const isValid = await authStore.verifyAuthToken()
    if (!isValid) {
      return next({ name: 'login' })
    }
  }

  if (requiresGuest && token) {
    const isValid = await authStore.verifyAuthToken()
    if (isValid) {
      return next({ name: 'dashboard' })
    }
  }

  next()
})

export default router
