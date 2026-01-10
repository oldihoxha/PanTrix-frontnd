<template>
  <div class="home-page">
    <!-- Top Bar -->
    <header class="top-bar">
      <div class="logo-container">
        <div class="logo">
          <span class="logo-text">PanTrix</span>
        </div>
      </div>
      <nav class="nav-links">
        <button class="notifications-btn-top" title="Benachrichtigungen">
          <span class="notification-icon">🔔</span>
        </button>
        <div class="profile-section">
          <div class="profile-icon">👤</div>
          <span class="profile-email">{{ currentUser }}</span>
          <button class="nav-button logout-btn" @click="logout">Abmelden</button>
        </div>
      </nav>
    </header>

    <!-- Main Content with Right Sidebar -->
    <div class="content-wrapper">
      <div class="scroll-container">
      <!-- Hero Section -->
      <section class="section hero-section">
        <h1>Willkommen, {{ userName }}! </h1>
        <p class="home-subtitle">Deine Lebensmittel verwalten</p>
        <p class="home-tagline">{{ currentDate }}</p>
      </section>

      <!-- MyPantry - Modern Pantry Interface -->
      <section class="section my-pantry-section">
        <PantryInterfaceModal />
      </section>

      <!-- Quick Stats with Progress Rings -->
      <section class="section quick-stats-section">
        <div class="section-content">
          <h2>Statistiken</h2>

          <!-- Stats Widgets Grid -->
          <div class="stats-widgets-grid">
            <!-- Row 1 -->
            <!-- Categories Widget (Left) -->
            <div class="stat-widget widget-categories">
              <h3>Kategorien</h3>
              <div class="categories-list">
                <div class="category-item">
                  <span class="cat-name">Gemüse</span>
                  <span class="cat-count">8</span>
                </div>
                <div class="category-item">
                  <span class="cat-name">Obst</span>
                  <span class="cat-count">6</span>
                </div>
                <div class="category-item">
                  <span class="cat-name">Milchprodukte</span>
                  <span class="cat-count">5</span>
                </div>
                <div class="category-item">
                  <span class="cat-name">Fleisch & Fisch</span>
                  <span class="cat-count">5</span>
                </div>
              </div>
            </div>

            <!-- Total Products Widget (Large Center) -->
            <div class="stat-widget widget-large widget-total">
              <h3>Gesamte Produkte</h3>
              <div class="widget-main-content">
                <div class="big-number">{{ displayCount1 }}</div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 75%"></div>
                </div>
                <p class="widget-subtitle">75% Kapazität genutzt</p>
              </div>
            </div>

            <!-- Saved Products Widget (Right) -->
            <div class="stat-widget widget-saved">
              <h3>Gerettete Produkte</h3>
              <div class="widget-main-content">
                <div class="medium-number">{{ displayCount2 }}</div>
                <p class="widget-subtitle">vor Verschwendung bewahrt</p>
                <div class="progress-indicator">↑ +20%</div>
              </div>
            </div>

            <!-- Expiring Soon Widget (Small Right) -->
            <div class="stat-widget widget-small widget-expiring">
              <h3>Bald ablaufend</h3>
              <div class="widget-main-content">
                <div class="small-number">{{ displayCount3 }}</div>
                <p class="widget-subtitle">in den nächsten 7 Tagen</p>
              </div>
            </div>

            <!-- Row 2 -->
            <!-- Storage Widget (Left) -->
            <div class="stat-widget widget-storage">
              <h3>Lagerbestände</h3>
              <div class="storage-chart-wrapper">
                <div class="y-axis">
                  <span class="y-label">100%</span>
                  <span class="y-label">75%</span>
                  <span class="y-label">50%</span>
                  <span class="y-label">25%</span>
                  <span class="y-label">0%</span>
                </div>
                <div class="chart-container">
                  <div class="chart-grid"></div>
                  <div class="bars-container">
                    <div class="bar-wrapper">
                      <div class="bar" style="height: 80%;"></div>
                    </div>
                    <div class="bar-wrapper">
                      <div class="bar" style="height: 60%;"></div>
                    </div>
                    <div class="bar-wrapper">
                      <div class="bar" style="height: 50%;"></div>
                    </div>
                  </div>
                </div>
                <div class="x-axis">
                  <span class="x-label">Gemüse</span>
                  <span class="x-label">Obst</span>
                  <span class="x-label">Milch</span>
                </div>
              </div>
            </div>

            <!-- Week Overview Widget (Large Right) -->
            <div class="stat-widget widget-large widget-week">
              <h3>Produktkategorien Übersicht</h3>
              <div class="category-list-compact">
                <div class="category-list-item">
                  <div class="category-info">
                    <span class="category-name">Gemüse</span>
                    <span class="category-value">8</span>
                  </div>
                  <div class="category-bar-small" style="width: 65%;"></div>
                </div>
                <div class="category-list-item">
                  <div class="category-info">
                    <span class="category-name">Obst</span>
                    <span class="category-value">6</span>
                  </div>
                  <div class="category-bar-small" style="width: 48%;"></div>
                </div>
                <div class="category-list-item">
                  <div class="category-info">
                    <span class="category-name">Milchprodukte</span>
                    <span class="category-value">5</span>
                  </div>
                  <div class="category-bar-small" style="width: 40%;"></div>
                </div>
                <div class="category-list-item">
                  <div class="category-info">
                    <span class="category-name">Fleisch & Fisch</span>
                    <span class="category-value">5</span>
                  </div>
                  <div class="category-bar-small" style="width: 40%;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Detail Modal - wird beim Klick angezeigt -->
      <div v-if="selectedDetail" class="detail-modal" @click.self="closeDetailView">
        <div class="detail-content">
          <button class="detail-close" @click="closeDetailView">✕</button>

          <div v-if="selectedDetail === 'total'" class="detail-breakdown">
            <h2>Produkte gesamt</h2>
            <div class="breakdown-list">
              <div class="breakdown-item">
                <span class="breakdown-label">🥬 Gemüse</span>
                <span class="breakdown-value">8</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">🍎 Obst</span>
                <span class="breakdown-value">6</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">🥛 Milchprodukte</span>
                <span class="breakdown-value">5</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">🍖 Fleisch/Fisch</span>
                <span class="breakdown-value">5</span>
              </div>
            </div>
          </div>

          <div v-if="selectedDetail === 'saved'" class="detail-breakdown">
            <h2>Lebensmittel gerettet</h2>
            <p class="detail-info">Du hast 18 Produkte vor der Verschwendung bewahrt!</p>
            <div class="breakdown-list">
              <div class="breakdown-item">
                <span class="breakdown-label">💚 Erfolgsrate</span>
                <span class="breakdown-value">75%</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">📈 Trend</span>
                <span class="breakdown-value">↑ +20%</span>
              </div>
            </div>
          </div>

          <div v-if="selectedDetail === 'expiring'" class="detail-breakdown">
            <h2>Bald ablaufend</h2>
            <p class="detail-info">6 Produkte laufen in den nächsten 7 Tagen ab</p>
            <div class="breakdown-list">
              <div class="breakdown-item">
                <span class="breakdown-label">Heute - 2 Tage</span>
                <span class="breakdown-value">2</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">3 - 5 Tage</span>
                <span class="breakdown-value">3</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">6 - 7 Tage</span>
                <span class="breakdown-value">1</span>
              </div>
            </div>
          </div>

          <div v-if="selectedDetail === 'week'" class="detail-breakdown">
            <h2>Diese Woche</h2>
            <div class="breakdown-list">
              <div class="breakdown-item">
                <span class="breakdown-label">✅ Hinzugefügt</span>
                <span class="breakdown-value">9</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">🍽️ Verwendet</span>
                <span class="breakdown-value">3</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">⏰ Abgelaufen</span>
                <span class="breakdown-value">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts & Messages -->
      <section class="section alerts-section">
        <div class="section-content">
          <h2>Aktuelle Meldungen</h2>
          <div class="alerts-container">
            <div v-if="alerts.length === 0" class="no-alerts">
              <span class="no-alerts-icon">✅</span>
              <p>Keine Meldungen - alles im grünen Bereich!</p>
            </div>
            <div v-else v-for="alert in alerts" :key="alert.id" class="alert-card" :class="alert.type">
              <span class="alert-icon">{{ alert.icon }}</span>
              <div class="alert-content">
                <p class="alert-title">{{ alert.title }}</p>
                <p class="alert-message">{{ alert.message }}</p>
                <p class="alert-date">{{ alert.date }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Other Actions -->

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-content">
          <div class="footer-section">
            <h4>PanTrix</h4>
            <p>Dein intelligenter Lebensmittel-Tracker</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 PanTrix. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'
import PantryInterfaceModal from './PantryInterfaceModal.vue'

interface Props {
  currentUser: string
  onLogout: () => void
}

interface Alert {
  id: number
  type: 'warning' | 'info' | 'success'
  icon: string
  title: string
  message: string
  date: string
}

const props = defineProps<Props>()

const showMyPantry = ref(false)
const addProductMode = ref(false)
const selectedDetail = ref<string | null>(null)

// Live Counter Animation
const displayCount1: Ref<number> = ref(0)
const displayCount2: Ref<number> = ref(0)
const displayCount3: Ref<number> = ref(0)
const displayCount4: Ref<number> = ref(0)

// Sample alerts - später wird das vom Backend kommen
const alerts = ref<Alert[]>([
  {
    id: 1,
    type: 'warning',
    icon: '⏰',
    title: 'Erdbeer Joghurt läuft bald ab',
    message: 'Ablaufdatum: 31.12.2025 - bitte bald verwenden!',
    date: 'Heute'
  },
  {
    id: 2,
    type: 'warning',
    icon: '⏰',
    title: 'Milch verfällt in 2 Tagen',
    message: 'Ablaufdatum: 30.12.2025 - planen Sie den Verbrauch!',
    date: 'In 2 Tagen'
  }
])

const userName = computed(() => {
  // Safeguard: props.currentUser könnte leer sein
  const email = props.currentUser ?? ''
  const parts = email.split('@')
  return parts[0] || email || 'Benutzer'
})

const currentDate = computed(() => {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return now.toLocaleDateString('de-DE', options)
})

const logout = () => {
  props.onLogout()
}

const openDetailView = (type: string) => {
  selectedDetail.value = type
}

const closeDetailView = () => {
  selectedDetail.value = null
}

// Animate Counter Numbers on Mount
const animateCounter = (targetValue: number, displayRef: Ref<number>, duration: number = 1500) => {
  const startTime = Date.now()

  const updateCount = () => {
    const elapsed = Date.now() - startTime
    // Correct clamp: max progress value should be 1 (100%)
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (ease-out)
    const easeProgress = 1 - Math.pow(1 - progress, 3)

    displayRef.value = Math.floor(targetValue * easeProgress)

    if (progress < 1) {
      requestAnimationFrame(updateCount)
    } else {
      displayRef.value = targetValue
    }
  }

  updateCount()
}

onMounted(() => {
  // Start counter animations with staggered delay
  setTimeout(() => animateCounter(24, displayCount1), 300)
  setTimeout(() => animateCounter(18, displayCount2), 500)
  setTimeout(() => animateCounter(6, displayCount3), 700)
  setTimeout(() => animateCounter(13, displayCount4), 900)

  // Erstelle animierte Lichtstrahlen und Glow-Effekte wie in TheWelcome
  createGradientEffects()
})

// Gradient-Effekte für HomeView.vue
const createGradientEffects = () => {
  const container = document.querySelector('.home-page') as HTMLElement
  if (!container) return


  // Erstelle 3 große radiale Gradients (Glow-Effekte)
  const gradientConfigs = [
    {
      name: 'bottom-left',
      startX: 0.2,
      startY: 0.8,
      offsetX: 0.15,
      offsetY: 0.15,
      colors: ['rgba(255, 64, 64, 0.8)', 'rgba(255, 46, 46, 0.6)', 'rgba(255, 46, 46, 0.2)', 'transparent'],
      size: 700
    },
    {
      name: 'bottom-center',
      startX: 0.5,
      startY: 0.7,
      offsetX: 0.12,
      offsetY: 0.12,
      colors: ['rgba(255, 64, 64, 0.9)', 'rgba(255, 48, 48, 0.6)', 'rgba(255, 48, 48, 0.2)', 'transparent'],
      size: 750
    },
    {
      name: 'bottom-right',
      startX: 0.8,
      startY: 0.8,
      offsetX: 0.15,
      offsetY: 0.15,
      colors: ['rgba(255, 46, 46, 0.8)', 'rgba(255, 32, 32, 0.6)', 'rgba(255, 32, 32, 0.2)', 'transparent'],
      size: 700
    }
  ]

  gradientConfigs.forEach((config) => {
    const glowField = document.createElement('div')

    const startX = window.innerWidth * config.startX
    const startY = window.innerHeight * config.startY

    // Erstelle Gradient-String
    const gradientStops = config.colors.map((color) => {
      const percent = (config.colors.indexOf(color) / (config.colors.length - 1)) * 100
      return `${color} ${percent}%`
    }).join(', ')

    glowField.style.cssText = `
      position: fixed;
      width: ${config.size}px;
      height: ${config.size}px;
      left: ${startX}px;
      top: ${startY}px;
      background: radial-gradient(circle, ${gradientStops});
      pointer-events: none;
      z-index: 1;
      filter: blur(80px);
      opacity: 0.8;
      margin-left: -${config.size / 2}px;
      margin-top: -${config.size / 2}px;
    `
    container.appendChild(glowField)
  })
}
</script>

<style scoped>
/* Home Page Styling */
.home-page {
  background: #000000;
  width: 100%;
  height: auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow-x: hidden;
  color: #ffffff;
}

/* Home Page Background Pseudo-Element für schwarzen Hintergrund */
.home-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000000;
  z-index: 0;
  pointer-events: none;
}

/* Sehr leichte Gradient-Lichtstrahlen im Hintergrund */
.home-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(90deg, transparent 15%, rgba(255, 215, 0, 0.015) 50%, transparent 85%),
    linear-gradient(180deg, transparent 25%, rgba(255, 215, 0, 0.01) 50%, transparent 75%);
  pointer-events: none;
  z-index: 1;
}

/* Global CSS variable defaults to satisfy PostCSS resolver (prevents "Cannot resolve '--value'" errors) */
:root {
  --value: 0;
  --width: 50%;
  --percentage: 1;
  --color: #64C8FF;
  --progress: 0;
}

/* Content Wrapper - Main Content + Right Sidebar */
.content-wrapper {
  display: flex;
  flex: 1;
  gap: 2rem;
  padding: 2rem;
  position: relative;
  z-index: 2;
  height: calc(100vh - 100px);
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  background: transparent;
  min-height: 0;
}


/* Top Bar */
.top-bar {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.2rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  position: sticky;
  top: 0;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 2px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Notifications Button - Top Bar */
.notifications-btn-top {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.15);
}

.notifications-btn-top:hover {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
  transform: scale(1.05);
}

.notification-icon {
  display: block;
  animation: bellRing 2s ease-in-out infinite;
}

@keyframes bellRing {
  0%, 100% {
    transform: rotate(0deg);
  }
  15% {
    transform: rotate(15deg);
  }
  30% {
    transform: rotate(-15deg);
  }
  45% {
    transform: rotate(15deg);
  }
  60% {
    transform: rotate(0deg);
  }
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.profile-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #ffffff;
}

.profile-icon:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
}

.profile-email {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-button {
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  letter-spacing: 0.3px;
}

.nav-button:hover {
  color: #ffffff;
  background: rgba(42, 42, 42, 0.11);
}

.logout-btn {
  background: rgba(255, 100, 100, 0.1);
  border-color: rgba(255, 100, 100, 0.3);
  color: rgba(255, 150, 150, 0.9);
}

.logout-btn:hover {
  background: rgba(255, 100, 100, 0.2);
  border-color: rgba(255, 100, 100, 0.5);
  color: #ff8888;
}

/* Section Styles */
.section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  position: relative;
  margin-top: 0;
}

.hero-section {
  background: transparent;
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
  z-index: 2;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 80%;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: none;
  border-radius: 30px;
  z-index: -1;
  pointer-events: none;
}

.hero-section h1 {
  font-size: 4.5rem;
  color: #FF4040;
  font-weight: 900;
  letter-spacing: 2px;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 10px rgba(255, 64, 64, 0.3);
}

.home-subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.home-tagline {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
}

/* MyPantry Section - Main Feature */
.my-pantry-section {
  background: transparent;
  padding: 1rem 0;
}

.my-pantry-hero-btn {
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
}

.my-pantry-hero-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 30px 30px 0 0;
}

.my-pantry-hero-btn:hover {
  background: rgba(220, 53, 69, 0.12);
  border-color: rgba(220, 53, 69, 0.4);
  transform: translateY(-8px);
  box-shadow:
    0 6px 20px rgba(220, 53, 69, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
}

.pantry-icon {
  font-size: 4rem;
  display: block;
  filter: drop-shadow(0 0 20px rgba(100, 200, 255, 0.4));
}

.pantry-title {
  font-size: 2rem;
  color: #ffffff;
  font-weight: 900;
  letter-spacing: 1px;
}

.pantry-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.5px;
}

.pantry-arrow {
  font-size: 1.5rem;
  color: rgba(100, 200, 255, 0.8);
  transition: transform 0.3s ease;
}

.my-pantry-hero-btn:hover .pantry-arrow {
  transform: translateX(8px);
}

/* Quick Stats Section */
.quick-stats-section {
  background: transparent;
  padding: 4rem 2rem;
}

/* Stats Widgets Grid - Modern Layout */
.stats-widgets-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1.2fr 0.8fr;
  grid-template-rows: auto auto;
  gap: 2rem;
  margin-top: 2rem;
}

/* Base Widget Style */
.stat-widget {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 1.2rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.stat-widget:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2),
              inset 0 1px 1px rgba(255, 255, 255, 0.25);
}

.stat-widget h3 {
  font-size: 0.8rem;
  color: #ffffff;
  font-weight: 800;
  margin-bottom: 0.8rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.stat-widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  border-radius: 24px 24px 0 0;
}

.stat-widget::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.08), transparent);
  pointer-events: none;
  border-radius: 24px;
}

/* Categories Widget */
.widget-categories {
  grid-column: 1;
  grid-row: 1;
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.category-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateX(2px);
}

.cat-name {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.cat-count {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 800;
  font-size: 0.85rem;
  min-width: 25px;
  text-align: right;
}

/* Total Products Widget - Large */
.widget-large {
  grid-column: 2;
  grid-row: 1;
}

.widget-total {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}

.widget-total:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.25);
}

.widget-main-content {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.big-number {
  font-size: 2.4rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  line-height: 1;
}

.medium-number {
  font-size: 2rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.small-number {
  font-size: 1.6rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  transition: width 0.5s ease;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
}

.widget-subtitle {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.progress-indicator {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 800;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}

/* Saved Products Widget */
.widget-saved {
  grid-column: 3;
  grid-row: 1;
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}

.widget-saved:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Expiring Widget - Small */
.widget-small {
  grid-column: 4;
  grid-row: 1;
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}

.widget-small:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Storage Widget */
.widget-storage {
  grid-column: 1 / 3;
  grid-row: 2;
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
}

.storage-bars {
  display: none;
}

.storage-chart-wrapper {
  display: flex;
  gap: 0.8rem;
  height: 120px;
  align-items: flex-end;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  height: 100%;
  padding-right: 0.6rem;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  width: 35px;
  flex-shrink: 0;
}

.y-label {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.chart-container {
  flex: 1;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: flex-end;
  gap: 0.8rem;
}

.chart-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.04) 0,
      rgba(255, 255, 255, 0.04) 1px,
      transparent 1px,
      transparent 25%
    );
  pointer-events: none;
  border-radius: 4px;
}

.bars-container {
  display: flex;
  gap: 0.8rem;
  width: 100%;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}

.bar-wrapper {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px 6px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom: none;
  padding: 0 0.4rem 0 0.4rem;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.25) 100%);
  border-radius: 4px 4px 0 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
}

.bar:hover {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.35) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 0 12px rgba(255, 255, 255, 0.15);
  filter: brightness(1.2);
}

.x-axis {
  display: flex;
  gap: 0;
  margin-top: 0.6rem;
  padding-left: 35px;
  width: calc(100% - 35px);
}

.x-label {
  flex: 1;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}


/* Week Widget - Large */
.widget-week {
  grid-column: 3 / 5;
  grid-row: 2;
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
}

.category-chart {
  display: none;
}

.category-list-compact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-list-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.4rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.category-list-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 100px;
  flex-shrink: 0;
}

.category-name {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 700;
}

.category-value {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 800;
  min-width: 20px;
  text-align: right;
}

.category-bar-small {
  flex: 1;
  height: 6px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.15));
  border-radius: 6px;
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.category-list-item:hover .category-bar-small {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.25));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 8px rgba(255, 255, 255, 0.1);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .stats-widgets-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
  }

  .widget-large {
    grid-column: 1 / 3;
  }

  .widget-storage {
    grid-column: 1 / 3;
  }

  .widget-week {
    grid-column: 1 / 3;
  }
}

/* Color-specific Glow Effects */
.stat-card-column:hover {
  border-color: rgba(100, 200, 255, 0.6);
  box-shadow: 0 0 40px rgba(100, 200, 255, 0.3), 0 40px 100px rgba(0, 0, 0, 0.6);
}

.stat-card-arc:hover {
  border-color: rgba(255, 144, 144, 0.6);
  box-shadow: 0 0 40px rgba(255, 144, 144, 0.3), 0 40px 100px rgba(0, 0, 0, 0.6);
}

.stat-card-bar:hover {
  border-color: rgba(255, 176, 144, 0.6);
  box-shadow: 0 0 40px rgba(255, 176, 144, 0.3), 0 40px 100px rgba(0, 0, 0, 0.6);
}

.stat-card-stacked:hover {
  border-color: rgba(100, 200, 255, 0.6);
  box-shadow: 0 0 40px rgba(100, 200, 255, 0.3), 0 40px 100px rgba(0, 0, 0, 0.6);
}

.stat-card-mini:hover {
  border-color: rgba(144, 238, 144, 0.6);
  box-shadow: 0 0 40px rgba(144, 238, 144, 0.3), 0 40px 100px rgba(0, 0, 0, 0.6);
}

.stat-card-impact:hover {
  border-color: rgba(200, 100, 255, 0.6);
  box-shadow: 0 0 40px rgba(200, 100, 255, 0.3), 0 40px 100px rgba(0, 0, 0, 0.6);
}

.stat-card h3 {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1.8rem 0;
  letter-spacing: 0.8px;
  position: relative;
  z-index: 1;
}

.stat-description {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.85rem;
  margin: 1.5rem 0 0 0;
  position: relative;
  z-index: 1;
}

/* Column Chart */
.column-chart {
  height: 180px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0;
  position: relative;
  z-index: 1;
}

.chart-bar {
  width: 60px;
  /* Fallback: var(--value, 0) falls die CSS-Variable nicht gesetzt ist */
  height: calc((var(--value, 0) * 1px));
  background: linear-gradient(180deg, var(--color) 0%, var(--color) 50%, rgba(255, 255, 255, 0.15) 100%);
  border-radius: 12px 12px 0 0;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 30px var(--color);
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4));
}

.chart-bar:hover {
  box-shadow: 0 0 50px var(--color), 0 20px 40px rgba(0, 0, 0, 0.5);
  transform: scaleY(1.05);
}

.bar-value {
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  color: #ffffff;
  font-weight: 900;
  font-size: 1.3rem;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
}

/* Arc Progress */
.arc-progress {
  position: relative;
  height: 120px;
  margin: 1.5rem 0;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arc-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 20px rgba(255, 144, 144, 0.4));
  transition: filter 0.4s ease;
}

.stat-card:hover .arc-svg {
  filter: drop-shadow(0 0 40px rgba(255, 144, 144, 0.6));
}

.arc-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #FF9090;
  font-size: 2.2rem;
  font-weight: 900;
  text-shadow: 0 0 20px rgba(255, 144, 144, 0.5);
}

/* Horizontal Bar */
.horizontal-bar {
  height: 35px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 18px;
  overflow: hidden;
  margin: 1.5rem 0;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.bar-segment {
  height: 100%;
  background: linear-gradient(90deg, var(--color) 0%, var(--color) 50%, rgba(255, 255, 255, 0.2) 100%);
  /* Fallback width in case --width is not defined */
  width: var(--width, 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.1), 0 0 25px var(--color);
  filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3));
}

.bar-segment:hover {
  box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.15), 0 0 40px var(--color);
}

.bar-text {
  color: #ffffff;
  font-weight: 900;
  font-size: 1rem;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
}

/* Stacked Bars */
.stacked-bars {
  display: flex;
  height: 50px;
  border-radius: 15px;
  overflow: hidden;
  margin: 1.5rem 0;
  gap: 3px;
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.02);
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stacked-item {
  background: linear-gradient(180deg, var(--color) 0%, var(--color) 50%, rgba(255, 255, 255, 0.15) 100%);
  /* Fallback flex value falls --percentage nicht gesetzt ist */
  flex: var(--percentage, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 0.95rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
  box-shadow: 0 0 20px var(--color), inset 0 0 15px rgba(255, 255, 255, 0.1);
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
}

.stacked-item:hover {
  box-shadow: 0 0 40px var(--color), inset 0 0 25px rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.stacked-legend {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1.2rem;
  position: relative;
  z-index: 1;
}

.stacked-legend span {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.85rem;
  font-weight: 600;
}

.stacked-legend em {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  box-shadow: 0 0 10px currentColor;
}

/* Animierte Balken - Größenwechsel auf Container Hover */
.stat-card {
  display: flex;
  flex-direction: column;
  min-height: 350px;
}

.stat-card-large {
  grid-column: span 1;
}

.stat-card-small {
  min-height: 320px;
  justify-content: space-between;
}

/* Animierte Säulen beim Hover */
.stat-card:hover .chart-bar {
  height: calc((var(--value, 0) * 1.15px));
  box-shadow: 0 0 60px var(--color), 0 20px 40px rgba(0, 0, 0, 0.5);
}

/* Animierte Balkenbreite beim Hover */
.stat-card:hover .bar-segment {
  width: calc((var(--width, 50%) * 1.2));
  box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.15), 0 0 50px var(--color);
  filter: drop-shadow(0 8px 25px rgba(0, 0, 0, 0.4));
}

/* Animierte gestapelte Balken beim Hover */
.stat-card:hover .stacked-item {
  box-shadow: 0 0 50px var(--color), inset 0 0 25px rgba(255, 255, 255, 0.15);
  transform: scale(1.08);
  filter: brightness(1.2);
}

/* Arc Glow Animation */
.stat-card:hover .arc-svg {
  filter: drop-shadow(0 0 40px rgba(255, 144, 144, 0.6));
}



/* Enhanced Glassmorphism - Option 9 */
.stats-visualization-grid .stat-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
}

.stats-visualization-grid .stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 25px 25px 0 0;
}

.stats-visualization-grid .stat-card:hover {
  background: rgba(220, 53, 69, 0.08);
  border-color: rgba(220, 53, 69, 0.3);
  box-shadow:
    0 6px 20px rgba(220, 53, 69, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
}

/* Enhanced Detail Modal Glassmorphism */
.detail-content {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
  position: relative;
}

.detail-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 30px 30px 0 0;
}

/* Mini Stats */
.mini-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 1.5rem 0;
  position: relative;
  z-index: 1;
}

.mini-stat {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.04);
  padding: 1.2rem;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.mini-stat:hover {
  background: rgba(220, 53, 69, 0.12);
  border-color: rgba(220, 53, 69, 0.2);
}

.mini-label {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.85rem;
  font-weight: 600;
}

.mini-value {
  font-size: 2rem;
  font-weight: 900;
  text-shadow: 0 0 15px currentColor;
}

/* Impact Circle */
.impact-circle {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 1.5rem auto;
  z-index: 1;
}

.impact-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 30px rgba(200, 100, 255, 0.4));
}

.impact-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #C864FF;
  font-size: 2rem;
  font-weight: 900;
  text-shadow: 0 0 20px rgba(200, 100, 255, 0.6);
}

/* Alerts Section */
.alerts-section {
  background: transparent;
  padding: 4rem 2rem;
}

.alerts-container {
  margin-top: 2rem;
}

.no-alerts {
  background: rgba(144, 238, 144, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(144, 238, 144, 0.3);
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
}

.no-alerts-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.no-alerts p {
  color: rgba(144, 238, 144, 0.8);
  font-size: 1.1rem;
}

.alert-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
}

.alert-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 20px 20px 0 0;
}

.alert-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(8px);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
}

.alert-card.warning {
  border-left: 4px solid rgba(255, 180, 100, 0.8);
}

.alert-card.warning:hover {
  box-shadow: -5px 0 20px rgba(255, 180, 100, 0.2);
}

.alert-card.info {
  border-left: 4px solid rgba(100, 200, 255, 0.8);
}

.alert-card.info:hover {
  box-shadow: -5px 0 20px rgba(100, 200, 255, 0.2);
}

.alert-card.success {
  border-left: 4px solid rgba(144, 238, 144, 0.8);
}

.alert-card.success:hover {
  box-shadow: -5px 0 20px rgba(144, 238, 144, 0.2);
}

.alert-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.alert-content {
  text-align: left;
  flex: 1;
}

.alert-title {
  color: #ffffff;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.alert-message {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.8rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.alert-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  margin: 0;
}

/* Other Actions Section */
.other-actions-section {
  background: transparent;
  padding: 4rem 2rem;
}

/* Action Buttons */
.section-content {
  max-width: 1400px;
  width: 100%;
}

.section-content h2 {
  font-size: 2.5rem;
  color: #ffffff;
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 900;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.action-btn:hover {
  background: rgba(220, 53, 69, 0.12);
  border-color: rgba(220, 53, 69, 0.4);
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(220, 53, 69, 0.15);
}

.action-icon {
  font-size: 2.5rem;
  display: block;
}

.action-text {
  font-size: 1rem;
  color: #ffffff;
  font-weight: 600;
}

.add-product-btn {
  border-color: rgba(220, 53, 69, 0.3);
}

.add-product-btn:hover {
  background: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.5);
}

.my-pantry-btn {
  border-color: rgba(220, 53, 69, 0.3);
}

.my-pantry-btn:hover {
  background: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.5);
}

.notifications-btn {
  border-color: rgba(220, 53, 69, 0.3);
}

.notifications-btn:hover {
  background: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.5);
}

/* Features Section */
.features-section {
  background: transparent;
  padding: 6rem 2rem;
}

.how-it-works-section {
  background: transparent;
  padding: 6rem 2rem;
}

/* Footer */
.footer {
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem 2rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  width: 100%;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.footer-section h4 {
  color: #ffffff;
  margin-bottom: 1rem;
  font-weight: 700;
}

.footer-section p {
  font-size: 0.9rem;
  line-height: 1.6;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .stats-grid,
  .action-buttons {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card,
  .action-btn {
    padding: 1.5rem;
  }

  .action-icon {
    font-size: 1.8rem;
  }

  .stat-icon {
    font-size: 1.8rem;
  }

  .profile-email {
    display: none;
  }

  .logo-text {
    font-size: 1.2rem;
  }
}

/* Progress Ring Styles */
.ring-container {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 1.5rem auto;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-background {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 12;
}

.ring-progress {
  fill: none;
  stroke-width: 12;
  stroke: var(--color, #64C8FF);
  stroke-dasharray: 565.48;
  stroke-dashoffset: calc(565.48 - (565.48 * var(--progress) / 100));
  stroke-linecap: round;
  transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 25px var(--color, #64C8FF)) drop-shadow(0 0 50px var(--color, #64C8FF));
}

.stat-card:hover .ring-progress {
  filter: drop-shadow(0 0 40px var(--color, #64C8FF)) drop-shadow(0 0 70px var(--color, #64C8FF));
  stroke-width: 14;
}

.ring-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.ring-number {
  font-size: 2.2rem;
  font-weight: 900;
  color: #ffffff;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3);
}

.ring-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

/* Detail Modal */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.detail-content {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 3rem;
  max-width: 500px;
  width: 90%;
  position: relative;
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.detail-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.detail-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.detail-breakdown h2 {
  color: #ffffff;
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0 0 1.5rem 0;
  letter-spacing: 1px;
}

.detail-info {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  transition: all 0.3s ease;
}

.breakdown-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.breakdown-label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 0.95rem;
}

.breakdown-value {
  color: rgba(100, 200, 255, 0.9);
  font-size: 1.3rem;
  font-weight: 900;
  text-shadow: 0 0 10px rgba(100, 200, 255, 0.3);
}
</style>



