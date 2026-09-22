<template>
  <div class="content-area">
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

    <div class="row m-2">
      <div class="col-12 border">
        <marquee class="mt-2 fw-bold">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Labore maxime nulla voluptas eum
        </marquee>
      </div>
    </div>
    <div class="row g-2 mb-4 ms-2 me-2">
      <div class="col-4">
        <button class="btn btn-app btn-add-money w-100 text-truncate">
          <span class="icon-3d">💰</span>
          <span> Add Money </span>
        </button>
      </div>
      <div class="col-4">
        <button class="btn btn-app btn-withdraw w-100 text-truncate">
          <span class="icon-3d">💸</span> Withdraw
        </button>
      </div>
      <div class="col-4">
        <button class="btn btn-app btn-support w-100 text-truncate">
          <span class="icon-3d">🎧</span> Support
        </button>
      </div>
      <h6 class="p-1 pb-0 text-black fw-bold">🗓️ Today's Result</h6>
      <div class="col-12 pt-0 pb-0 px-3 text-center">
        <div class="live-result-box">
          <div class="horizontal-result-content">
            <h4 class="city-name mb-0">Faridabad</h4>
            <span class="live-tag"> <span class="live-dot"></span> Live Result </span>
            <h3 class="result-number mb-0">65</h3>
          </div>
        </div>
      </div>
    </div>
    <h3 class="p-1 pt-0 text-black fw-bold">📊 Live Market</h3>
    <div class="row g-3 ms-2 me-2">
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden custom-card card-purple">
          <div class="bg-white p-3 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-geo-alt-fill fs-2 icon-color"></i>
              <div>
                <h6 class="fw-bold text-dark mb-0 text-uppercase fs-3">Gali</h6>
                <span class="small fw-semibold text-success d-flex align-items-center gap-1">
                  <span class="dot-running"></span> RUNNING
                </span>
              </div>
            </div>

            <div class="text-center">
              <div class="fw-bold fs-3 text-dark">34</div>
              <div class="text-danger small fw-semibold">07m 27s left</div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <router-link
                to="/monthly-charts"
                class="btn btn-light border btn-sm px-2 py-1 rounded-3 fw-semibold text-secondary d-none d-sm-inline-block"
              >
                <i class="bi bi-bar-chart-line me-1"></i> Chart
              </router-link>
              <router-link
                to="/play-game"
                class="btn btn-success btn-sm px-3 py-2 rounded-pill fw-bold d-flex align-items-center gap-1 shadow-sm"
              >
                <i class="bi bi-play-circle-fill fs-4"></i> Play
              </router-link>
            </div>
          </div>

          <div
            class="bg-success text-white px-3 py-2 d-flex justify-content-between align-items-center fs-7 fw-semibold"
          >
            <span>Last Result : 56</span>
            <span>RESULT TIME : 10:00 PM</span>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden custom-card card-blue">
          <div class="bg-white p-3 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-geo-alt-fill fs-2 icon-color"></i>
              <div>
                <h6 class="fw-bold text-dark mb-0 text-uppercase fs-3">Disawar</h6>
                <span class="small fw-semibold text-success d-flex align-items-center gap-1">
                  <span class="dot-running"></span> RUNNING
                </span>
              </div>
            </div>

            <div class="text-center">
              <div class="fw-bold fs-3 text-dark">12</div>
              <div class="text-danger small fw-semibold">1h 02m 27s left</div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <router-link
                to="/monthly-charts"
                class="btn btn-light border btn-sm px-2 py-1 rounded-3 fw-semibold text-secondary d-none d-sm-inline-block"
              >
                <i class="bi bi-bar-chart-line me-1"></i> Chart
              </router-link>
              <router-link
                to="/play-game"
                class="btn btn-success btn-sm px-3 py-2 rounded-pill fw-bold d-flex align-items-center gap-1 shadow-sm"
              >
                <i class="bi bi-play-circle-fill fs-4"></i> Play
              </router-link>
            </div>
          </div>

          <div
            class="bg-success text-white px-3 py-2 d-flex justify-content-between align-items-center fs-7 fw-semibold"
          >
            <span>Last Result : 89</span>
            <span>RESULT TIME : 11:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const banners = ref([
  {
    id: 1,
    imageUrl:
      'https://thumbs.dreamstime.com/b/concept-ecommerce-website-marketing-shopping-online-store-online-purchase-e-payment-online-order-discount-coupon-118004198.jpg',
    title: 'Banner 1',
  },
  {
    id: 2,
    imageUrl:
      'https://thumbs.dreamstime.com/b/e-commerce-web-banner-vector-template-business-woman-business-suit-sitting-computer-office-doing-vector-84831641.jpg',
    title: 'Banner 2',
  },
  {
    id: 3,
    imageUrl:
      'https://thumbs.dreamstime.com/b/flat-line-design-website-banner-e-commerce-modern-vector-illustration-web-marketing-print-material-68581557.jpg',
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

<style scoped>
.btn-app {
  position: relative;
  overflow: hidden;
  border: none;
  font-weight: 600;
  padding: 12px 8px;
  border-radius: 12px;
  color: #ffffff !important;
  box-shadow:
    0 6px 15px rgba(0, 0, 0, 0.15),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  z-index: 1;
}

.btn-app::before {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 150%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    rgba(255, 255, 255, 0.8),
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transform: skewX(-20deg);
  animation: lightningShine 3.5s infinite linear;
  z-index: -1;
}

@keyframes lightningShine {
  0% {
    left: 0%;
  }
  20% {
    left: 150%;
  }
  100% {
    left: 150%;
  }
}

.btn-add-money {
  background: linear-gradient(135deg, #00b09b, #96c93d);
}

.btn-withdraw {
  background: linear-gradient(135deg, #ff416c, #ff4b2b);
}

.btn-support {
  background: linear-gradient(135deg, #2193b0, #6dd5ed);
}

@keyframes infinityFloat {
  0% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-4px) rotate(-3deg) scale(1.05);
  }
  50% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  75% {
    transform: translateY(4px) rotate(3deg) scale(1.05);
  }
  100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
}

.icon-3d {
  font-size: 1.2rem;
  display: inline-block;
  filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.3));
  animation: infinityFloat 3s infinite ease-in-out;
}

.btn-app:hover {
  transform: translateY(-3px);
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.25),
    inset 0 2px 5px rgba(255, 255, 255, 0.4);
}

.btn-app:active {
  transform: translateY(1px);
}

.live-result-box {
  background: linear-gradient(135deg, #ff9900, #ff5e00);
  border-radius: 16px;
  padding: 18px 20px;
  color: #ffffff;
  box-shadow:
    0 8px 25px rgba(255, 120, 0, 0.35),
    inset 0 2px 4px rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;
}

.live-result-box:hover {
  transform: translateY(-3px);
  box-shadow:
    0 12px 30px rgba(255, 120, 0, 0.45),
    inset 0 2px 6px rgba(255, 255, 255, 0.5);
}

.horizontal-result-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.city-name {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.live-tag {
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.95;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.15);
  padding: 4px 10px;
  border-radius: 20px;
}

.live-dot {
  width: 8px;
  height: 8px;
  background-color: #00ff66;
  border-radius: 50%;
  box-shadow: 0 0 8px #00ff66;
  animation: pulseDot 1.5s infinite;
}

.result-number {
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: 1px;
  color: #ffffff;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

@keyframes pulseDot {
  0% {
    transform: scale(0.95);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
  100% {
    transform: scale(0.95);
    opacity: 1;
  }
}
/* ---------------------------------------- */
.custom-card {
  border-left: 6px solid #198754 !important;
}
.card-purple {
  border-left-color: #8a2be2 !important;
}
.card-purple .icon-color {
  color: #8a2be2;
}
.card-blue {
  border-left-color: #0d6efd !important;
}
.card-blue .icon-color {
  color: #0d6efd;
}
.card-pink {
  border-left-color: #e83e8c !important;
}
.card-pink .icon-color {
  color: #e83e8c;
}
.card-orange {
  border-left-color: #fd7e14 !important;
}
.card-orange .icon-color {
  color: #fd7e14;
}
.bg-success {
  background-color: #007a53 !important;
}
.fs-7 {
  font-size: 12px;
}
.dot-running {
  width: 7px;
  height: 7px;
  background-color: #198754;
  border-radius: 50%;
  display: inline-block;
}
</style>
