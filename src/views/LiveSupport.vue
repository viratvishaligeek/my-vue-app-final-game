<template>
  <div class="content-area pb-5 history-bg min-vh-100 d-flex flex-column">
    <div class="container-fluid px-2 px-md-3 py-2 flex-grow-1 d-flex flex-column">
      <!-- 1. SUPPORT TOP BAR / AGENT HEADER -->
      <div
        class="card border-0 shadow-sm rounded-4 p-3 mb-2 bg-dark text-white position-relative overflow-hidden"
      >
        <div
          class="d-flex align-items-center justify-content-between flex-wrap gap-2 position-relative z-1"
        >
          <div class="d-flex align-items-center gap-3">
            <div class="position-relative">
              <div
                class="icon-circle bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center fw-black"
              >
                <i class="bi bi-headset fs-5"></i>
              </div>
              <span
                class="position-absolute bottom-0 end-0 p-1 bg-success border border-light rounded-circle"
              ></span>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h6 class="fw-black text-white mb-0">VIP Live Support Desk</h6>
                <span class="badge bg-success-subtle text-success fs-8 fw-bold rounded-pill"
                  >Online</span
                >
              </div>
              <span class="fs-8 text-white-50"
                >Typical reply time: <strong>&lt; 2 minutes</strong></span
              >
            </div>
          </div>

          <!-- Direct WhatsApp Shortcut Button -->
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            class="btn btn-sm btn-success rounded-pill fw-bold px-3 d-flex align-items-center gap-1 shadow-xs"
          >
            <i class="bi bi-whatsapp"></i>
            <span class="fs-8">WhatsApp Direct</span>
          </a>
        </div>
      </div>

      <!-- 2. QUICK FAQ SUGGESTION CHIPS -->
      <div class="mb-2 overflow-auto text-nowrap py-1 d-flex gap-2 no-scrollbar">
        <button
          v-for="(faq, idx) in quickQuestions"
          :key="idx"
          @click="sendQuickQuestion(faq)"
          class="btn btn-xs btn-white bg-white border rounded-pill text-dark fw-bold fs-8 shadow-xs hover-warning"
        >
          <i class="bi bi-question-circle text-warning me-1"></i> {{ faq }}
        </button>
      </div>

      <!-- 3. CHAT MESSAGES CONTAINER -->
      <div
        class="card border-0 shadow-xs rounded-4 bg-white flex-grow-1 d-flex flex-column overflow-hidden mb-2"
        style="max-height: 60vh; min-height: 380px"
      >
        <div
          ref="chatFeed"
          class="card-body p-3 overflow-auto d-flex flex-column gap-3 bg-light-subtle"
        >
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="d-flex flex-column"
            :class="msg.sender === 'user' ? 'align-items-end' : 'align-items-start'"
          >
            <!-- Message Bubble -->
            <div
              class="message-bubble p-3 rounded-4 shadow-xs max-w-75"
              :class="
                msg.sender === 'user'
                  ? 'bg-warning text-dark rounded-bottom-right-0'
                  : 'bg-white border text-dark rounded-bottom-left-0'
              "
            >
              <!-- Sender Tag for Support Agent -->
              <div
                v-if="msg.sender === 'agent'"
                class="d-flex align-items-center gap-1 mb-1 text-danger fw-bold fs-8"
              >
                <i class="bi bi-patch-check-fill"></i> Support Desk Agent
              </div>

              <!-- Message Body Text -->
              <p class="mb-0 fs-7 fw-medium" style="white-space: pre-line">{{ msg.text }}</p>
            </div>

            <!-- Timestamp -->
            <span class="fs-8 text-muted mt-1 px-1 font-monospace">{{ msg.time }}</span>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="d-flex align-items-center gap-2 text-muted fs-8">
            <div class="spinner-grow spinner-grow-sm text-warning" role="status"></div>
            <span>Agent is typing a response...</span>
          </div>
        </div>

        <!-- 4. CHAT INPUT FOOTER BAR -->
        <div class="card-footer bg-white border-top p-2">
          <form @submit.prevent="sendMessage" class="d-flex align-items-center gap-2">
            <!-- Attachment Trigger -->
            <button
              type="button"
              class="btn btn-light rounded-circle border p-2 d-flex align-items-center justify-content-center text-secondary"
              style="width: 38px; height: 38px"
              title="Attach Screenshot"
            >
              <i class="bi bi-paperclip fs-6"></i>
            </button>

            <!-- Input Field -->
            <input
              v-model="newMessage"
              type="text"
              class="form-control form-control-sm border-0 bg-light rounded-pill px-3 py-2 fs-7 fw-semibold shadow-none"
              placeholder="Type your message or issue here..."
              required
            />

            <!-- Send Button -->
            <button
              type="submit"
              class="btn btn-warning text-dark rounded-circle p-2 d-flex align-items-center justify-content-center shadow-xs"
              style="width: 38px; height: 38px"
              :disabled="!newMessage.trim()"
            >
              <i class="bi bi-send-fill fs-6"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

const chatFeed = ref(null)
const newMessage = ref('')
const isTyping = ref(false)

const quickQuestions = [
  'Deposit not added to wallet?',
  'How to withdraw winnings?',
  'Game result timing query',
  'What is Crossing Bet?',
]

const getCurrentTime = () =>
  new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

const messages = ref([
  {
    sender: 'agent',
    text: 'Hello! Welcome to Live Support Desk. 👋\nHow can we assist you with your bets, wallet deposit, or game results today?',
    time: getCurrentTime(),
  },
])

const scrollToBottom = async () => {
  await nextTick()
  if (chatFeed.value) {
    chatFeed.value.scrollTop = chatFeed.value.scrollHeight
  }
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return

  const userText = newMessage.value
  messages.value.push({
    sender: 'user',
    text: userText,
    time: getCurrentTime(),
  })

  newMessage.value = ''
  scrollToBottom()

  // Auto Bot Simulation Answer
  simulateAgentResponse(userText)
}

const sendQuickQuestion = (questionText) => {
  newMessage.value = questionText
  sendMessage()
}

const simulateAgentResponse = (userText) => {
  isTyping.value = true
  scrollToBottom()

  setTimeout(() => {
    isTyping.value = false
    let reply =
      'Thank you for reaching out! Our executive is looking into your query. If urgent, you can also ping us on WhatsApp.'

    const lower = userText.toLowerCase()
    if (lower.includes('deposit')) {
      reply =
        'For Deposit issues: Please ensure you submitted the correct 12-digit UPI UTR Ref number. Deposits are verified instantly within 2 minutes.'
    } else if (lower.includes('withdraw')) {
      reply =
        'Withdrawals are processed instantly 24x7 to your linked UPI ID or Bank account upon request.'
    }

    messages.value.push({
      sender: 'agent',
      text: reply,
      time: getCurrentTime(),
    })
    scrollToBottom()
  }, 1200)
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.history-bg {
  background-color: #f4f5f7;
}
.fw-black {
  font-weight: 900;
}
.fs-8 {
  font-size: 0.72rem;
}
.fs-7 {
  font-size: 0.82rem;
}
.shadow-xs {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}

.max-w-75 {
  max-width: 78%;
}

.message-bubble {
  word-break: break-word;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hover-warning:hover {
  background-color: #ffc107 !important;
  border-color: #ffc107 !important;
}

.rounded-bottom-right-0 {
  border-bottom-right-radius: 2px !important;
}
.rounded-bottom-left-0 {
  border-bottom-left-radius: 2px !important;
}
</style>
