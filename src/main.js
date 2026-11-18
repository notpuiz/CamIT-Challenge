import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initTactilePress } from './utils/tactilePress'

const app = createApp(App)

app.use(createPinia())
app.use(router)

initTactilePress()

app.mount('#app')
