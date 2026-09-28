import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import api from './plugins/axios'

import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import './assets/css/style.css'
import './assets/js/script.js'
import './assets/js/rocket-loader.min.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast)

app.config.globalProperties.$axios = api

app.mount('#app')
