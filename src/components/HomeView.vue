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
        <div class="profile-section">
          <div class="profile-icon">👤</div>
          <span class="profile-email">{{ currentUser }}</span>
          <button class="nav-button logout-btn" @click="logout">Abmelden</button>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <div class="scroll-container">
      <!-- Hero Section -->
      <section class="section hero-section">
        <h1>Willkommen, {{ userName }}! 👋</h1>
        <p class="home-subtitle">Deine Lebensmittel verwalten</p>
        <p class="home-tagline">{{ currentDate }}</p>
      </section>

      <!-- MyPantry - Main Feature -->
      <section class="section my-pantry-section">
        <button class="my-pantry-hero-btn" @click="showMyPantry = true">
          <span class="pantry-icon">📋</span>
          <span class="pantry-title">Meine Vorratskammer</span>
          <span class="pantry-description">Verwalte deine Lebensmittel</span>
          <span class="pantry-arrow">→</span>
        </button>
      </section>

      <!-- Quick Stats -->
      <section class="section quick-stats-section">
        <div class="section-content">
          <h2>Schnelle Übersicht</h2>
          <div class="quick-stats-grid">
            <div class="quick-stat">
              <span class="quick-stat-icon">📦</span>
              <span class="quick-stat-label">Heute</span>
              <span class="quick-stat-value">{{ todayStats }}</span>
            </div>
            <div class="quick-stat">
              <span class="quick-stat-icon">📅</span>
              <span class="quick-stat-label">Diese Woche</span>
              <span class="quick-stat-value">{{ weekStats }}</span>
            </div>
            <div class="quick-stat">
              <span class="quick-stat-icon">⏰</span>
              <span class="quick-stat-label">Bald ablaufend</span>
              <span class="quick-stat-value">{{ expiringStats }}</span>
            </div>
          </div>
        </div>
      </section>

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
      <section class="section other-actions-section">
        <div class="section-content">
          <h2>Weitere Funktionen</h2>
          <div class="action-buttons">
            <button class="action-btn add-product-btn" @click="addProductMode = true">
              <span class="action-icon">➕</span>
              <span class="action-text">Neues Produkt</span>
            </button>
            <button class="action-btn notifications-btn">
              <span class="action-icon">🔔</span>
              <span class="action-text">Benachrichtigungen</span>
            </button>
            <button class="action-btn stats-btn">
              <span class="action-icon">📊</span>
              <span class="action-text">Statistiken</span>
            </button>
          </div>
        </div>
      </section>

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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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
const todayStats = ref(3)
const weekStats = ref(12)
const expiringStats = ref(2)

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
  return props.currentUser.split('@')[0]
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
</script>

<style scoped>
/* Home Page Styling */
.home-page {
  background: #000000;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow: hidden;
}

.scroll-container {
  flex: 1;
  overflow-y: scroll;
  overflow-x: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  background: #000000;
  min-height: 0;
}

.scroll-container::-webkit-scrollbar {
  width: 8px;
}

.scroll-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.scroll-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
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
  background: #000000;
  padding-top: 100px;
  padding-bottom: 4rem;
  text-align: center;
}

.hero-section h1 {
  font-size: 3.5rem;
  color: #ffffff;
  font-weight: 900;
  letter-spacing: 2px;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #e8e8e8 50%, #d0d0d0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.home-subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.home-tagline {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
}

/* MyPantry Section - Main Feature */
.my-pantry-section {
  background: #000000;
  padding: 3rem 2rem;
}

.my-pantry-hero-btn {
  width: 100%;
  max-width: 600px;
  background: linear-gradient(135deg, rgba(100, 200, 255, 0.15) 0%, rgba(144, 238, 144, 0.1) 100%);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 2px solid rgba(100, 200, 255, 0.5);
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
}

.my-pantry-hero-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
}

.my-pantry-hero-btn:hover {
  background: linear-gradient(135deg, rgba(100, 200, 255, 0.25) 0%, rgba(144, 238, 144, 0.2) 100%);
  border-color: rgba(100, 200, 255, 0.8);
  transform: translateY(-8px);
  box-shadow: 0 30px 80px rgba(100, 200, 255, 0.3);
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
  background: #000000;
  padding: 4rem 2rem;
}

.quick-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.quick-stat {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quick-stat:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
}

.quick-stat-icon {
  font-size: 2rem;
  display: block;
}

.quick-stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.quick-stat-value {
  font-size: 2rem;
  color: rgba(100, 200, 255, 0.9);
  font-weight: 900;
}

/* Alerts Section */
.alerts-section {
  background: #000000;
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
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.alert-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(8px);
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
  background: #000000;
  padding: 4rem 2rem;
}

/* Action Buttons */
.section-content {
  max-width: 1200px;
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
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-5px);
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
  border-color: rgba(100, 200, 255, 0.3);
}

.add-product-btn:hover {
  background: rgba(100, 200, 255, 0.1);
  border-color: rgba(100, 200, 255, 0.5);
}

.my-pantry-btn {
  border-color: rgba(144, 238, 144, 0.3);
}

.my-pantry-btn:hover {
  background: rgba(144, 238, 144, 0.1);
  border-color: rgba(144, 238, 144, 0.5);
}

.notifications-btn {
  border-color: rgba(255, 180, 100, 0.3);
}

.notifications-btn:hover {
  background: rgba(255, 180, 100, 0.1);
  border-color: rgba(255, 180, 100, 0.5);
}

.stats-btn {
  border-color: rgba(200, 100, 255, 0.3);
}

.stats-btn:hover {
  background: rgba(200, 100, 255, 0.1);
  border-color: rgba(200, 100, 255, 0.5);
}

/* Features Section */
.features-section {
  background: #000000;
  padding: 6rem 2rem;
}

.how-it-works-section {
  background: #000000;
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
</style>

