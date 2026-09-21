import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Bootstrap Styles & JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

 import './assets/css/style.css'
import './assets/js/script.js'
import './assets/js/rocket-loader.min.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
