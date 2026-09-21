<template>
  <!-- Main Content Area -->
  <div class="content-area">
    <!-- Slideshow Hero Banner -->
    <div id="heroCarousel" class="carousel slide m-1 mb-2" data-bs-ride="carousel">
      <div class="carousel-indicators" v-if="banners.length > 1">
        <button
          v-for="(banner, index) in banners"
          :key="banner.id"
          type="button"
          data-bs-target="#heroCarousel"
          :data-bs-slide-to="index"
          :class="{ active: index === 0 }"
          :aria-current="index === 0 ? 'true' : undefined"
        ></button>
      </div>
      <div class="carousel-inner rounded-3">
        <div
          v-for="(banner, index) in banners"
          :key="banner.id"
          class="carousel-item"
          :class="{ active: index === 0 }"
        >
          <img :src="banner.imageUrl" class="d-block w-100" :alt="banner.title || 'Hero Banner'" />
        </div>
      </div>
    </div>

    <!-- 3 Action Buttons (Aamne-Samne) -->
    <div class="row g-2 mb-4 ms-2 me-2">
      <div class="col-4">
        <button class="btn btn-app w-100 text-truncate">Button 1</button>
      </div>
      <div class="col-4">
        <button class="btn btn-app w-100 text-truncate">Button 2</button>
      </div>
      <div class="col-4">
        <button class="btn btn-app w-100 text-truncate">Button 3</button>
      </div>
    </div>

    <!-- Popular Routes (Horizontal Scrollable) -->
    <h6 class="section-header">Popular Routes</h6>
    <div class="scroll-container ms-3">
      <router-link to="/bus-listing" class="scroll-item">
        <div class="route-visual">
          <div class="route-point start"></div>
          <div class="route-line"></div>
          <div class="route-point end"></div>
          <div class="route-cities">
            <div class="fw-semibold">NYC</div>
            <div class="fw-semibold">Boston</div>
          </div>
        </div>
        <div class="mt-3">
          <div class="fw-bold text-primary-color">$45</div>
          <div class="d-flex align-items-center mt-1">
            <i class="bi bi-clock me-1 fs-12 text-secondary-color"></i>
            <span class="text-muted small">4h 30m</span>
          </div>
        </div>
      </router-link>

      <router-link to="/bus-listing" class="scroll-item">
        <div class="route-visual">
          <div class="route-point start"></div>
          <div class="route-line"></div>
          <div class="route-point end"></div>
          <div class="route-cities">
            <div class="fw-semibold">Boston</div>
            <div class="fw-semibold">DC</div>
          </div>
        </div>
        <div class="mt-3">
          <div class="fw-bold text-primary-color">$65</div>
          <div class="d-flex align-items-center mt-1">
            <i class="bi bi-clock me-1 fs-12 text-secondary-color"></i>
            <span class="text-muted small">8h 15m</span>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Recent Searches -->
    <h6 class="section-header">Recent Searches</h6>
    <router-link to="/bus-listing" class="route-card d-block">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <div class="d-flex align-items-center">
            <span class="fw-semibold text-primary-color">NYC</span>
            <i class="bi bi-arrow-right mx-2 text-secondary-color"></i>
            <span class="fw-semibold text-primary-color">Boston</span>
          </div>
          <div class="d-flex align-items-center mt-2">
            <i class="bi bi-calendar3 me-2 fs-12 text-secondary-color"></i>
            <span class="text-muted small">Apr 15, 2025</span>
          </div>
        </div>
        <div class="btn btn-light-2">
          <i class="bi bi-search"></i>
        </div>
      </div>
    </router-link>

    <router-link to="/bus-listing" class="route-card d-block">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <div class="d-flex align-items-center">
            <span class="fw-semibold text-primary-color">DC</span>
            <i class="bi bi-arrow-right mx-2 text-secondary-color"></i>
            <span class="fw-semibold text-primary-color">Philly</span>
          </div>
          <div class="d-flex align-items-center mt-2">
            <i class="bi bi-calendar3 me-2 fs-12 text-secondary-color"></i>
            <span class="text-muted small">Apr 10, 2025</span>
          </div>
        </div>
        <div class="btn btn-light-2">
          <i class="bi bi-search"></i>
        </div>
      </div>
    </router-link>

    <!-- Special Offers -->
    <h6 class="section-header">Special Offers</h6>
    <router-link to="/offers-rewards" class="offer-card d-block">
      <span class="offer-badge">20% OFF</span>
      <div class="d-flex align-items-center">
        <div class="icon-50 d-flex align-items-center justify-content-center rounded-3 gradient-1">
          <i class="bi bi-ticket-perforated text-white fs-24"></i>
        </div>
        <div class="ms-3">
          <div class="fw-semibold text-primary-color">Weekend Special</div>
          <div class="text-muted small">20% off on all weekend trips</div>
          <div class="mt-1 text-accent-color fs-11">
            <i class="bi bi-clock-history me-1"></i>Valid until Apr 30
          </div>
        </div>
      </div>
    </router-link>

    <router-link to="/offers-rewards" class="offer-card d-block mb-4">
      <span class="offer-badge">$10 OFF</span>
      <div class="d-flex align-items-center">
        <div class="icon-50 d-flex align-items-center justify-content-center rounded-3 gradient-2">
          <i class="bi bi-gift text-white fs-24"></i>
        </div>
        <div class="ms-3">
          <div class="fw-semibold text-primary-color">First Trip Discount</div>
          <div class="text-muted small">$10 off on your first booking</div>
          <div class="mt-1 text-accent-color fs-11">
            <i class="bi bi-person-plus me-1"></i>New users only
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Hero Banner Images (Static Fallback URLs)
const banners = ref([
  {
    id: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    title: 'Banner 1',
  },
  {
    id: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    title: 'Banner 2',
  },
  {
    id: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    title: 'Banner 3',
  },
])

// API Fetching Logic
const fetchBanners = async () => {
  try {
    const response = await axios.get('https://api.example.com/v1/banners')
    if (response.data && response.data.length > 0) {
      banners.value = response.data
    }
  } catch (error) {
    console.log('API fetch failed, static banners load ho rahe hain.')
  }
}

onMounted(() => {
  fetchBanners()
})
</script>
