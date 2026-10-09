<template>
  <div class="container py-3 referral-page">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h4 class="fw-bold mb-1">Refer & Earn</h4>
        <p class="text-muted small mb-0">Invite friends and earn a wallet reward on their first successful deposit.</p>
      </div>
      <span class="referral-icon">🎁</span>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="success" class="alert alert-success">{{ success }}</div>

    <div v-if="loading" class="text-center py-5">
      <span class="spinner-border spinner-border-sm text-success me-2"></span>Loading referral details...
    </div>

    <template v-else>
      <section class="card border-0 shadow-sm rounded-4 mb-3">
        <div class="card-body p-4">
          <div class="text-muted small fw-semibold mb-2">YOUR REFERRAL CODE</div>
          <div class="d-flex align-items-center gap-2">
            <div class="referral-code flex-grow-1">{{ data.referral_code || '—' }}</div>
            <button class="btn btn-outline-success" type="button" @click="copyText(data.referral_code)" :disabled="!data.referral_code">
              <i class="bi bi-copy me-1"></i>Copy
            </button>
          </div>
          <div class="mt-3">
            <label class="form-label small fw-semibold" for="shareUrl">Referral sharing link</label>
            <div class="input-group">
              <input id="shareUrl" class="form-control" :value="data.share_url || ''" readonly>
              <button class="btn btn-outline-success" type="button" @click="copyText(data.share_url)" :disabled="!data.share_url">Copy link</button>
            </div>
          </div>
          <button class="btn btn-success w-100 mt-3 py-2" type="button" @click="shareReferral">
            <i class="bi bi-share-fill me-2"></i>Share referral link
          </button>
          <p class="small text-muted mt-3 mb-0">
            Reward: {{ data.referral_percentage }}% of your friend's first successful deposit, with a minimum of ₹{{ money(data.referral_min_amount) }}.
          </p>
        </div>
      </section>

      <div class="row g-3 mb-3">
        <div class="col-6">
          <div class="card border-0 shadow-sm rounded-4 h-100"><div class="card-body">
            <div class="small text-muted">Friends referred</div>
            <div class="fs-3 fw-bold">{{ data.total_referrals || 0 }}</div>
          </div></div>
        </div>
        <div class="col-6">
          <div class="card border-0 shadow-sm rounded-4 h-100"><div class="card-body">
            <div class="small text-muted">Total rewards</div>
            <div class="fs-3 fw-bold text-success">₹{{ money(data.total_reward) }}</div>
          </div></div>
        </div>
      </div>

      <section v-if="data.can_apply_code" class="card border-0 shadow-sm rounded-4 mb-3">
        <div class="card-body p-4">
          <h6 class="fw-bold">Have a referral code?</h6>
          <p class="small text-muted">You can apply or change the code only before your first successful deposit.</p>
          <form class="d-flex gap-2" @submit.prevent="applyCode">
            <input v-model.trim="applyCodeValue" class="form-control text-uppercase" maxlength="32" placeholder="Enter referral code" required>
            <button class="btn btn-dark" type="submit" :disabled="applying || !applyCodeValue">
              {{ applying ? 'Applying…' : 'Apply' }}
            </button>
          </form>
          <div v-if="data.applied_referral_code" class="small text-success mt-2">
            Current code: {{ data.applied_referral_code }}. You may change it before your first deposit.
          </div>
        </div>
      </section>
      <div v-else-if="data.applied_referral_code" class="alert alert-light border rounded-3 small">
        Referral code <strong>{{ data.applied_referral_code }}</strong> is locked because the first successful deposit has been made.
      </div>

      <section class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-3">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h6 class="fw-bold mb-0">People you referred</h6>
            <button class="btn btn-sm btn-light" type="button" @click="loadData" aria-label="Refresh referrals"><i class="bi bi-arrow-clockwise"></i></button>
          </div>
          <div v-if="!data.referrals?.length" class="text-center py-4">
            <div class="fs-2 mb-2">👥</div>
            <div class="fw-semibold">No referrals yet</div>
            <div class="small text-muted">Share your link to invite your first friend.</div>
          </div>
          <div v-else class="referral-list">
            <article v-for="person in data.referrals" :key="person.id" class="referral-row">
              <div class="min-width-0">
                <div class="fw-semibold text-truncate">{{ person.name || 'User' }}</div>
                <div class="small text-muted">{{ person.phone || 'Phone unavailable' }}</div>
                <div class="small text-muted">First deposit: {{ person.first_deposit_at ? new Date(person.first_deposit_at).toLocaleDateString() : 'Not made yet' }}</div>
              </div>
              <div class="text-end">
                <div class="small text-muted">Deposit</div>
                <div class="fw-semibold">{{ person.first_deposit_amount == null ? '—' : '₹' + money(person.first_deposit_amount) }}</div>
                <div class="small text-success fw-bold">{{ person.reward_amount == null ? 'Reward pending' : '+₹' + money(person.reward_amount) }}</div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '@/plugins/axios'

const loading = ref(true)
const applying = ref(false)
const applyCodeValue = ref('')
const error = ref('')
const success = ref('')
const data = reactive({
  referral_code: '',
  share_url: '',
  referral_percentage: 2,
  referral_min_amount: 10,
  total_referrals: 0,
  total_reward: 0,
  referrals: [],
  applied_referral_code: null,
  can_apply_code: false,
})

const money = (value) => Number(value || 0).toFixed(2)

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/referrals')
    Object.assign(data, response.data?.data || {})
    applyCodeValue.value = data.applied_referral_code || ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to load referral details. Please try again.'
  } finally {
    loading.value = false
  }
}

async function copyText(value) {
  if (!value) return
  try {
    await navigator.clipboard.writeText(value)
    success.value = 'Copied to clipboard.'
    error.value = ''
  } catch {
    const field = document.createElement('textarea')
    field.value = value
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.select()
    const copied = document.execCommand('copy')
    field.remove()
    if (copied) success.value = 'Copied to clipboard.'
    else error.value = 'Could not copy automatically. Please select and copy the text.'
  }
}

async function shareReferral() {
  if (!data.share_url) return
  const message = `Join me on the app using my referral code ${data.referral_code}. ${data.share_url}`
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Refer & Earn', text: message, url: data.share_url })
      return
    } catch (err) {
      if (err?.name === 'AbortError') return
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
}

async function applyCode() {
  applying.value = true
  error.value = ''
  success.value = ''
  try {
    const response = await api.post('/referrals/apply', { referral_code: applyCodeValue.value.toUpperCase() })
    success.value = response.data?.message || 'Referral code applied.'
    await loadData()
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.errors?.referral_code?.[0] || 'Could not apply this referral code.'
  } finally {
    applying.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.referral-page { max-width: 760px; }
.referral-icon { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 16px; background: #e7f8f0; font-size: 24px; }
.referral-code { min-width: 0; padding: 12px 14px; border: 1px dashed #08a477; border-radius: 12px; background: #f3fcf8; color: #087c58; font-size: 21px; font-weight: 800; letter-spacing: 2px; overflow-wrap: anywhere; text-align: center; }
.referral-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 13px 0; border-bottom: 1px solid #edf0ef; }
.referral-row:last-child { border-bottom: 0; }
</style>
