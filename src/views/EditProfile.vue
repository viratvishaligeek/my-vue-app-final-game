<template>
  <main class="profile-page container-fluid">
    <header class="profile-heading">
      <div class="profile-heading__icon" aria-hidden="true"><i class="bi bi-person-bounding-box"></i></div>
      <div class="profile-heading__copy">
        <p class="profile-eyebrow">YOUR ACCOUNT</p>
        <h1>Profile &amp; Security</h1>
        <p class="profile-subtitle">Keep your personal details up to date and your account secure.</p>
      </div>
      <div class="wallet-chip" aria-label="Wallet balance">
        <span class="wallet-chip__icon"><i class="bi bi-wallet2"></i></span>
        <span><small>Wallet balance</small><strong>₹ {{ authStore.walletBalance ?? 0 }}</strong></span>
      </div>
    </header>

    <div class="profile-layout">
      <section class="profile-card profile-card--details" aria-labelledby="profile-title">
        <div class="profile-card__header">
          <div class="section-icon section-icon--blue"><i class="bi bi-person-lines-fill"></i></div>
          <div><h2 id="profile-title">Personal information</h2><p>Update the details linked to your account.</p></div>
        </div>

        <div v-if="profileStatus.text" class="profile-alert" :class="'profile-alert--' + profileStatus.type" role="status" aria-live="polite">
          <i :class="profileStatus.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
          <span>{{ profileStatus.text }}</span>
          <button type="button" class="alert-dismiss" aria-label="Dismiss message" @click="profileStatus.text = ''"><i class="bi bi-x-lg"></i></button>
        </div>

        <form class="profile-form" novalidate @submit.prevent="handleUpdateProfile">
          <div class="form-field">
            <label for="profile-name">Full name <span class="required-mark">*</span></label>
            <div class="input-wrap">
              <i class="bi bi-person input-icon" aria-hidden="true"></i>
              <input id="profile-name" v-model.trim="profileForm.name" type="text" class="form-control profile-input"
                :class="{ 'is-invalid': errors.name }" placeholder="Enter your full name" autocomplete="name"
                maxlength="255" required @input="clearProfileError('name')" />
            </div>
            <small v-if="errors.name" class="field-error">{{ errors.name }}</small>
          </div>

          <div class="form-field">
            <label for="profile-phone">Registered phone number</label>
            <div class="input-wrap input-wrap--readonly">
              <i class="bi bi-phone input-icon" aria-hidden="true"></i>
              <input id="profile-phone" :value="authStore.user?.phone || ''" type="tel" class="form-control profile-input"
                autocomplete="tel" readonly aria-describedby="phone-help" />
              <i class="bi bi-lock-fill readonly-lock" aria-hidden="true"></i>
            </div>
            <small id="phone-help" class="field-hint">Your registered number cannot be changed here.</small>
          </div>

          <div class="profile-form__row">
            <div class="form-field">
              <label for="profile-gender">Gender</label>
              <div class="input-wrap">
                <i class="bi bi-person-hearts input-icon" aria-hidden="true"></i>
                <select id="profile-gender" v-model="profileForm.gender" class="form-select profile-input profile-select"
                  :class="{ 'is-invalid': errors.gender }" @change="clearProfileError('gender')">
                  <option value="">Select gender</option><option value="male">Male</option>
                  <option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
              <small v-if="errors.gender" class="field-error">{{ errors.gender }}</small>
            </div>

            <div class="form-field">
              <label for="profile-city">City</label>
              <div class="input-wrap">
                <i class="bi bi-geo-alt input-icon" aria-hidden="true"></i>
                <input id="profile-city" v-model.trim="profileForm.city" type="text" class="form-control profile-input"
                  :class="{ 'is-invalid': errors.city }" placeholder="Your city" autocomplete="address-level2"
                  maxlength="255" @input="clearProfileError('city')" />
              </div>
              <small v-if="errors.city" class="field-error">{{ errors.city }}</small>
            </div>
          </div>

          <div class="form-field">
            <label for="profile-address">Address <span class="optional-label">Optional</span></label>
            <div class="input-wrap input-wrap--textarea">
              <i class="bi bi-house input-icon" aria-hidden="true"></i>
              <textarea id="profile-address" v-model.trim="profileForm.address" class="form-control profile-input profile-textarea"
                :class="{ 'is-invalid': errors.address }" rows="3" placeholder="Enter your address"
                autocomplete="street-address" maxlength="1000" @input="clearProfileError('address')"></textarea>
            </div>
            <small v-if="errors.address" class="field-error">{{ errors.address }}</small>
          </div>

          <div class="profile-form__footer">
            <p class="save-note"><i class="bi bi-shield-check"></i> Your details are handled securely.</p>
            <button type="submit" class="profile-button profile-button--primary" :disabled="isProfileLoading">
              <span v-if="isProfileLoading" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
              <i v-else class="bi bi-check2-circle" aria-hidden="true"></i>
              {{ isProfileLoading ? 'Saving changes…' : 'Save changes' }}
            </button>
          </div>
        </form>
      </section>

      <aside class="profile-card security-card" aria-labelledby="security-title">
        <div class="profile-card__header">
          <div class="section-icon section-icon--violet"><i class="bi bi-shield-lock"></i></div>
          <div><h2 id="security-title">Account security</h2><p>Change your password regularly to help protect your account.</p></div>
        </div>

        <div class="security-tip"><i class="bi bi-shield-check" aria-hidden="true"></i><span>Use at least 8 characters for your new password.</span></div>

        <div v-if="passwordStatus.text" class="profile-alert" :class="'profile-alert--' + passwordStatus.type" role="status" aria-live="polite">
          <i :class="passwordStatus.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
          <span>{{ passwordStatus.text }}</span>
          <button type="button" class="alert-dismiss" aria-label="Dismiss message" @click="passwordStatus.text = ''"><i class="bi bi-x-lg"></i></button>
        </div>

        <form class="profile-form security-form" novalidate @submit.prevent="handleChangePassword">
          <div class="form-field">
            <label for="current-password">Current password <span class="required-mark">*</span></label>
            <div class="input-wrap">
              <i class="bi bi-key input-icon" aria-hidden="true"></i>
              <input id="current-password" v-model="passwordForm.current_password" :type="showCurrentPassword ? 'text' : 'password'"
                class="form-control profile-input" :class="{ 'is-invalid': passErrors.current_password }"
                autocomplete="current-password" placeholder="Enter current password" required @input="clearPasswordError('current_password')" />
              <button type="button" class="password-toggle" :aria-label="showCurrentPassword ? 'Hide current password' : 'Show current password'"
                @click="showCurrentPassword = !showCurrentPassword"><i :class="showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i></button>
            </div>
            <small v-if="passErrors.current_password" class="field-error">{{ passErrors.current_password }}</small>
          </div>

          <div class="form-field">
            <label for="new-password">New password <span class="required-mark">*</span></label>
            <div class="input-wrap">
              <i class="bi bi-lock input-icon" aria-hidden="true"></i>
              <input id="new-password" v-model="passwordForm.new_password" :type="showNewPassword ? 'text' : 'password'"
                class="form-control profile-input" :class="{ 'is-invalid': passErrors.new_password }"
                autocomplete="new-password" placeholder="At least 8 characters" required @input="clearPasswordError('new_password')" />
              <button type="button" class="password-toggle" :aria-label="showNewPassword ? 'Hide new password' : 'Show new password'"
                @click="showNewPassword = !showNewPassword"><i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i></button>
            </div>
            <small v-if="passErrors.new_password" class="field-error">{{ passErrors.new_password }}</small>
          </div>

          <div class="form-field">
            <label for="confirm-password">Confirm new password <span class="required-mark">*</span></label>
            <div class="input-wrap">
              <i class="bi bi-lock-fill input-icon" aria-hidden="true"></i>
              <input id="confirm-password" v-model="passwordForm.new_password_confirmation" :type="showConfirmPassword ? 'text' : 'password'"
                class="form-control profile-input" :class="{ 'is-invalid': passErrors.new_password_confirmation }"
                autocomplete="new-password" placeholder="Re-enter new password" required @input="clearPasswordError('new_password_confirmation')" />
              <button type="button" class="password-toggle" :aria-label="showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'"
                @click="showConfirmPassword = !showConfirmPassword"><i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i></button>
            </div>
            <small v-if="passErrors.new_password_confirmation" class="field-error">{{ passErrors.new_password_confirmation }}</small>
          </div>

          <button type="submit" class="profile-button profile-button--dark profile-button--full" :disabled="isPasswordLoading">
            <span v-if="isPasswordLoading" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <i v-else class="bi bi-shield-check" aria-hidden="true"></i>
            {{ isPasswordLoading ? 'Updating password…' : 'Update password' }}
          </button>
        </form>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/utils/auth'
import api from '@/plugins/axios'

const authStore = useAuthStore()

const isProfileLoading = ref(false)
const isPasswordLoading = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const profileStatus = reactive({ type: '', text: '' })
const passwordStatus = reactive({ type: '', text: '' })
const errors = reactive({})
const passErrors = reactive({})

const profileForm = reactive({ name: '', gender: '', city: '', address: '' })
const passwordForm = reactive({ current_password: '', new_password: '', new_password_confirmation: '' })

const populateUserData = (user = authStore.user) => {
  if (!user) return
  profileForm.name = user.name ?? ''
  profileForm.gender = String(user.gender ?? '').toLowerCase()
  profileForm.city = user.city ?? ''
  profileForm.address = user.address ?? ''
}

watch(() => authStore.user, (user) => populateUserData(user), { immediate: true })

const clearProfileError = (field) => {
  if (errors[field]) errors[field] = ''
}

const clearPasswordError = (field) => {
  if (passErrors[field]) passErrors[field] = ''
  if (field === 'new_password' || field === 'new_password_confirmation') passwordStatus.text = ''
}

const applyServerErrors = (target, serverErrors) => {
  Object.keys(serverErrors || {}).forEach((key) => {
    const message = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key]
    target[key] = String(message || 'Please check this field.')
  })
}

const handleUpdateProfile = async () => {
  Object.keys(errors).forEach((key) => { errors[key] = '' })
  profileStatus.text = ''

  if (!profileForm.name.trim()) {
    errors.name = 'Please enter your full name.'
    return
  }

  isProfileLoading.value = true
  try {
    // Bank and UPI details are managed separately and are intentionally excluded from this request.
    const payload = {
      name: profileForm.name.trim(),
      gender: profileForm.gender,
      city: profileForm.city.trim(),
      address: profileForm.address.trim(),
    }
    const response = await api.put('/update-profile', payload)

    if (response.data?.success) {
      const updatedUser = response.data?.data?.user
      if (updatedUser) {
        authStore.updateUserData(updatedUser)
        populateUserData(updatedUser)
      }
      profileStatus.type = 'success'
      profileStatus.text = response.data.message || 'Profile updated successfully.'
    } else {
      profileStatus.type = 'danger'
      profileStatus.text = response.data?.message || 'Profile could not be updated. Please try again.'
    }
  } catch (error) {
    if (error.response?.status === 422 && error.response.data?.errors) {
      applyServerErrors(errors, error.response.data.errors)
    } else {
      profileStatus.type = 'danger'
      profileStatus.text = error.response?.data?.message || 'Failed to update profile. Check your connection and try again.'
    }
  } finally {
    isProfileLoading.value = false
  }
}

const handleChangePassword = async () => {
  Object.keys(passErrors).forEach((key) => { passErrors[key] = '' })
  passwordStatus.text = ''

  if (!passwordForm.current_password) passErrors.current_password = 'Please enter your current password.'
  if (!passwordForm.new_password) {
    passErrors.new_password = 'Please enter a new password.'
  } else if (passwordForm.new_password.length < 8) {
    passErrors.new_password = 'New password must be at least 8 characters.'
  }
  if (!passwordForm.new_password_confirmation) {
    passErrors.new_password_confirmation = 'Please confirm your new password.'
  } else if (passwordForm.new_password && passwordForm.new_password !== passwordForm.new_password_confirmation) {
    passErrors.new_password_confirmation = 'The password confirmation does not match.'
  }

  if (Object.values(passErrors).some(Boolean)) return

  isPasswordLoading.value = true
  try {
    const response = await api.put('/update-password', {
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
      new_password_confirmation: passwordForm.new_password_confirmation,
    })

    if (response.data?.success) {
      passwordStatus.type = 'success'
      passwordStatus.text = response.data.message || 'Password updated successfully.'
      passwordForm.current_password = ''
      passwordForm.new_password = ''
      passwordForm.new_password_confirmation = ''
      showCurrentPassword.value = false
      showNewPassword.value = false
      showConfirmPassword.value = false
    } else {
      passwordStatus.type = 'danger'
      passwordStatus.text = response.data?.message || 'Password could not be updated. Please try again.'
    }
  } catch (error) {
    if (error.response?.status === 422 && error.response.data?.errors) {
      applyServerErrors(passErrors, error.response.data.errors)
    } else {
      passwordStatus.type = 'danger'
      passwordStatus.text = error.response?.data?.message || 'Password update failed. Check your connection and try again.'
    }
  } finally {
    isPasswordLoading.value = false
  }
}
</script>

<style scoped>
.profile-page {
  --profile-ink: #17243b;
  --profile-muted: #758198;
  --profile-line: #e7ecf4;
  --profile-blue: #3568e8;
  max-width: 1440px;
  margin: 0 auto;
  padding: 22px 14px 36px;
  color: var(--profile-ink);
}
.profile-heading { display: flex; align-items: center; gap: 14px; margin: 0 auto 22px; max-width: 1200px; flex-wrap: wrap; }
.profile-heading__icon { display: grid; place-items: center; flex: 0 0 52px; width: 52px; height: 52px; border-radius: 17px; color: #fff; font-size: 24px; background: linear-gradient(145deg, #477cf3, #6448d9); box-shadow: 0 9px 22px rgb(66 103 226 / 20%); }
.profile-heading__copy { min-width: 0; flex: 1 1 190px; }
.profile-eyebrow { margin: 0 0 4px; color: var(--profile-blue); font-size: 10px; font-weight: 800; letter-spacing: .16em; }
.profile-heading h1 { margin: 0; color: var(--profile-ink); font-size: clamp(22px, 5vw, 30px); font-weight: 800; letter-spacing: -.04em; }
.profile-subtitle { margin: 5px 0 0; color: var(--profile-muted); font-size: 13px; line-height: 1.55; }
.wallet-chip { display: inline-flex; align-items: center; gap: 10px; padding: 9px 13px; border: 1px solid #dce9ff; border-radius: 15px; background: linear-gradient(135deg, #f4f8ff, #f5f2ff); margin-left: auto; }
.wallet-chip__icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 11px; color: #3469df; background: #fff; font-size: 17px; }
.wallet-chip small, .wallet-chip strong { display: block; }
.wallet-chip small { margin-bottom: 2px; color: var(--profile-muted); font-size: 10px; white-space: nowrap; }
.wallet-chip strong { color: var(--profile-ink); font-size: 14px; font-weight: 800; white-space: nowrap; }
.profile-layout { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(290px, .9fr); align-items: start; gap: 20px; max-width: 1200px; margin: 0 auto; }
.profile-card { min-width: 0; overflow: hidden; border: 1px solid var(--profile-line); border-radius: 22px; background: #fff; box-shadow: 0 10px 34px rgb(24 43 77 / 5%); }
.profile-card__header { display: flex; align-items: flex-start; gap: 13px; padding: 23px 23px 20px; border-bottom: 1px solid #f0f3f8; }
.section-icon { display: grid; place-items: center; flex: 0 0 42px; width: 42px; height: 42px; border-radius: 14px; font-size: 19px; }
.section-icon--blue { color: #3568e8; background: #edf3ff; }
.section-icon--violet { color: #7450d8; background: #f3efff; }
.profile-card__header h2 { margin: 1px 0 5px; color: var(--profile-ink); font-size: 17px; font-weight: 800; letter-spacing: -.02em; }
.profile-card__header p { margin: 0; color: var(--profile-muted); font-size: 12px; line-height: 1.55; }
.profile-form { display: flex; flex-direction: column; gap: 18px; padding: 22px 23px 23px; }
.profile-form__row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.form-field { min-width: 0; }
.form-field label { display: block; margin: 0 0 8px; color: #34425a; font-size: 12px; font-weight: 750; }
.required-mark { color: #e14b5a; }
.optional-label { margin-left: 5px; color: #8a95a8; font-size: 10px; font-weight: 500; }
.input-wrap { position: relative; display: flex; align-items: center; min-width: 0; }
.input-icon { position: absolute; z-index: 1; left: 14px; color: #8995aa; font-size: 16px; pointer-events: none; }
.profile-input.form-control, .profile-input.form-select { width: 100%; min-width: 0; min-height: 48px; padding: 11px 13px 11px 42px; border: 1px solid #e1e7f0; border-radius: 12px; background-color: #fbfcfe; color: var(--profile-ink); font-size: 13px; box-shadow: none; transition: border-color .18s ease, background-color .18s ease, box-shadow .18s ease; }
.profile-input::placeholder { color: #a1aabb; opacity: 1; }
.profile-input.form-control:focus, .profile-input.form-select:focus { border-color: #7ea1fb; background-color: #fff; box-shadow: 0 0 0 3px rgb(53 104 232 / 10%); }
.profile-input.form-control.is-invalid, .profile-input.form-select.is-invalid, .input-wrap--invalid .profile-input { border-color: #e45b69; }
.profile-input.form-select { padding-right: 30px; }
.input-wrap--readonly .profile-input { padding-right: 38px; color: #64718a; background: #f4f6fa; }
.readonly-lock { position: absolute; right: 13px; color: #98a3b5; font-size: 13px; pointer-events: none; }
.input-wrap--textarea { align-items: flex-start; }
.input-wrap--textarea .input-icon { top: 14px; }
.profile-textarea { min-height: 96px; resize: vertical; }
.field-hint, .field-error { display: block; margin: 6px 1px 0; font-size: 11px; line-height: 1.45; }
.field-hint { color: #8994a7; }
.field-error { color: #d13d4d; }
.profile-form__footer { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 2px; padding-top: 19px; border-top: 1px solid #edf1f6; }
.save-note { display: flex; align-items: flex-start; gap: 7px; margin: 0; color: #7c879a; font-size: 11px; line-height: 1.5; }
.save-note i { color: #2c9c77; font-size: 15px; }
.profile-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 46px; padding: 12px 18px; border: 0; border-radius: 12px; font-size: 12px; font-weight: 750; transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease; }
.profile-button:disabled { cursor: not-allowed; opacity: .7; }
.profile-button:not(:disabled):active { transform: translateY(1px); }
.profile-button--primary { flex: 0 0 auto; color: #fff; background: linear-gradient(135deg, #3568e8, #5a57e8); box-shadow: 0 7px 17px rgb(53 104 232 / 19%); }
.profile-button--primary:not(:disabled):hover { box-shadow: 0 10px 22px rgb(53 104 232 / 27%); }
.profile-button--dark { color: #fff; background: linear-gradient(135deg, #202c43, #364564); }
.profile-button--full { width: 100%; margin-top: 2px; }
.security-tip { display: flex; align-items: flex-start; gap: 9px; margin: 20px 22px 0; padding: 12px; border: 1px solid #e9e3ff; border-radius: 13px; background: #faf8ff; color: #65538f; font-size: 11px; line-height: 1.55; }
.security-tip i { flex: 0 0 auto; color: #7857d9; font-size: 15px; }
.security-form { gap: 18px; padding-top: 20px; }
.password-toggle { position: absolute; right: 8px; z-index: 2; display: grid; place-items: center; width: 36px; height: 36px; border: 0; border-radius: 9px; background: transparent; color: #7f8ba1; }
.password-toggle:hover, .password-toggle:focus-visible { color: var(--profile-blue); background: #edf3ff; outline: none; }
.security-form .profile-input { padding-right: 45px; }
.profile-alert { display: flex; align-items: flex-start; gap: 9px; margin: 16px 22px 0; padding: 11px 12px; border: 1px solid transparent; border-radius: 12px; font-size: 12px; line-height: 1.5; }
.profile-alert > i { margin-top: 1px; }
.profile-alert span { flex: 1; overflow-wrap: anywhere; }
.profile-alert--success { border-color: #ccefe0; background: #f0fbf6; color: #18764f; }
.profile-alert--danger { border-color: #f6d5d8; background: #fff5f5; color: #b72f40; }
.alert-dismiss { display: grid; place-items: center; flex: 0 0 auto; width: 25px; height: 25px; margin: -4px -4px 0 0; border: 0; border-radius: 7px; background: transparent; color: currentColor; opacity: .7; }
.alert-dismiss:hover { background: rgb(0 0 0 / 5%); opacity: 1; }
@media (max-width: 991.98px) {
  .profile-layout { grid-template-columns: minmax(0, 1fr); max-width: 760px; }
  .profile-heading { max-width: 760px; }
}
@media (max-width: 575.98px) {
  .profile-page { padding: 17px 10px 26px; }
  .profile-heading { gap: 11px; margin-bottom: 17px; }
  .profile-heading__icon { flex-basis: 44px; width: 44px; height: 44px; border-radius: 14px; font-size: 21px; }
  .profile-heading__copy { flex-basis: calc(100% - 60px); }
  .profile-heading h1 { font-size: 22px; }
  .profile-subtitle { font-size: 12px; }
  .wallet-chip { width: 100%; margin: 2px 0 0; padding: 9px 12px; border-radius: 13px; }
  .wallet-chip__icon { width: 32px; height: 32px; }
  .wallet-chip small { font-size: 10px; }
  .wallet-chip strong { font-size: 13px; }
  .profile-layout { gap: 15px; }
  .profile-card { border-radius: 18px; }
  .profile-card__header { gap: 11px; padding: 18px 16px 16px; }
  .section-icon { flex-basis: 38px; width: 38px; height: 38px; border-radius: 12px; font-size: 17px; }
  .profile-card__header h2 { font-size: 15px; }
  .profile-card__header p { font-size: 11px; }
  .profile-form { gap: 16px; padding: 18px 16px 17px; }
  .profile-form__row { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .form-field label { margin-bottom: 7px; font-size: 12px; }
  .profile-input.form-control, .profile-input.form-select { min-height: 48px; font-size: 14px; }
  .profile-textarea { min-height: 88px; }
  .profile-form__footer { align-items: stretch; flex-direction: column; gap: 13px; padding-top: 16px; }
  .save-note { font-size: 11px; }
  .profile-button { width: 100%; min-height: 48px; }
  .security-tip { margin: 16px 16px 0; }
  .security-form { padding-top: 17px; }
  .profile-alert { margin: 14px 16px 0; }
}
@media (prefers-reduced-motion: reduce) {
  .profile-button, .profile-input.form-control, .profile-input.form-select { transition: none; }
}
</style>
