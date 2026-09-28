<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ active: isSidebarOpen }" id="sidebar">
      <div class="sidebar-header">
        <div class="d-flex align-items-center mb-3">
          <div class="user-avatar me-3">
            <i class="bi bi-person"></i>
          </div>
          <div>
            <h6 class="mb-1">{{ authStore.name }}</h6>
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <div class="bg-white px-1 rounded-2">
            <!-- <small>Wallet Amount</small> -->
            <div class="d-flex align-items-center text-danger fw-bold">
              <span class="icon-3d pe-2">💸</span>
              <span>₹ {{ authStore.amount }}</span>
            </div>
          </div>
          <router-link to="/profile" class="btn btn-sm profile-edit-btn rounded-3" @click="closeSidebar">
            <span class="icon-3d pe-2">🛠️</span>
            Edit Profile
          </router-link>
        </div>
      </div>

      <div class="sidebar-menu">
        <!-- Home -->
        <router-link to="/dashboard" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">🏠</span>
          <span>Home</span>
        </router-link>

        <!-- Wallet Transactions -->
        <router-link to="/wallet" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">💳</span>
          <span>Wallet Transactions</span>
        </router-link>

        <!-- Played History -->
        <router-link to="/play-history" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">🎮</span>
          <span>Played History</span>
        </router-link>

        <!-- Monthly Charts -->
        <router-link to="/monthly-chart" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">📊</span>
          <span>Monthly Charts</span>
        </router-link>

        <!-- Money Withdraw -->
        <router-link to="/wallet/withdraw" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">💸</span>
          <span>Money Withdraw</span>
        </router-link>

        <!-- Withdraw History -->
        <router-link to="/withdraw/withdraw/history" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">📜</span>
          <span>Withdraw History</span>
        </router-link>

        <!-- Terms & Conditions -->
        <router-link to="/terms-conditions" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">📄</span>
          <span>Terms & Conditions</span>
        </router-link>

        <!-- How to Play -->
        <router-link to="/how-to-play" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">🎯</span>
          <span>How to Play</span>
        </router-link>

        <!-- Game Rates -->
        <router-link to="/game-rates" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">📈</span>
          <span>Game Rates</span>
        </router-link>

        <!-- Notification -->
        <router-link to="/notifications" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">🔔</span>
          <span>Notification</span>
        </router-link>

        <!-- Share Apps -->
        <router-link to="/share-app" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">🚀</span>
          <span>Share Apps</span>
        </router-link>
      </div>

      <div class="p-3 text-center">
        <button :disabled="isLoggingOut" @click="handleLogout" class="btn btn-outline-danger w-100 rounded-3">
          <span v-if="isLoggingOut" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-box-arrow-right me-2"></i>
          {{ isLoggingOut ? 'Logging out...' : 'Sign Out' }}
        </button>
      </div>
    </div>
    <!-- Overlay -->
    <div class="overlay" :class="{ active: isSidebarOpen }" id="overlay" @click="closeSidebar"></div>

    <div class="app-header sticky-top bg-white border-bottom shadow-sm px-2 py-2">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center min-width-0">
          <button id="menuBtn" type="button"
            class="btn btn-light rounded-circle header-menu-btn d-flex align-items-center justify-content-center p-0"
            @click="toggleSidebar" aria-label="Open menu">
            <i class="bi bi-list fs-4"></i>
          </button>
          <router-link to="/dashboard" class="d-flex align-items-center ms-2 min-width-0">
            <div class="brand-crown me-2">
              <span>👑</span>
            </div>
            <div class="lh-sm min-width-0">
              <div class="fw-bold text-dark text-truncate brand-title">
                Gali Disawar
              </div>
              <small class="text-muted d-flex align-items-center gap-1">
                <span class="brand-live-dot"></span>
                Live Market
              </small>
            </div>
          </router-link>
        </div>
        <div class="d-flex align-items-center gap-2">
          <router-link to="wallet" class="wallet-pill d-flex align-items-center gap-2 px-2 px-sm-3 py-1">
            <div class="wallet-icon">
              <i class="bi bi-wallet2"></i>
            </div>
            <div class="wallet-info lh-1">
              <small class="wallet-label d-block">
                WALLET
              </small>
              <span class="fw-bold text-success wallet-amount">
                ₹ {{ authStore.amount }}
              </span>
            </div>
          </router-link>
          <router-link to="/notifications" class="notification-btn position-relative text-decoration-none"
            aria-label="Notifications">
            <i class="bi bi-bell-fill"></i>
            <span class="notification-dot"></span>
          </router-link>
        </div>

      </div>
    </div>

    <main class="main-body-content">
      <router-view />
    </main>

    <div class="bottom-nav">
      <router-link to="/dashboard" class="nav-item" active-class="active">
        <i class="bi bi-house-door-fill"></i>
        <span>Home</span>
      </router-link>
      <router-link to="/wallet" class="nav-item" active-class="active">
        <i class="bi bi-wallet"></i>
        <span>Wallet</span>
      </router-link>
      <router-link to="/monthly-chart" class="nav-item" active-class="active">
        <i class="bi bi-calendar"></i>
        <span>Chart</span>
      </router-link>
      <router-link to="/offers" class="nav-item" active-class="active">
        <i class="bi bi-gift"></i>
        <span>Offers</span>
      </router-link>
      <router-link to="/" class="nav-item" active-class="active">
        <i class="bi bi-whatsapp"></i>
        <span>Whatsapp</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/utils/auth'

const router = useRouter()
const authStore = useAuthStore()

const isSidebarOpen = ref(false)
const isLoggingOut = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    await authStore.performLogout()
    router.push({ name: 'login' })
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
.sidebar-menu-item .icon-3d {
  font-size: 1.2rem;
  margin-right: 10px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  transition: transform 0.2s ease;
}

.sidebar-menu-item:hover .icon-3d {
  transform: scale(1.15);
}

/* ---------------------------- */
.shimmer-card {
  background: linear-gradient(110deg,
      rgb(98, 2, 235) 20%,
      rgba(255, 255, 255, 0.9) 45%,
      rgba(255, 255, 255, 0.9) 55%,
      rgb(98, 2, 235) 80%);
  background-size: 200% 100%;
  animation: pauseFlash 2s infinite ease-in-out;
}

@keyframes pauseFlash {
  0% {
    background-position: 150%;
  }

  50% {
    background-position: 75%;
  }

  100% {
    background-position: 0%;
  }
}

/* -------------------------------------- */
.app-header {
  position: sticky;
  top: 0;
  /* z-index: 1030; */
  min-height: 58px;
  padding: 7px 10px !important;
  background: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #eeeeee !important;
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.06);
}

.min-width-0 {
  min-width: 0;
}

/* =========================================
   MENU
========================================= */
.header-menu-btn {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #343a40;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.header-menu-btn:active {
  transform: scale(0.90);
  background: #e9f8f0;
  color: #198754;
}

/* =========================================
   BRAND
========================================= */
.brand-crown {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background:
    linear-gradient(135deg,
      #fff3cd,
      #ffe69c);
  box-shadow:
    0 3px 8px rgba(255, 193, 7, 0.16);
  font-size: 18px;
  animation: crownFloat 3s ease-in-out infinite;
}

@keyframes crownFloat {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-2px);
  }
}

.brand-title {
  max-width: 125px;
  font-size: 14px;
  font-weight: 800;
  line-height: 17px;
}

.brand-live-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  display: inline-block;
  border-radius: 50%;
  background: #198754;
  box-shadow:
    0 0 0 3px rgba(25, 135, 84, 0.10);
  animation: livePulse 1.6s infinite;
}

@keyframes livePulse {

  0%,
  100% {
    transform: scale(0.85);
    opacity: 0.7;
  }

  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

/* =========================================
   WALLET
========================================= */
.wallet-pill {
  min-height: 40px;
  flex-shrink: 0;
  border-radius: 50px;
  background:
    linear-gradient(135deg,
      #f0fff6,
      #e5f9ed);
  border: 1px solid rgba(25, 135, 84, 0.18);
  box-shadow:
    0 3px 10px rgba(25, 135, 84, 0.08);
  transition: transform 0.2s ease;
}

.wallet-pill:active {
  transform: scale(0.95);
}

.wallet-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  background:
    linear-gradient(135deg,
      #198754,
      #20c997);
  box-shadow:
    0 3px 7px rgba(25, 135, 84, 0.25);
  font-size: 14px;
}

.wallet-label {
  font-size: 8px;
  font-weight: 800;
  color: #6c757d;
  letter-spacing: 0.4px;
}

.wallet-amount {
  font-size: 14px;
  line-height: 15px;
}

/* =========================================
   NOTIFICATION
========================================= */
.notification-btn {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #495057;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.05);
  font-size: 17px;
  transition: all 0.2s ease;
}

.notification-btn:active {
  transform: scale(0.90);
  color: #dc3545;
  background: #fff5f5;
}

/* Notification indicator */
.notification-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #dc3545;
  border: 2px solid #fff;
  animation: notificationPulse 1.7s infinite;
}

@keyframes notificationPulse {
  0% {
    box-shadow:
      0 0 0 0 rgba(220, 53, 69, 0.45);
  }

  70% {
    box-shadow:
      0 0 0 5px rgba(220, 53, 69, 0);
  }

  100% {
    box-shadow:
      0 0 0 0 rgba(220, 53, 69, 0);
  }
}

/* =========================================
   SMALL MOBILE SCREEN
========================================= */
@media (max-width: 360px) {
  .app-header {
    padding-left: 7px !important;
    padding-right: 7px !important;
  }

  .header-menu-btn {
    width: 39px;
    height: 39px;
  }

  .brand-crown {
    width: 33px;
    height: 33px;
    font-size: 16px;
  }

  .brand-title {
    max-width: 95px;
    font-size: 13px;
  }

  .wallet-pill {
    min-height: 38px;
    padding-left: 6px !important;
    padding-right: 7px !important;
  }

  .wallet-icon {
    width: 28px;
    height: 28px;
  }

  .notification-btn {
    width: 38px;
    height: 38px;
  }
}
</style>
