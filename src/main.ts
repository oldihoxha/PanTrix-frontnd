import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import authService from './services/authService'

const app = createApp(App)

// Initialisiere Auth beim App-Start
authService.initializeToken()

app.use(router)

app.mount('#app')
