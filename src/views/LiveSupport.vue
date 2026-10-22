<template>
  <div class="content-area pb-5 history-bg min-vh-100 d-flex flex-column">
    <div class="container-fluid px-2 px-md-3 py-2 flex-grow-1 d-flex flex-column">
      <div class="card border-0 shadow-sm rounded-4 p-3 mb-2 bg-dark text-white">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-3">
            <div class="icon-circle bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center"><i class="bi bi-headset fs-5"></i></div>
            <div><h6 class="fw-bold text-white mb-1">VIP Live Support Desk</h6><span class="small text-white-50">{{ connected ? 'Connected · messages sync automatically' : humanSupportRequested ? 'Reconnecting to support…' : 'Browse FAQs before starting a chat' }}</span></div>
          </div>
          <span class="badge" :class="connected ? 'bg-success' : 'bg-secondary'">{{ connected ? 'Online' : 'Reconnecting' }}</span>
        </div>
      </div>
      <section v-if="!humanSupportRequested" class="card border-0 shadow-sm rounded-4 bg-white mb-3">
        <div class="card-body">
          <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
            <div><h6 class="fw-bold mb-1">Find an instant answer</h6><p class="small text-muted mb-0">Check these FAQs before joining the support queue.</p></div>
            <span class="badge bg-warning text-dark">{{ faqs.length }} FAQs</span>
          </div>
          <div v-if="faqLoading" class="small text-muted py-3">Loading helpful answers…</div>
          <div v-else-if="faqs.length" class="d-grid gap-2">
            <div v-for="faq in faqs" :key="faq.id" class="border rounded-3 overflow-hidden">
              <button type="button" class="btn w-100 text-start fw-semibold d-flex justify-content-between align-items-center" @click="activeFaqId = activeFaqId === faq.id ? null : faq.id">
                <span>{{ faq.question }}</span><i :class="activeFaqId === faq.id ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
              </button>
              <div v-if="activeFaqId === faq.id" class="px-3 pb-3 text-muted" style="white-space:pre-line">{{ faq.answer }}</div>
            </div>
          </div>
          <p v-else class="small text-muted py-2 mb-0">No FAQs are published for this platform yet.</p>
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 pt-3 border-top">
            <span class="small text-muted">Still need help from a person?</span>
            <button class="btn btn-warning text-dark fw-bold" type="button" @click="openHumanSupport"><i class="bi bi-headset me-1"></i>Contact human support</button>
          </div>
        </div>
      </section>
      <div v-if="humanSupportRequested" class="d-flex justify-content-between align-items-center gap-2 mb-2">
        <span class="small text-muted">Human support conversation</span><button type="button" class="btn btn-sm btn-outline-secondary" @click="closeHumanSupport">Back to FAQs</button>
      </div>
      <div v-if="humanSupportRequested" class="card border-0 shadow-sm rounded-4 bg-white flex-grow-1 d-flex flex-column overflow-hidden mb-2" style="max-height:65vh;min-height:380px">
        <div ref="chatFeed" class="card-body p-3 overflow-auto d-flex flex-column gap-3 bg-light-subtle">
          <div v-if="loading && messages.length===0" class="text-center text-muted py-5"><span class="spinner-border spinner-border-sm me-2"></span>Loading conversation…</div>
          <div v-for="msg in messages" :key="msg.id" class="d-flex flex-column" :class="msg.sender === 'user' ? 'align-items-end' : 'align-items-start'">
            <div class="message-bubble p-3 rounded-4 shadow-sm" :class="msg.sender === 'user' ? 'bg-warning text-dark rounded-bottom-right-0' : 'bg-white border text-dark rounded-bottom-left-0'">
              <div v-if="msg.sender !== 'user'" class="small fw-bold text-danger mb-1"><i class="bi bi-patch-check-fill"></i> Support Desk</div>
              <p v-if="msg.body" class="mb-1" style="white-space:pre-line">{{ msg.body }}</p>
              <template v-if="msg.media_url">
                <img v-if="(msg.media_mime||'').startsWith('image/')" :src="msg.display_media_url" :alt="msg.media_name || 'Chat attachment'" class="chat-media">
                <video v-else-if="(msg.media_mime||'').startsWith('video/')" :src="msg.display_media_url" controls playsinline class="chat-media"></video>
                <audio v-else-if="(msg.media_mime||'').startsWith('audio/')" :src="msg.display_media_url" controls preload="metadata"></audio>
                <a v-else :href="msg.display_media_url" target="_blank" rel="noopener">Open attachment</a>
              </template>
            </div>
            <span class="small text-muted mt-1 px-1">{{ formatTime(msg.created_at) }} <span v-if="msg.sender==='user' && msg.read_at">· Seen</span></span>
          </div>
          <div v-if="errorMessage" class="alert alert-warning py-2 small">{{ errorMessage }} <button class="btn btn-sm btn-link" @click="syncMessages">Retry</button></div>
        </div>
        <div class="card-footer bg-white border-top p-2">
          <form @submit.prevent="sendMessage" class="d-flex align-items-center gap-2">
            <input ref="fileInput" type="file" class="d-none" accept="image/*,video/mp4,video/webm,audio/*" @change="onFileSelected">
            <button type="button" class="btn btn-light rounded-circle border" style="width:38px;height:38px" title="Attach image, video, or audio" @click="fileInput?.click()"><i class="bi bi-paperclip"></i></button>
            <button type="button" class="btn rounded-circle border" :class="recording ? 'btn-danger text-white' : 'btn-light'" style="width:38px;height:38px" :disabled="!canRecord" :title="recording ? 'Stop voice recording' : 'Record voice message'" @click="toggleRecording"><i :class="recording ? 'bi bi-stop-fill' : 'bi bi-mic-fill'"></i></button>
            <input v-model="newMessage" type="text" class="form-control form-control-sm border-0 bg-light rounded-pill px-3 py-2 shadow-none" placeholder="Type your message…" maxlength="5000">
            <button type="submit" class="btn btn-warning text-dark rounded-circle" style="width:38px;height:38px" :disabled="sending || (!newMessage.trim() && !selectedFile)"><i class="bi bi-send-fill"></i></button>
          </form>
          <div v-if="selectedFile" class="small text-muted mt-2 d-flex align-items-center justify-content-between"><span><i class="bi bi-paperclip me-1"></i>{{ selectedFile.name }}</span><button class="btn btn-sm btn-link text-danger p-0" @click="selectedFile=null">Remove</button></div>
          <div v-if="recording" class="small text-danger mt-2"><span class="spinner-grow spinner-grow-sm me-1"></span>Recording voice message…</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import api from '@/plugins/axios'

const chatFeed = ref(null)
const fileInput = ref(null)
const newMessage = ref('')
const messages = ref([])
const loading = ref(true)
const sending = ref(false)
const connected = ref(false)
const errorMessage = ref('')
const selectedFile = ref(null)
const faqs = ref([])
const faqLoading = ref(true)
const activeFaqId = ref(null)
const humanSupportRequested = ref(false)
const recording = ref(false)
const canRecord = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'
let pollTimer = null
let syncInFlight = false
let consecutiveFailures = 0
let hasLoadedHistory = false
let recorder = null
let recordingStream = null
let recordedChunks = []
let lastMessageId = 0

const loadFaqs = async () => {
  faqLoading.value = true
  try {
    const platform = Capacitor.isNativePlatform() ? 'app' : 'web'
    const { data } = await api.get('/faqs', { params: { platform }, showGlobalLoader: false })
    faqs.value = Array.isArray(data?.data) ? data.data : []
  } catch {
    faqs.value = []
  } finally {
    faqLoading.value = false
  }
}
const scheduleNextSync = () => {
  if (!humanSupportRequested.value || pollTimer) return
  const delay = connected.value ? 5000 : Math.min(30000, 5000 * (2 ** Math.min(consecutiveFailures, 3)))
  pollTimer = setTimeout(() => {
    pollTimer = null
    void syncMessages()
  }, delay)
}
const openHumanSupport = async () => {
  humanSupportRequested.value = true
  await syncMessages({ initial: true })
}
const closeHumanSupport = () => {
  humanSupportRequested.value = false
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = null
}
const mediaUrlCache = new Map()
const formatTime = value => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', hour12:true})
}
const scrollToBottom = async () => {
  await nextTick()
  if (chatFeed.value) chatFeed.value.scrollTop = chatFeed.value.scrollHeight
}
const syncMessages = async ({ initial = false } = {}) => {
  if (syncInFlight) return
  syncInFlight = true
  const wasNearBottom = !chatFeed.value || (chatFeed.value.scrollHeight - chatFeed.value.scrollTop - chatFeed.value.clientHeight < 100)
  try {
    const params = hasLoadedHistory ? { after_id: lastMessageId } : {}
    const { data } = await api.get('/support-chat', { params, showGlobalLoader: false })
    const incoming = Array.isArray(data?.data) ? data.data : []
    await Promise.all(incoming.filter(message => message.media_url).map(async message => {
      if (mediaUrlCache.has(message.id)) {
        message.display_media_url = mediaUrlCache.get(message.id)
        return
      }
      try {
        const media = await api.get('/support-chat/media/' + message.id, { responseType: 'blob', showGlobalLoader: false })
        const objectUrl = URL.createObjectURL(media.data)
        mediaUrlCache.set(message.id, objectUrl)
        message.display_media_url = objectUrl
      } catch {
        message.display_media_url = ''
      }
    }))

    if (!hasLoadedHistory || initial) {
      messages.value = incoming
      hasLoadedHistory = true
      lastMessageId = incoming.reduce((max, message) => Math.max(max, Number(message.id) || 0), 0)
      await scrollToBottom()
    } else if (incoming.length) {
      const existingIds = new Set(messages.value.map(message => message.id))
      const additions = incoming.filter(message => !existingIds.has(message.id))
      if (additions.length) {
        messages.value = [...messages.value, ...additions]
        lastMessageId = Math.max(lastMessageId, ...additions.map(message => Number(message.id) || 0))
        if (wasNearBottom) await scrollToBottom()
      }
    }
    connected.value = true
    consecutiveFailures = 0
    errorMessage.value = ''
  } catch (error) {
    connected.value = false
    consecutiveFailures += 1
    errorMessage.value = error?.response?.status === 401 ? 'Please sign in again to continue chat.' : 'Connection interrupted. Retrying automatically…'
  } finally {
    loading.value = false
    syncInFlight = false
    scheduleNextSync()
  }
}
const onFileSelected = event => {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.size > 20 * 1024 * 1024) {
    errorMessage.value = 'Attachments must be 20 MB or smaller.'
    event.target.value = ''
    return
  }
  selectedFile.value = file
}
const toggleRecording = async () => {
  if (recording.value && recorder) {
    recorder.stop()
    recording.value = false
    return
  }
  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(type => MediaRecorder.isTypeSupported(type))
    recorder = new MediaRecorder(recordingStream, mimeType ? { mimeType } : undefined)
    recordedChunks = []
    recorder.ondataavailable = event => { if (event.data.size) recordedChunks.push(event.data) }
    recorder.onstop = () => {
      const type = recorder?.mimeType || 'audio/webm'
      selectedFile.value = new File([new Blob(recordedChunks, { type })], 'voice-message.' + (type.includes('mp4') ? 'mp4' : 'webm'), { type })
      recordingStream?.getTracks().forEach(track => track.stop())
      recordingStream = null
    }
    recorder.start()
    recording.value = true
    errorMessage.value = ''
  } catch {
    errorMessage.value = 'Microphone permission was denied or recording is not supported by this browser.'
  }
}
const sendMessage = async () => {
  if (sending.value || (!newMessage.value.trim() && !selectedFile.value)) return
  sending.value = true
  const form = new FormData()
  if (newMessage.value.trim()) form.append('body', newMessage.value.trim())
  if (selectedFile.value) form.append('attachment', selectedFile.value)
  try {
    await api.post('/support-chat/messages', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    newMessage.value = ''
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = ''
    await syncMessages()
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'Unable to send message. Please retry.'
  } finally {
    sending.value = false
  }
}
onMounted(() => {
  void loadFaqs()
})
onUnmounted(() => {
  if (pollTimer) clearTimeout(pollTimer)
  if (recorder && recorder.state !== 'inactive') recorder.stop()
  recordingStream?.getTracks().forEach(track => track.stop())
  mediaUrlCache.forEach(url => URL.revokeObjectURL(url))
  mediaUrlCache.clear()
})
</script>

<style scoped>
.history-bg{background-color:#f4f5f7}.message-bubble{max-width:78%;word-break:break-word}.chat-media{display:block;max-width:min(260px,65vw);max-height:260px;border-radius:10px;margin-top:5px}.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}.rounded-bottom-right-0{border-bottom-right-radius:2px!important}.rounded-bottom-left-0{border-bottom-left-radius:2px!important}
</style>
