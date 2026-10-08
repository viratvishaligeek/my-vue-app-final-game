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
        path: '/profile',
        name: 'profile',
        component: () => import('../views/EditProfile.vue'),
      },
      {
        path: '/play-game/:id',
        name: 'play-game',
        component: () => import('../views/PlayView.vue'),
      },
      {
        path: '/play-history',
        name: 'play-history',
        component: () => import('../views/PlayHistoryView.vue'),
      },
      {
        path: '/wallet',
        name: 'wallet',
        component: () => import('../views/wallet/View.vue'),
      },
      {
        path: '/wallet/add',
        name: 'wallet-add',
        component: () => import('../views/wallet/Add.vue'),
      },
      {
        path: '/wallet/withdraw',
        name: 'wallet-withdraw',
        component: () => import('../views/wallet/Withdraw.vue'),
      },
      {
        path: '/monthly-chart',
        name: 'monthly-chart',
        component: () => import('../views/MonthlyChart.vue'),
      },
      {
        path: '/live-support',
        name: 'live-support',
        component: () => import('../views/LiveSupport.vue'),
      },
      {
        path: '/notifications',
        name: 'notifications',
        component: () => import('../views/Notification.vue'),
      },
      // for /terms-conditions /how-to-play /game-rates
      {
        path: '/page/:slug',
        name: 'dynamic-page',
        component: () => import('@/views/DynamicPageView.vue'),
      },
    ],
  },
]
