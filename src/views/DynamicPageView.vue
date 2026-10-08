<template>
  <div class="content-area pb-5 mb-5 dynamic-page-bg">
    <div class="container-fluid px-2 px-md-3 py-3">
      <!-- Loading -->
      <div v-if="isLoading" class="page-card loading-card">
        <div class="spinner-border text-warning"></div>

        <p class="text-muted mb-0 mt-3">
          Loading page...
        </p>
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="page-card error-card">
        <div class="error-icon">
          <i class="bi bi-exclamation-triangle-fill"></i>
        </div>

        <h5 class="fw-bold mb-2">
          Page unavailable
        </h5>

        <p class="text-muted mb-3">
          {{ errorMessage }}
        </p>

        <router-link
          to="/dashboard"
          class="btn btn-warning rounded-pill px-4 fw-bold"
        >
          <i class="bi bi-house-fill me-1"></i>
          Back Home
        </router-link>
      </div>

      <!-- Content -->
      <template v-else-if="page">
        <div class="page-card overflow-hidden">

          <!-- Header -->
          <div class="page-header">
            <div class="page-header-icon">
              <i class="bi bi-file-earmark-text-fill"></i>
            </div>

            <div class="flex-grow-1">
              <div class="page-kicker">
                Information
              </div>

              <h1 class="page-title">
                {{ page.name }}
              </h1>
            </div>
          </div>

          <!-- CMS Content -->
          <div
            class="cms-content"
            v-html="page.content"
          ></div>

        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/plugins/axios'

const route = useRoute()

const page = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const fetchPage = async () => {
  const slug = String(route.params.slug || '').trim()

  if (!slug) {
    errorMessage.value = 'Invalid page.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  page.value = null

  try {
    const response = await api.get(`/pages/${encodeURIComponent(slug)}`)

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Unable to load page.'
      )
    }

    page.value = response.data.data
  } catch (error) {
    console.error('CMS PAGE ERROR:', error)

    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      'Unable to load page.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPage)

watch(
  () => route.params.slug,
  () => {
    fetchPage()
  }
)
</script>

<style scoped>
.dynamic-page-bg {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at top right,
      rgba(255, 193, 7, 0.08),
      transparent 30%
    ),
    #f5f6f8;
}

.page-card {
  max-width: 900px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}

.page-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  color: #ffffff;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-light)
  );
}

.page-header::after {
  content: '';
  position: absolute;
  width: 150px;
  height: 150px;
  right: -60px;
  top: -80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.page-header-icon {
  position: relative;
  z-index: 1;

  width: 48px;
  height: 48px;

  flex: 0 0 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 15px;

  color: #212529;
  background: #ffc107;

  font-size: 1.25rem;

  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.15);
}

.page-kicker {
  position: relative;
  z-index: 1;

  margin-bottom: 2px;

  color: rgba(255, 255, 255, 0.65);

  font-size: 0.68rem;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.page-title {
  position: relative;
  z-index: 1;

  margin: 0;

  color: #ffffff;

  font-size: 1.25rem;
  line-height: 1.25;
  font-weight: 800;
}

.cms-content {
  padding: 20px;

  color: #343a40;

  font-size: 0.94rem;
  line-height: 1.75;

  overflow-wrap: anywhere;
}

.cms-content :deep(h1),
.cms-content :deep(h2),
.cms-content :deep(h3),
.cms-content :deep(h4) {
  margin-top: 1.4rem;
  margin-bottom: 0.7rem;

  color: #212529;
  font-weight: 800;
  line-height: 1.3;
}

.cms-content :deep(h1) {
  font-size: 1.5rem;
}

.cms-content :deep(h2) {
  font-size: 1.3rem;
}

.cms-content :deep(h3) {
  font-size: 1.1rem;
}

.cms-content :deep(p) {
  margin-bottom: 1rem;
}

.cms-content :deep(ul),
.cms-content :deep(ol) {
  padding-left: 1.25rem;
  margin-bottom: 1rem;
}

.cms-content :deep(li) {
  margin-bottom: 0.45rem;
}

.cms-content :deep(a) {
  color: var(--primary-color);
  font-weight: 700;
}

.cms-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
}

.cms-content :deep(table) {
  width: 100%;
  margin-bottom: 1rem;
  border-collapse: collapse;
}

.cms-content :deep(th),
.cms-content :deep(td) {
  padding: 8px;
  border: 1px solid #dee2e6;
}

.loading-card,
.error-card {
  padding: 50px 20px;
  text-align: center;
}

.error-icon {
  width: 55px;
  height: 55px;

  margin: 0 auto 15px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);

  font-size: 1.4rem;
}

@media (max-width: 576px) {
  .page-card {
    border-radius: 16px;
  }

  .page-header {
    padding: 16px;
  }

  .page-header-icon {
    width: 42px;
    height: 42px;
    flex-basis: 42px;
    border-radius: 12px;
  }

  .page-title {
    font-size: 1.05rem;
  }

  .cms-content {
    padding: 16px;
    font-size: 0.9rem;
    line-height: 1.7;
  }
}
</style>
