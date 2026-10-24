<template>
  <main class="profile-page">
    <div class="profile-layout">
      <!-- Personal details -->
      <section class="profile-section" style="  background: linear-gradient(135deg, #272451, #000);">
        <div class="section-heading">
          <div class="section-heading__icon">
            <i class="bi bi-person-lines-fill"></i>
          </div>
          <div>
            <h2>Personal information</h2>
            <p>Update your details below.</p>
          </div>
        </div>

        <form @submit.prevent="handleUpdateProfile" novalidate>
          <div class="edit-grid">
            <!-- Full name -->
            <div class="edit-field">
              <label for="profile-name">Full name <span>*</span></label>
              <div class="line-input">
                <i class="bi bi-person"></i>
                <input id="profile-name" v-model.trim="profileForm.name" type="text" placeholder="Enter your name"
                  autocomplete="name" maxlength="255" required :class="{ 'input-error': errors.name }"
                  @input="clearProfileError('name')" />
              </div>
              <small v-if="errors.name" class="field-error">{{ errors.name }}</small>
            </div>

            <!-- Registered phone -->
            <div class="edit-field">
              <label for="profile-phone">Phone number</label>
              <div class="line-input line-input--readonly">
                <i class="bi bi-telephone"></i>
                <input id="profile-phone" :value="authStore.user?.phone || ''" type="tel" readonly
                  aria-describedby="phone-note" />
                <i class="bi bi-lock-fill field-lock"></i>
              </div>
            </div>

            <!-- City -->
            <div class="edit-field">
              <label for="profile-city">City</label>
              <div class="line-input">
                <i class="bi bi-geo-alt"></i>
                <input id="profile-city" v-model.trim="profileForm.city" type="text" placeholder="Enter your city"
                  autocomplete="address-level2" maxlength="255" :class="{ 'input-error': errors.city }"
                  @input="clearProfileError('city')" />
              </div>
              <small v-if="errors.city" class="field-error">{{ errors.city }}</small>
            </div>

            <!-- Gender -->
            <div class="edit-field">
              <label for="profile-gender">Gender</label>
              <div class="line-input">
                <i class="bi bi-person-hearts"></i>
                <select id="profile-gender" v-model="profileForm.gender" :class="{ 'input-error': errors.gender }"
                  @change="clearProfileError('gender')">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <i class="bi bi-chevron-down select-arrow"></i>
              </div>
              <small v-if="errors.gender" class="field-error">{{ errors.gender }}</small>
            </div>

            <!-- Address -->
          </div>

          <div v-if="profileStatus.text" class="status-message" :class="'status-message--' + profileStatus.type"
            role="status">
            <i :class="profileStatus.type === 'success'
              ? 'bi bi-check-circle-fill'
              : 'bi bi-exclamation-circle-fill'"></i>
            <span>{{ profileStatus.text }}</span>
          </div>

          <div class="form-footer">
            <span class="footer-note">
              <i class="bi bi-shield-check"></i>
              Your information is protected.
            </span>

            <button class="save-button save-button--dark" type="submit" :disabled="isProfileLoading">
              <span v-if="isProfileLoading" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-check2"></i>
              {{ isProfileLoading ? 'Saving...' : 'Save changes' }}
            </button>
          </div>
        </form>
      </section>

      <!-- Password and security -->
      <section class="profile-section security-section">
        <div class="section-heading">
          <div class="section-heading__icon section-heading__icon--purple">
            <i class="bi bi-shield-lock"></i>
          </div>
          <div>
            <h2 style="color: black;">Password & security</h2>
            <p>Keep your account protected.</p>
          </div>
        </div>

        <div class="security-banner">
          <i class="bi bi-info-circle"></i>
          <span>Use a strong password with at least 8 characters.</span>
        </div>

        <div v-if="passwordStatus.text" class="status-message" :class="'status-message--' + passwordStatus.type"
          role="status" aria-live="polite">
          <i :class="passwordStatus.type === 'success'
            ? 'bi bi-check-circle-fill'
            : 'bi bi-exclamation-circle-fill'"></i>
          <span>{{ passwordStatus.text }}</span>
          <button type="button" class="dismiss-button" aria-label="Dismiss" @click="passwordStatus.text = ''">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <form @submit.prevent="handleChangePassword" novalidate>
          <div class="edit-grid security-grid">
            <!-- Current password -->
            <div class="edit-field edit-field--full">
              <label for="current-password">Current password <span>*</span></label>
              <div class="line-input">
                <i class="bi bi-key"></i>
                <input id="current-password" v-model="passwordForm.current_password"
                  :type="showCurrentPassword ? 'text' : 'password'" autocomplete="current-password"
                  placeholder="Enter current password" :class="{ 'input-error': passErrors.current_password }"
                  @input="clearPasswordError('current_password')" />
                <button type="button" class="eye-button"
                  :aria-label="showCurrentPassword ? 'Hide password' : 'Show password'"
                  @click="showCurrentPassword = !showCurrentPassword">
                  <i :class="showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <small v-if="passErrors.current_password" class="field-error">
                {{ passErrors.current_password }}
              </small>
            </div>

            <!-- New password -->
            <div class="edit-field">
              <label for="new-password">New password <span>*</span></label>
              <div class="line-input">
                <i class="bi bi-lock"></i>
                <input id="new-password" v-model="passwordForm.new_password"
                  :type="showNewPassword ? 'text' : 'password'" autocomplete="new-password"
                  placeholder="Min. 8 characters" :class="{ 'input-error': passErrors.new_password }"
                  @input="clearPasswordError('new_password')" />
                <button type="button" class="eye-button"
                  :aria-label="showNewPassword ? 'Hide password' : 'Show password'"
                  @click="showNewPassword = !showNewPassword">
                  <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <small v-if="passErrors.new_password" class="field-error">
                {{ passErrors.new_password }}
              </small>
            </div>

            <!-- Confirm password -->
            <div class="edit-field">
              <label for="confirm-password">Confirm password <span>*</span></label>
              <div class="line-input">
                <i class="bi bi-lock-fill"></i>
                <input id="confirm-password" v-model="passwordForm.new_password_confirmation"
                  :type="showConfirmPassword ? 'text' : 'password'" autocomplete="new-password"
                  placeholder="Repeat password" :class="{ 'input-error': passErrors.new_password_confirmation }"
                  @input="clearPasswordError('new_password_confirmation')" />
                <button type="button" class="eye-button"
                  :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                  @click="showConfirmPassword = !showConfirmPassword">
                  <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <small v-if="passErrors.new_password_confirmation" class="field-error">
                {{ passErrors.new_password_confirmation }}
              </small>
            </div>
          </div>

          <div class="form-footer security-footer">
            <span class="footer-note">
              <i class="bi bi-shield-lock"></i>
              Never share your password.
            </span>
            <button class="save-button save-button--dark" type="submit" :disabled="isPasswordLoading">
              <span v-if="isPasswordLoading" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-shield-check"></i>
              {{ isPasswordLoading ? 'Updating...' : 'Update password' }}
            </button>
          </div>
        </form>
      </section>
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
  --ink: #19243a;
  --muted: #8490a4;
  --line: #e8edf5;
  --blue: #3568e8;
  --purple: #7756db;
  max-width: 1380px;
  margin: 0 auto;
  padding: 28px 22px 48px;
  color: var(--ink);
}

.page-heading {
  max-width: 1120px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-eyebrow {
  display: block;
  margin-bottom: 7px;
  color: var(--blue);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
}

.page-heading h1 {
  margin: 0;
  font-size: clamp(25px, 3vw, 32px);
  font-weight: 800;
  letter-spacing: -1px;
}

.page-heading p {
  margin: 7px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.heading-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid #d9eee4;
  border-radius: 30px;
  background: #f3fbf7;
  color: #26815d;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.profile-overview {
  max-width: 1120px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 23px 26px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background:
    radial-gradient(ellipse at 100% 0%, #edf2ff 0%, transparent 48%),
    #fff;
  box-shadow: 0 5px 24px rgb(28 45 77 / 3%);
}

.avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 70px;
  height: 70px;
  border: 4px solid #fff;
  border-radius: 50%;
  background: linear-gradient(135deg, #3568e8, #8661e9);
  color: #fff;
  font-size: 28px;
  font-weight: 800;
  box-shadow: 0 0 0 1px #e2e9fa, 0 7px 18px #3568e824;
}

.overview-info {
  flex: 1;
  min-width: 0;
}

.overview-info h2 {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.overview-info p {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 9px;
  color: #748198;
  font-size: 12px;
}

.account-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #24845e;
  font-size: 11px;
  font-weight: 700;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2eb67d;
}

.overview-icon {
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border-radius: 15px;
  background: #eef2ff;
  color: #5774dc;
  font-size: 23px;
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  align-items: start;
  gap: 24px;
  max-width: 1120px;
  margin: 0 auto;
}

.profile-section {
  min-width: 0;
  padding: 25px;
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 7px 28px rgb(28 45 77 / 4%);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 30px;
  padding-bottom: 21px;
  border-bottom: 1px solid #000;
}

.section-heading__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #edf3ff;
  color: var(--blue);
  font-size: 20px;
}

.section-heading__icon--purple {
  background: #f3efff;
  color: var(--purple);
}

.section-heading h2 {
  margin: 0 0 5px;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -.3px;
}

.section-heading p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}

.edit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 20px;
}

.edit-field {
  min-width: 0;
}

.edit-field--full {
  grid-column: 1 / -1;
}

.edit-field label {
  display: block;
  margin: 0 0 6px;
  color: #fff;
  font-size: 15px;
  font-weight: 750;
  letter-spacing: .35px;
}

.edit-field label>span:not(.label-optional) {
  color: #e05263;
}

.label-optional {
  margin-left: 5px;
  color: #9aa5b6;
  font-size: 12px;
  letter-spacing: .7px;
}

.line-input {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  min-height: 43px;
  border-bottom: 1px solid #fff;
  transition: border-color .2s ease;
}

.line-input::after {
  position: absolute;
  right: 50%;
  bottom: -1px;
  left: 50%;
  height: 2px;
  background: var(--blue);
  content: "";
  transition: left .22s ease, right .22s ease;
}

.line-input:focus-within::after {
  right: 0;
  left: 0;
}

.line-input>i:first-child {
  flex-shrink: 0;
  margin-right: 11px;
  color: #fff;
  font-size: 16px;
  pointer-events: none;
}

/* Only second card: Password & security */
.security-section .edit-field label {
  color: #000;
}

.security-section .line-input input,
.security-section .line-input select {
  color: #000 !important;
}

.security-section .line-input input::placeholder {
  color: #666 !important;
  opacity: 1;
}

.security-section .line-input>i:first-child {
  color: #000;
}

.security-section .eye-button {
  color: #000;
}

.security-section .line-input--readonly input {
  color: #000 !important;
}


.line-input input,
.line-input select,
.line-input textarea {
  display: block;
  width: 100%;
  min-width: 0;
  padding: 10px 0;
  border: 0 !important;
  outline: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  box-shadow: none !important;
  appearance: none;
}

.line-input input::placeholder,
.line-input textarea::placeholder {
  color: #fff;
  opacity: 1;
}

.line-input input:focus,
.line-input select:focus,
.line-input textarea:focus {
  outline: none;
}

.line-input--readonly input {
  color: #fff;
  cursor: not-allowed;
}

.line-input--readonly>i:first-child {
  color: #fff;
}

.line-input .field-lock {
  flex-shrink: 0;
  margin: 0 2px 0 8px;
  color: #fff;
  font-size: 12px;
}

.line-input select {
  padding-right: 18px;
  cursor: pointer;
}

.line-input .select-arrow {
  position: absolute;
  right: 2px;
  color: #fff;
  font-size: 11px;
  pointer-events: none;
}

.line-input--textarea {
  align-items: flex-start;
}

.line-input--textarea>i:first-child {
  margin-top: 12px;
}

.line-input textarea {
  min-height: 76px;
  resize: vertical;
}

.line-input .input-error {
  color: #d13d4d;
}

.line-input:has(.input-error) {
  border-bottom-color: #e05263;
}

.field-error,
.field-note {
  display: block;
  margin-top: 7px;
  font-size: 10px;
  line-height: 1.5;
}

.field-error {
  color: #d13d4d;
}

.field-note {
  color: #fff;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 30px;
  padding-top: 22px;
  border-top: 1px solid #edf0f5;
}

.footer-note {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #8792a5;
  font-size: 10px;
  line-height: 1.5;
}

.footer-note i {
  color: #26956b;
  font-size: 15px;
}

.save-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 46px;
  padding: 12px 19px;
  border: 0;
  border-radius: 11px;
  background: linear-gradient(135deg, #3568e8, #554fe0);
  color: #fff;
  font-size: 12px;
  font-weight: 750;
  box-shadow: 0 6px 16px #3568e826;
  transition: transform .2s, box-shadow .2s, opacity .2s;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 9px 20px #3568e83b;
}

.save-button:disabled {
  cursor: not-allowed;
  opacity: .65;
}

.save-button--dark {
  background: linear-gradient(135deg, #27344c, #455572);
  box-shadow: 0 6px 16px #27344c20;
}

.security-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: -5px 0 27px;
  padding: 13px;
  border: 1px solid #e9e4fc;
  border-radius: 11px;
  background: #faf8ff;
  color: #716093;
  font-size: 11px;
  line-height: 1.6;
}

.security-banner i {
  flex-shrink: 0;
  margin-top: 1px;
  color: #805cda;
  font-size: 15px;
}

.security-grid {
  gap: 26px 18px;
}

.eye-button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  margin-left: 4px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #8290a6;
  font-size: 16px;
}

.eye-button:hover,
.eye-button:focus-visible {
  background: #f0f4ff;
  color: var(--blue);
  outline: none;
}

.status-message {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 20px;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 11px;
  font-size: 11px;
  line-height: 1.55;
}

.status-message>i {
  flex-shrink: 0;
  margin-top: 1px;
}

.status-message>span {
  flex: 1;
  overflow-wrap: anywhere;
}

.status-message--success {
  border-color: #ccefe0;
  background: #f0fbf6;
  color: #18764f;
}

.status-message--danger {
  border-color: #f6d5d8;
  background: #fff5f5;
  color: #b72f40;
}

.dismiss-button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 25px;
  height: 25px;
  margin: -4px -4px 0 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: currentColor;
}

@media (max-width: 1000px) {
  .profile-layout {
    grid-template-columns: minmax(0, 1fr);
    max-width: 720px;
  }

  .page-heading,
  .profile-overview {
    max-width: 720px;
  }
}

@media (max-width: 575.98px) {
  .profile-page {
    padding: 19px 11px 30px;
  }

  .page-heading {
    align-items: flex-start;
    margin-bottom: 18px;
  }

  .page-heading h1 {
    font-size: 26px;
  }

  .page-heading p {
    max-width: 245px;
    font-size: 12px;
    line-height: 1.6;
  }

  .page-eyebrow {
    font-size: 9px;
    letter-spacing: 1.6px;
  }

  .heading-badge {
    gap: 5px;
    padding: 8px;
    font-size: 9px;
  }

  .profile-overview {
    gap: 13px;
    margin-bottom: 17px;
    padding: 17px 14px;
    border-radius: 16px;
  }

  .avatar {
    width: 56px;
    height: 56px;
    font-size: 23px;
  }

  .overview-info h2 {
    font-size: 17px;
  }

  .overview-info p {
    gap: 6px;
    font-size: 11px;
    overflow-wrap: anywhere;
  }

  .overview-icon {
    width: 37px;
    height: 37px;
    border-radius: 11px;
    font-size: 18px;
  }

  .profile-layout {
    gap: 16px;
  }

  .profile-section {
    padding: 19px 15px;
    border-radius: 17px;
  }

  .section-heading {
    gap: 11px;
    margin-bottom: 26px;
    padding-bottom: 17px;
  }

  .section-heading__icon {
    width: 41px;
    height: 41px;
    border-radius: 12px;
    font-size: 18px;
  }

  .section-heading h2 {
    font-size: 15px;
    color: #fff;
  }

  .section-heading p {
    font-size: 11px;
  }

  .edit-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 20px;
  }

  .edit-field label {
    margin-bottom: 5px;
    font-size: 14px;
    letter-spacing: .15px;
  }

  .line-input {
    min-height: 44px;
  }

  .line-input>i:first-child {
    margin-right: 8px;
    font-size: 14px;
  }

  .line-input input,
  .line-input select,
  .line-input textarea {
    padding-top: 10px;
    padding-bottom: 10px;
    font-size: 12px;
  }

  .line-input input::placeholder,
  .line-input textarea::placeholder {
    font-size: 11px;
  }

  .line-input select {
    padding-right: 14px;
  }

  .line-input .select-arrow {
    font-size: 9px;
  }

  .line-input--readonly .field-lock {
    margin-left: 4px;
    font-size: 10px;
  }

  .line-input--textarea textarea {
    min-height: 70px;
  }

  .field-note,
  .field-error {
    font-size: 9px;
  }

  .form-footer {
    align-items: stretch;
    flex-direction: column;
    gap: 13px;
    margin-top: 25px;
    padding-top: 18px;
  }

  .footer-note {
    font-size: 10px;
  }

  .save-button {
    width: 100%;
    min-height: 48px;
  }

  .security-banner {
    margin-bottom: 25px;
    padding: 11px;
    font-size: 10px;
  }

  .security-grid {
    gap: 25px 12px;
  }

  .eye-button {
    width: 28px;
    height: 32px;
    margin-left: 0;
    font-size: 14px;
  }

  .status-message {
    padding: 10px;
    font-size: 10px;
  }
}

@media (max-width: 360px) {
  .profile-page {
    padding-right: 8px;
    padding-left: 8px;
  }

  .profile-section {
    padding-right: 11px;
    padding-left: 11px;
  }

  .profile-overview {
    padding-right: 10px;
    padding-left: 10px;
  }

  .edit-grid {
    column-gap: 9px;
  }

  .line-input>i:first-child {
    margin-right: 6px;
  }

  .line-input input,
  .line-input select,
  .line-input textarea {
    font-size: 11px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .line-input,
  .line-input::after,
  .save-button {
    transition: none;
  }
}
</style>
