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
            <h6 class="mb-1">Alex Johnson</h6>
            <p class="mb-0 small">Premium Member</p>
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <small>Travel Points</small>
            <div class="d-flex align-items-center">
              <i class="bi bi-star-fill me-1 points-icon"></i>
              <span>2,450</span>
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
        <router-link to="/dashboard" class="sidebar-menu-item" @click="closeSidebar">
          <i class="bi bi-house-door"></i>
          <span>Home</span>
        </router-link>
        <router-link to="/bus-listing" class="sidebar-menu-item" @click="closeSidebar">
          <i class="bi bi-list"></i>
          <span>Bus Listing</span>
        </router-link>
        <router-link to="/not-available" class="sidebar-menu-item" @click="closeSidebar">
          <i class="bi bi-emoji-frown"></i>
          <span>Not Available</span>
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
          <i class="bi bi-bus-front me-2 app-header-icon"></i>
          <span class="app-header-title fw-bold fs-5">BusGo</span>
        </div>
      </div>
      <div>
        <router-link to="/notifications" class="btn header-btn me-2">
          <i class="bi bi-bell icon-md"></i>
        </router-link>
        <router-link to="/profile" class="btn header-btn">
          <i class="bi bi-person-circle icon-md"></i>
        </router-link>
      </div>
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
