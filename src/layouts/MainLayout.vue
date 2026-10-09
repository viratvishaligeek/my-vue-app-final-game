<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <div ref="sidebarElement" class="sidebar" :class="{ active: isSidebarOpen }" id="sidebar">
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
        <router-link to="/dashboard" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">🏠</span>
          <span>Home</span>
        </router-link>

        <router-link to="/wallet" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">💳</span>
          <span>Wallet Transactions</span>
        </router-link>

        <router-link to="/play-history" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">🎮</span>
          <span>Played History</span>
        </router-link>

        <router-link to="/monthly-chart" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">📊</span>
          <span>Monthly Charts</span>
        </router-link>

        <router-link to="/wallet/withdraw" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">💸</span>
          <span>Money Withdraw</span>
        </router-link>

        <router-link to="/withdraw/withdraw/history" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">📜</span>
          <span>Withdraw History</span>
        </router-link>

        <router-link to="/page/terms-conditions" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">📄</span>
          <span>Terms & Conditions</span>
        </router-link>
        <router-link to="/page/how-to-play" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">🎯</span>
          <span>How to Play</span>
        </router-link>
        <router-link to="/page/game-rates" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">📈</span>
          <span>Game Rates</span>
        </router-link>

        <router-link to="/notifications" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">🔔</span>
          <span>Notification</span>
        </router-link>

        <a href="#" class="sidebar-menu-item" @click.prevent="shareApp">
          <span class="icon-3d">🚀</span>
          <span>Share Now</span>
        </a>

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
              <img src="../assets/img/logo.png" style="height: 50px; width: auto;" alt="">
            </div>
            <div class="lh-sm min-width-0">
              <div class="fw-bold text-dark text-truncate brand-title">
                Online Khaiwal
              </div>
              <small class="text-muted d-flex align-items-center gap-1">
                <span class="brand-live-dot"></span>
                Live Market
              </small>
            </div>
          </router-link>
        </div>
        <div class="d-flex align-items-center gap-2">
          <router-link to="/wallet" class="wallet-pill d-flex align-items-center gap-2 px-2 px-sm-3 py-1">
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
        <span class="nav-icon">
          <i class="bi bi-house-door-fill"></i>
        </span>
        <span class="nav-label">Home</span>
      </router-link>

      <router-link to="/wallet" class="nav-item" active-class="active">
        <span class="nav-icon">
          <i class="bi bi-wallet"></i>
        </span>
        <span class="nav-label">Wallet</span>
      </router-link>

      <router-link to="/monthly-chart" class="nav-item" active-class="active">
        <span class="nav-icon">
          <i class="bi bi-calendar"></i>
        </span>
        <span class="nav-label">Chart</span>
      </router-link>

      <router-link to="/page/offers" class="nav-item" active-class="active">
        <span class="nav-icon">
          <i class="bi bi-gift"></i>
        </span>
        <span class="nav-label">Offers</span>
      </router-link>
      <router-link to="/page/whatsapp" class="nav-item whatsapp-item" active-class="active">
        <span class="nav-icon">
          <i class="bi bi-whatsapp"></i>
        </span>
        <span class="nav-label">WhatsApp</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/utils/auth'

const router = useRouter()
const authStore = useAuthStore()

const isSidebarOpen = ref(false)
const isLoggingOut = ref(false)
const sidebarElement = ref(null)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const handleOutsidePointerDown = (event) => {
  if (!isSidebarOpen.value) return
  if (sidebarElement.value?.contains(event.target)) return
  closeSidebar()
}

const handleEscapeKey = (event) => {
  if (event.key === 'Escape') closeSidebar()
}

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsidePointerDown)
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleOutsidePointerDown)
  document.removeEventListener('keydown', handleEscapeKey)
})

const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    await authStore.performLogout()
    router.push({ name: 'login' })
  } finally {
    isLoggingOut.value = false
  }
}
// -------------
const shareApp = () => {
  const appUrl = 'https://google.com/panga'
  const message = `🚀 Hey! Check out this amazing app!
I’ve been using it and thought you might like it too. 😊
Join me here:
${appUrl}
See you there! ❤️`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  closeSidebar()
}
</script>

<style scoped>
/* Keep the sign-out action visible while the menu list scrolls. */
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-sizing: border-box;
}

.sidebar-header {
  flex: 0 0 auto;
}

.sidebar-menu {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.sidebar>.p-3.text-center {
  flex: 0 0 auto;
  padding-bottom: max(12px, env(safe-area-inset-bottom)) !important;
  background: var(--surface, #fff);
  border-top: 1px solid #f0f0f0;
}

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
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background-color: #250f42;
  box-shadow:
    0 3px 8px rgba(255, 193, 7, 0.16);
  font-size: 18px;
  animation: crownFloat 3s ease-in-out infinite;
  border-radius: 50%;
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

/* ----------------------------- */
.bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);

  width: calc(100% - 18px);
  max-width: 560px;

  height: 68px;
  padding: 7px 7px;

  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;

  z-index: 1050;

  background:
    linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 22px;

  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.28),
    0 5px 15px rgba(0, 0, 0, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  isolation: isolate;
}

/* Top shine */

.bottom-nav::before {
  content: '';
  position: absolute;
  left: 10%;
  right: 10%;
  top: 0;

  height: 1px;

  background: linear-gradient(90deg,
      transparent,
      rgba(255, 193, 7, 0.7),
      transparent);

  opacity: 0.7;
}

/* Moving glow */

.bottom-nav::after {
  content: '';
  position: absolute;

  width: 90px;
  height: 90px;

  top: -55px;
  left: 10%;

  border-radius: 50%;

  background: rgba(13, 110, 253, 0.22);

  filter: blur(30px);

  pointer-events: none;

  animation: navGlowMove 7s ease-in-out infinite alternate;
}

@keyframes navGlowMove {
  0% {
    left: 5%;
    opacity: 0.35;
  }

  50% {
    left: 45%;
    opacity: 0.6;
  }

  100% {
    left: 82%;
    opacity: 0.35;
  }
}


/* =========================================================
   NAV ITEM
========================================================= */

.bottom-nav .nav-item {
  position: relative;

  height: 56px;
  min-width: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;

  color: rgba(255, 255, 255, 0.52);

  text-decoration: none;

  border-radius: 17px;

  transition:
    color 0.25s ease,
    transform 0.25s cubic-bezier(.2, .8, .2, 1);
}


/* =========================================================
   ICON
========================================================= */

.bottom-nav .nav-icon {
  position: relative;

  width: 36px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  transition:
    transform 0.3s cubic-bezier(.2, .8, .2, 1),
    background 0.3s ease,
    box-shadow 0.3s ease;
}

.bottom-nav .nav-icon i {
  position: relative;
  z-index: 2;

  font-size: 1.15rem;

  transition:
    transform 0.3s cubic-bezier(.2, .8, .2, 1),
    color 0.25s ease,
    filter 0.25s ease;
}


/* =========================================================
   LABEL
========================================================= */

.bottom-nav .nav-label {
  font-size: 0.58rem;
  line-height: 1;

  font-weight: 700;

  letter-spacing: 0.01em;

  white-space: nowrap;

  transition:
    color 0.25s ease,
    transform 0.25s ease;
}


/* =========================================================
   ACTIVE ITEM
========================================================= */

.bottom-nav .nav-item.active {
  color: #ffc107;
}

.bottom-nav .nav-item.active .nav-icon {
  background:
    linear-gradient(135deg,
      rgba(255, 193, 7, 0.22),
      rgba(255, 193, 7, 0.08));

  box-shadow:
    0 0 0 1px rgba(255, 193, 7, 0.18),
    0 5px 18px rgba(255, 193, 7, 0.18);

  transform: translateY(-3px);
}

.bottom-nav .nav-item.active .nav-icon i {
  color: #ffc107;

  transform: scale(1.12);

  filter:
    drop-shadow(0 0 6px rgba(255, 193, 7, 0.65));
}

.bottom-nav .nav-item.active .nav-label {
  color: #ffc107;

  transform: translateY(-1px);
}


/* Active indicator */

.bottom-nav .nav-item.active::after {
  content: '';

  position: absolute;

  bottom: 1px;
  left: 50%;

  width: 5px;
  height: 5px;

  transform: translateX(-50%);

  border-radius: 50%;

  background: #ffc107;

  box-shadow:
    0 0 7px rgba(255, 193, 7, 0.9),
    0 0 14px rgba(255, 193, 7, 0.55);

  animation: activeDot 1.8s ease-in-out infinite;
}

@keyframes activeDot {

  0%,
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.8;
  }

  50% {
    transform: translateX(-50%) scale(1.45);
    opacity: 1;
  }
}


/* =========================================================
   TAP / HOVER EFFECT
========================================================= */

.bottom-nav .nav-item:active {
  transform: scale(0.9);
}

.bottom-nav .nav-item:active .nav-icon i {
  transform: scale(0.88);
}

@media (hover: hover) {
  .bottom-nav .nav-item:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  .bottom-nav .nav-item:hover .nav-icon {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
  }

  .bottom-nav .nav-item:hover .nav-icon i {
    transform: scale(1.08);
  }

  .bottom-nav .nav-item.active:hover {
    color: #ffc107;
  }

  .bottom-nav .nav-item.active:hover .nav-icon {
    background:
      linear-gradient(135deg,
        rgba(255, 193, 7, 0.28),
        rgba(255, 193, 7, 0.1));
  }
}


/* =========================================================
   WHATSAPP SPECIAL EFFECT
========================================================= */

.bottom-nav .whatsapp-item .nav-icon i {
  color: #25d366;
}

.bottom-nav .whatsapp-item.active .nav-icon {
  background:
    linear-gradient(135deg,
      rgba(37, 211, 102, 0.22),
      rgba(37, 211, 102, 0.06));

  box-shadow:
    0 0 0 1px rgba(37, 211, 102, 0.18),
    0 5px 18px rgba(37, 211, 102, 0.18);
}

.bottom-nav .whatsapp-item.active .nav-icon i {
  color: #25d366;

  filter:
    drop-shadow(0 0 6px rgba(37, 211, 102, 0.65));
}

.bottom-nav .whatsapp-item.active .nav-label {
  color: #25d366;
}


/* =========================================================
   ICON FLOAT ANIMATION
========================================================= */

.bottom-nav .nav-item.active .nav-icon i {
  animation: activeIconFloat 2.2s ease-in-out infinite;
}

@keyframes activeIconFloat {

  0%,
  100% {
    transform: translateY(0) scale(1.1);
  }

  50% {
    transform: translateY(-2px) scale(1.16);
  }
}


/* =========================================================
   MOBILE SAFE AREA
========================================================= */

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-nav {
    bottom: calc(8px + env(safe-area-inset-bottom));
  }
}


/* =========================================================
   VERY SMALL DEVICES
========================================================= */

@media (max-width: 360px) {
  .bottom-nav {
    width: calc(100% - 12px);
    height: 64px;
    bottom: 7px;
    padding: 5px;
    border-radius: 19px;
  }

  .bottom-nav .nav-item {
    height: 52px;
    border-radius: 15px;
  }

  .bottom-nav .nav-icon {
    width: 32px;
    height: 27px;
  }

  .bottom-nav .nav-icon i {
    font-size: 1.05rem;
  }

  .bottom-nav .nav-label {
    font-size: 0.53rem;
  }
}
</style>
