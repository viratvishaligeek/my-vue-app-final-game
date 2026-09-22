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
            <h6 class="mb-1">Raman Ahuja</h6>
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <div class="bg-white px-1 rounded-2">
            <!-- <small>Wallet Amount</small> -->
            <div class="d-flex align-items-center text-danger fw-bold">
              <span class="icon-3d pe-2">💸</span>
              <span>₹ 2,450</span>
            </div>
          </div>
          <router-link
            to="/profile"
            class="btn btn-sm profile-edit-btn rounded-3"
            @click="closeSidebar"
          >
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
        <router-link to="/wallet-transactions" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">💳</span>
          <span>Wallet Transactions</span>
        </router-link>

        <!-- Played History -->
        <router-link to="/played-history" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">🎮</span>
          <span>Played History</span>
        </router-link>

        <!-- Monthly Charts -->
        <router-link to="/monthly-charts" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">📊</span>
          <span>Monthly Charts</span>
        </router-link>

        <!-- Money Withdraw -->
        <router-link to="/money-withdraw" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">💸</span>
          <span>Money Withdraw</span>
        </router-link>

        <!-- Withdraw History -->
        <router-link to="/withdraw-history" class="sidebar-menu-item" @click="closeSidebar">
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

        <!-- Bank Details -->
        <router-link to="/bank-details" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">🏦</span>
          <span>Bank Details</span>
        </router-link>

        <!-- Share Apps -->
        <router-link to="/share-app" class="sidebar-menu-item" @click="closeSidebar">
          <span class="icon-3d">🚀</span>
          <span>Share Apps</span>
        </router-link>
      </div>

      <div class="p-3 text-center">
        <button @click="handleSignOut" class="btn btn-outline-danger w-100 rounded-3">
          <i class="bi bi-box-arrow-right me-2"></i> Sign Out
        </button>
      </div>
    </div>
    <!-- Overlay -->
    <div
      class="overlay"
      :class="{ active: isSidebarOpen }"
      id="overlay"
      @click="closeSidebar"
    ></div>

    <!-- App Header -->
    <div class="app-header d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <button id="menuBtn" class="btn menu-btn" @click="toggleSidebar">
          <i class="bi bi-list menu-icon"></i>
        </button>
        <div class="d-flex align-items-center ms-2">
          <span class="app-header-title fw-bold fs-5 pe-2"> 👑 </span>
          <span class="app-header-title fw-bold fs-5">Gali Disawar</span>
        </div>
      </div>
      <div
        class="shimmer-card"
        style="padding: 9px 20px 2px 20px; border: 1px solid gray; border-radius: 51px"
      >
        <h4 class="fw-bold"><i class="bi bi-wallet"></i> ₹55</h4>
      </div>
      <!-- <div>
        <router-link to="/notifications" class="btn header-btn me-2">
          <i class="">🔔</i>
        </router-link>
      </div> -->
    </div>

    <!-- Main Content Area (Dynamic Child Component Area) -->
    <main class="main-body-content">
      <router-view />
    </main>

    <!-- Bottom Navigation Bar -->
    <div class="bottom-nav">
      <router-link to="/dashboard" class="nav-item" active-class="active">
        <i class="bi bi-house-door-fill"></i>
        <span>Home</span>
      </router-link>
      <router-link to="/search" class="nav-item" active-class="active">
        <i class="bi bi-search"></i>
        <span>Search</span>
      </router-link>
      <router-link to="/my-bookings" class="nav-item" active-class="active">
        <i class="bi bi-ticket-perforated"></i>
        <span>My Tickets</span>
      </router-link>
      <router-link to="/offers" class="nav-item" active-class="active">
        <i class="bi bi-gift"></i>
        <span>Offers</span>
      </router-link>
      <router-link to="/profile" class="nav-item" active-class="active">
        <i class="bi bi-person"></i>
        <span>Profile</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

// Complete Sign Out Logic
const handleSignOut = () => {
  localStorage.removeItem('auth_token')
  sessionStorage.removeItem('auth_token')
  closeSidebar()
  router.push('/')
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
  background: linear-gradient(
    110deg,
    rgb(98, 2, 235) 20%,
    rgba(255, 255, 255, 0.9) 45%,
    rgba(255, 255, 255, 0.9) 55%,
    rgb(98, 2, 235) 80%
  );
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
</style>
