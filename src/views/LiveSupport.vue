<template>
  <div class="content-area pb-5 history-bg min-vh-100 d-flex flex-column">
    <div class="container-fluid px-2 px-md-3 py-2 flex-grow-1 d-flex flex-column">
      <div class="card border-0 shadow-sm rounded-4 p-3 mb-2 bg-dark text-white">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-3">
            <div class="icon-circle bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center"><i class="bi bi-headset fs-5"></i></div>
            <div><h6 class="fw-bold text-white mb-1">VIP Live Support Desk</h6><span class="small text-white-50">{{ connected ? 'Connected · messages sync automatically' : 'Reconnecting to support…' }}</span></div>
          </div>
          <span class="badge" :class="connected ? 'bg-success' : 'bg-secondary'">{{ connected ? 'Online' : 'Reconnecting' }}</span>
        </div>
      </div>
      <div class="mb-2 overflow-auto text-nowrap py-1 d-flex gap-2 no-scrollbar">
        <button v-for="(faq, idx) in quickQuestions" :key="idx" @click="newMessage = faq" class="btn btn-sm bg-white border rounded-pill text-dark fw-bold">
          <i class="bi bi-question-circle text-warning me-1"></i>{{ faq }}
        </button>
      </div>
      <div class="card border-0 shadow-sm rounded-4 bg-white flex-grow-1 d-flex flex-column overflow-hidden mb-2" style="max-height:65vh;min-height:380px">
        <div ref="chatFeed" class="card-body p-3 overflow-auto d-flex flex-column gap-3 bg-light-subtle">
          <div v-if="loading && messages.length===0" class="text-center text-muted py-5"><span class="spinner-border spinner-border-sm me-2"></span>Loading conversation…</div>
          <div v-for="msg in messages" :key="msg.id" class="d-flex flex-column" :class="msg.sender === 'user' ? 'align-items-end' : 'align-items-start'">
            <div class="message-bubble p-3 rounded-4 shadow-sm" :class="msg.sender === 'user' ? 'bg-warning text-dark rounded-bottom-right-0' : 'bg-white border text-dark rounded-bottom-left-0'">
              <div v-if="msg.sender !== 'user'" class="small fw-bold text-danger mb-1"><i class="bi bi-patch-check-fill"></i> Support Desk</div>
              <p v-if="msg.body" class="mb-1" style="white-space:pre-line">{{ msg.body }}</p>
              <template v-if="msg.media_url">
                <img v-if="(msg.media_mime||'').startsWith('image/')" :src="msg.media_url" :alt="msg.media_name || 'Chat attachment'" class="chat-media">
                <video v-else-if="(msg.media_mime||'').startsWith('video/')" :src="msg.media_url" controls class="chat-media"></video>
                <audio v-else-if="(msg.media_mime||'').startsWith('audio/')" :src="msg.media_url" controls></audio>
                <a v-else :href="msg.media_url" target="_blank" rel="noopener">Open attachment</a>
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
const recording = ref(false)
const canRecord = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'
let pollTimer = null
let recorder = null
let recordingStream = null
let recordedChunks = []
let lastMessageId = 0

const quickQuestions = ['Deposit not added to wallet?', 'How to withdraw winnings?', 'Game result timing query', 'What is Crossing Bet?']
const formatTime = value => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', hour12:true})
}
const scrollToBottom = async () => {
  await nextTick()
  if (chatFeed.value) chatFeed.value.scrollTop = chatFeed.value.scrollHeight
}
const syncMessages = async () => {
  try {
    const { data } = await api.get('/support-chat', { showGlobalLoader: false })
    const incoming = Array.isArray(data?.data) ? data.data : []
    if (incoming.length && incoming[incoming.length - 1].id !== lastMessageId) {
      messages.value = incoming
      lastMessageId = incoming[incoming.length - 1].id
      await scrollToBottom()
    } else if (!incoming.length && messages.value.length) {
      messages.value = []
      lastMessageId = 0
    } else if (incoming.length && messages.value.length === 0) {
      messages.value = incoming
      lastMessageId = incoming[incoming.length - 1].id
      await scrollToBottom()
    }
    connected.value = true
    errorMessage.value = ''
  } catch (error) {
    connected.value = false
    errorMessage.value = error?.response?.status === 401 ? 'Please sign in again to continue chat.' : 'Connection interrupted. Retrying automatically…'
  } finally {
    loading.value = false
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
onMounted(async () => {
  await syncMessages()
  pollTimer = setInterval(syncMessages, 3000)
})
onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (recorder && recorder.state !== 'inactive') recorder.stop()
  recordingStream?.getTracks().forEach(track => track.stop())
})
</script>

<style scoped>
.history-bg{background-color:#f4f5f7}.message-bubble{max-width:78%;word-break:break-word}.chat-media{display:block;max-width:min(260px,65vw);max-height:260px;border-radius:10px;margin-top:5px}.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}.rounded-bottom-right-0{border-bottom-right-radius:2px!important}.rounded-bottom-left-0{border-bottom-left-radius:2px!important}
</style>
