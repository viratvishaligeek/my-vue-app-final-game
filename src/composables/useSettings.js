import { ref } from 'vue'
import api from '@/plugins/axios'

const settings = ref({})
const loaded = ref(false)
const loading = ref(false)

let settingsPromise = null

const loadSettings = async (keys = []) => {
  if (loaded.value) {
    return settings.value
  }
  if (settingsPromise) {
    return settingsPromise
  }

  settingsPromise = (async () => {
    loading.value = true
    try {
      const params = {}
      if (keys.length) {
        params.keys = keys
      }
      const response = await api.get('/settings', {
        params,
      })

      if (response.data?.success) {
        const data = response.data.data || {}
        Object.assign(settings.value, data)
        loaded.value = true
      }
      return settings.value
    } finally {
      loading.value = false
      settingsPromise = null
    }
  })()
  return settingsPromise
}
const getSetting = (key, defaultValue = null) => {
  return settings.value[key] ?? defaultValue
}

const hasSetting = (key) => {
  return Object.prototype.hasOwnProperty.call(settings.value, key)
}

const refreshSettings = async (keys = []) => {
  loaded.value = false
  settings.value = {}

  return loadSettings(keys)
}

export function useSettings() {
  return {
    settings,
    loading,
    loaded,
    loadSettings,
    getSetting,
    hasSetting,
    refreshSettings,
  }
}
