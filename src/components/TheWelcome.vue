<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const baseUrl = import.meta.env.VITE_API_URL || 'https://pantrix.onrender.com'
const products = ref<any[]>([])
const isLoading = ref(false)

// GET Request - Produkte laden
const loadProducts = async () => {
  isLoading.value = true
  try {
    const response = await axios.get(`${baseUrl}/test`)
    products.value = response.data
    console.log('Produkte geladen:', response.data)
  } catch (error) {
    console.error('Fehler beim Laden der Produkte:', error)
  } finally {
    isLoading.value = false
  }
}

// POST Request - Neues Produkt hinzufügen
const addProduct = async (name: string, expiryDate: string) => {
  try {
    const response = await axios.post(`${baseUrl}/products`, {
      name: name,
      expiryDate: expiryDate
    })
    console.log('Produkt hinzugefügt:', response.data)
    await loadProducts()
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Produkts:', error)
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <div class="landing-page">
    <div class="glass-container">
      <h1>Willkommen zu PanTrix</h1>
      <button class="btn-login">Jetzt anmelden</button>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-page {
  background: linear-gradient(135deg, #0a0a0f 0%, #0f0f1e 50%, #0a0a15 100%);
  background-attachment: fixed;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow: hidden;
}

.landing-page::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(100, 200, 255, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(60px);
  animation: float 8s ease-in-out infinite;
}

.landing-page::after {
  content: '';
  position: absolute;
  bottom: -20%;
  left: -5%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(150, 100, 255, 0.12) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(60px);
  animation: float 10s ease-in-out infinite reverse;
}

.glass-container {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  padding: 7rem 8rem;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.5),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -1px 2px rgba(0, 0, 0, 0.3);
  min-width: 800px;
  position: relative;
  z-index: 10;
  transition: all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
  backdrop-filter: blur(50px) brightness(1.1);
}

.glass-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  border-radius: 50px 50px 0 0;
}

.glass-container:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow:
    0 12px 50px rgba(100, 200, 255, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.4),
    inset 0 -1px 2px rgba(0, 0, 0, 0.3);
  transform: translateY(-5px);
}

.landing-page h1 {
  font-size: 4.5rem;
  color: #ffffff;
  text-align: center;
  font-weight: 900;
  letter-spacing: 3px;
  text-shadow:
    0 2px 20px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(100, 200, 255, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #c0c0ff 50%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px rgba(100, 200, 255, 0.15));
}

.btn-login {
  margin-top: 2.5rem;
  padding: 1rem 2.5rem;
  background: rgba(100, 200, 255, 0.1);
  border: 1.5px solid rgba(100, 200, 255, 0.4);
  color: #ffffff;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  display: block;
  margin-left: auto;
  margin-right: auto;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.btn-login::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-login:hover {
  background: rgba(100, 200, 255, 0.2);
  border-color: rgba(100, 200, 255, 0.6);
  transform: translateY(-3px);
  box-shadow:
    0 10px 30px rgba(100, 200, 255, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.btn-login:hover::before {
  left: 100%;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-30px);
  }
}

@media (max-width: 768px) {
  .glass-container {
    min-width: 90%;
    padding: 3rem 2rem;
  }

  .landing-page h1 {
    font-size: 2.5rem;
    letter-spacing: 1px;
  }
}
</style>

