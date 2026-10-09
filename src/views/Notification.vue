<template>
  <div class="content-area">
    <div class="page-content">
      <div v-if="!isNativeApp" class="alert alert-light border rounded-3 d-flex align-items-center justify-content-between gap-3 mb-3">
        <div>
          <div class="fw-bold text-dark"><i class="bi bi-bell-fill me-2"></i>Stay up to date</div>
          <div class="small text-muted">Enable browser notifications for public announcements.</div>
          <div v-if="pushStatus" class="small mt-1" role="status">{{ pushStatus }}</div>
        </div>
        <button type="button" class="btn btn-sm btn-primary flex-shrink-0" :disabled="pushLoading" @click="enablePush">
          <span v-if="pushLoading" class="spinner-border spinner-border-sm me-1"></span>
          {{ pushLoading ? 'Enabling…' : 'Enable' }}
        </button>
      </div>
      <div v-if="isInitialLoading" class="text-center py-5">
        <div class="spinner-border spinner-border-sm text-warning" role="status"></div>
        <div class="text-muted mt-2">
          Loading notifications...
        </div>
      </div>
      <div v-else-if="errorMessage" class="alert alert-danger rounded-3">
        {{ errorMessage }}
        <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="fetchNotifications(1)">
          Retry
        </button>
      </div>
      <template v-else>
        <template v-for="group in groupedNotifications" :key="group.key">
          <h6 class="section-header">
            {{ group.title }}
          </h6>
          <div v-for="notification in group.items" :key="notification.id" class="notification-item">
            <div class="d-flex">
              <div class="notification-icon" :class="getNotificationIconClass(notification.subject)">
                <i :class="getNotificationIcon(notification.subject)"></i>
              </div>
              <div class="notification-content">
                <div class="notification-title">
                  {{ notification.subject || 'Notification' }}
                </div>
                <div v-if="notification.message" class="notification-message">
                  {{ notification.message }}
                </div>
                <div class="notification-time">
                  {{ formatNotificationTime(notification.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </template>
        <div v-if="notifications.length === 0" class="text-center py-5">
          <div class="empty-icon mb-2">
            <i class="bi bi-bell-slash"></i>
          </div>
          <h6 class="fw-bold text-dark">
            No Notifications
          </h6>
          <p class="text-muted mb-0">
            You don't have any notifications yet.
          </p>
        </div>
        <div v-if="notifications.length > 0" class="text-center mt-4 mb-4">
          <button v-if="hasMore" type="button" class="btn action-btn secondary-action-btn" :disabled="isLoading"
            @click="loadMore">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
            {{ isLoading ? 'Loading...' : 'Load More' }}
          </button>
          <div v-else class="text-muted fs-8">
            No more notifications
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import api from '@/plugins/axios'
import { Capacitor } from '@capacitor/core'
import { subscribeToPush } from '@/services/pushNotifications'
import { computed, onMounted, ref } from 'vue'

const notifications = ref([])
const isNativeApp = Capacitor.isNativePlatform()
const pushLoading = ref(false)
const pushStatus = ref('')

const enablePush = async () => {
  pushLoading.value = true
  pushStatus.value = ''
  try {
    const result = await subscribeToPush()
    pushStatus.value = result.message
  } finally {
    pushLoading.value = false
  }
}
const isLoading = ref(false)
const errorMessage = ref('')

const currentPage = ref(1)
const lastPage = ref(1)
const hasMore = ref(false)

const notificationTypes = [
  {
    keywords: [
      'wallet',
      'credit',
      'credited',
      'debit',
      'debited',
      'payment',
      'transaction',
    ],
    icon: 'bi bi-credit-card',
    className: 'secondary',
  },
  {
    keywords: [
      'booking',
      'bet',
      'game',
      'play',
      'result',
    ],
    icon: 'bi bi-ticket-perforated',
    className: 'primary',
  },
  {
    keywords: [
      'offer',
      'bonus',
      'discount',
      'promotion',
      'promo',
    ],
    icon: 'bi bi-gift',
    className: 'accent',
  },
  {
    keywords: [
      'welcome',
    ],
    icon: 'bi bi-person-plus',
    className: 'primary',
  },
  {
    keywords: [
      'security',
      'password',
      'login',
    ],
    icon: 'bi bi-shield-check',
    className: 'warning',
  },
]

const defaultNotification = {
  icon: 'bi bi-bell',
  className: 'warning',
}

const isInitialLoading = computed(() => {
  return isLoading.value && notifications.value.length === 0
})

const groupedNotifications = computed(() => {
  const groups = {
    today: {
      key: 'today',
      title: 'Today',
      items: [],
    },

    yesterday: {
      key: 'yesterday',
      title: 'Yesterday',
      items: [],
    },

    earlier: {
      key: 'earlier',
      title: 'Earlier',
      items: [],
    },
  }

  notifications.value.forEach((notification) => {
    const date = new Date(notification.created_at)

    if (Number.isNaN(date.getTime())) {
      return
    }

    const group = isToday(date)
      ? groups.today
      : isYesterday(date)
        ? groups.yesterday
        : groups.earlier

    group.items.push(notification)
  })

  return Object.values(groups).filter(
    group => group.items.length > 0
  )
})

const fetchNotifications = async (page = 1) => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data } = await api.get('/notifications', {
      params: {
        page,
        per_page: 20,
      },
    })

    if (!data?.success) {
      throw new Error(
        data?.message || 'Unable to load notifications.'
      )
    }

    const newNotifications = Array.isArray(data.data)
      ? data.data
      : []

    notifications.value = page === 1
      ? newNotifications
      : [
        ...notifications.value,
        ...newNotifications,
      ]

    currentPage.value = data.meta?.current_page ?? page
    lastPage.value = data.meta?.last_page ?? page

    hasMore.value =
      data.meta?.has_more === true ||
      currentPage.value < lastPage.value

  } catch (error) {
    console.error('Notification API Error:', error)

    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong while loading notifications.'
  } finally {
    isLoading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || isLoading.value) {
    return
  }

  fetchNotifications(currentPage.value + 1)
}

const getNotificationType = (subject) => {
  const value = String(subject || '').toLowerCase()

  return notificationTypes.find(type =>
    type.keywords.some(keyword =>
      value.includes(keyword)
    )
  ) || defaultNotification
}

const getNotificationIcon = (subject) => {
  return getNotificationType(subject).icon
}

const getNotificationIconClass = (subject) => {
  return getNotificationType(subject).className
}

const isToday = (date) => {
  const today = new Date()

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const isYesterday = (date) => {
  const yesterday = new Date()

  yesterday.setDate(
    yesterday.getDate() - 1
  )

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  )
}

const formatNotificationTime = (dateTime) => {
  if (!dateTime) {
    return ''
  }

  const date = new Date(dateTime)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  if (isToday(date)) {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (isYesterday(date)) {
    return `Yesterday, ${date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })}`
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.content-area {
  min-height: 100vh;
  background-color: #f4f5f7;
}

.page-content {
  padding: 12px;
}

.scrollbar-osahan {
  scrollbar-width: none;
}

.scrollbar-osahan::-webkit-scrollbar {
  display: none;
}

.action-btn {
  border-radius: 999px;
  padding: 7px 16px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.primary-action-btn {
  background: #ffc107;
  color: #212529;
  border-color: #ffc107;
}

.primary-action-btn:hover {
  background: #e0a800;
  color: #212529;
}

.secondary-action-btn {
  background: #ffffff;
  color: #495057;
  border: 1px solid #dee2e6;
}

.secondary-action-btn:hover {
  background: #f8f9fa;
  color: #212529;
}

.section-header {
  margin-top: 18px;
  margin-bottom: 8px;
  color: #6c757d;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.notification-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 13px;
  margin-bottom: 8px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.notification-icon {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 17px;
}

.notification-icon.primary {
  background: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.notification-icon.accent {
  background: rgba(111, 66, 193, 0.1);
  color: #6f42c1;
}

.notification-icon.secondary {
  background: rgba(108, 117, 125, 0.12);
  color: #495057;
}

.notification-icon.warning {
  background: rgba(255, 193, 7, 0.15);
  color: #d39e00;
}

.notification-content {
  min-width: 0;
  flex: 1;
}

.notification-title {
  color: #212529;
  font-size: 0.88rem;
  font-weight: 800;
  margin-bottom: 3px;
}

.notification-message {
  color: #6c757d;
  font-size: 0.78rem;
  line-height: 1.45;
  word-break: break-word;
}

.notification-time {
  color: #adb5bd;
  font-size: 0.7rem;
  margin-top: 5px;
}

.empty-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 193, 7, 0.15);
  color: #d39e00;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.fs-8 {
  font-size: 0.72rem;
}

@media (min-width: 768px) {
  .page-content {
    padding: 16px;
  }

  .notification-item {
    padding: 15px;
  }
}
</style>
