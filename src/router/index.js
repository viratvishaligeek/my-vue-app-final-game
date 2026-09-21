import { createRouter, createWebHistory } from 'vue-router'
import publicRoutes from './publicRoutes'
import protectedRoutes from './protectedRoutes'

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

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  const isAuthenticated = !!token
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      return next({ name: 'login' })
    }
  }
  if (to.matched.some((record) => record.meta.requiresGuest)) {
    if (isAuthenticated) {
      return next({ name: 'dashboard' })
    }
  }
  next()
})

export default router
