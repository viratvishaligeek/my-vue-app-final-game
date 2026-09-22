import MainLayout from '../layouts/MainLayout.vue'

export default [
  {
    path: '/dashboard',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue'),
      },
      {
        path: '/play-game',
        name: 'play-game',
        component: () => import('../views/PlayView.vue'),
      },
    ],
  },
]
