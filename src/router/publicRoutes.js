export default [
  {
    path: '/',
    name: 'login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: () => import('../views/auth/SignUp.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/auth/ForgotPassword.vue'),
    meta: { requiresGuest: true },
  },
]
