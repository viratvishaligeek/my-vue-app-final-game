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
      // {
      //   path: '/bus-listing',
      //   name: 'bus-listing',
      //   component: () => import('../views/DashboardView.vue'),
      // },
    ],
  },
]
