<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import HomeView from './HomeView.vue'

const baseUrl = import.meta.env.VITE_API_URL || 'https://pantrix.onrender.com'
const products = ref<any[]>([])
const isLoading = ref(false)

// Login/Registrierungs-States
const showAuthModal = ref(false)
const isLoginMode = ref(true)
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const errorMessage = ref('')
const isLoggedIn = ref(false)
const currentUser = ref<string>('')
const showHomePage = ref(false)

// Physik-Engine für Sphären
interface Sphere {
  element: HTMLElement
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  mass: number
}

const spheres = ref<Sphere[]>([])
let animationFrameId: number | null = null

const initSpheres = () => {
  const sphereElements = Array.from(document.querySelectorAll('.sphere')) as HTMLElement[]

  // Responsive Größen basierend auf Viewport
  let sizes: readonly number[]
  if (window.innerWidth <= 768) {
    // Mobile Größen
    sizes = [120, 90, 110, 100, 110] as const
  } else {
    // Desktop/Tablet Größen
    sizes = [350, 280, 320, 300, 320] as const
  }
  const newSpheres: Sphere[] = []

  for (let idx = 0; idx < sphereElements.length; idx++) {
    const element = sphereElements[idx]!
    const size = sizes[idx]!
    newSpheres.push({
      element,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: size / 2,
      mass: 1
    })
  }

  spheres.value = newSpheres
}

const updatePhysics = () => {
  const padding = 50

  // Update positions und check boundaries
  spheres.value.forEach((sphere, idx) => {
    // Keine Schwerkraft - konstante Bewegung in zufällige Richtungen
    // Die Velocities bleiben erhalten, bis zur Collision oder Boundary

    // Position update
    sphere.x += sphere.vx
    sphere.y += sphere.vy

    // Boundary collision (Wände) - sanfter Bounce
    // Nutze window.innerHeight für aktuelle Viewport-Höhe, nicht Scroll-Höhe
    if (sphere.x - sphere.radius < padding) {
      sphere.x = padding + sphere.radius
      sphere.vx *= -1
    }
    if (sphere.x + sphere.radius > window.innerWidth - padding) {
      sphere.x = window.innerWidth - padding - sphere.radius
      sphere.vx *= -1
    }
    if (sphere.y - sphere.radius < 0) { // Top boundary
      sphere.y = sphere.radius
      sphere.vy *= -1
    }
    if (sphere.y + sphere.radius > window.innerHeight) {
      sphere.y = window.innerHeight - sphere.radius
      sphere.vy *= -1
    }

    // Apply position
    sphere.element.style.left = sphere.x - sphere.radius + 'px'
    sphere.element.style.top = sphere.y - sphere.radius + 'px'
  })

  // Sphere-to-sphere collision (gegenseitige Abstoßung - echte Physik)
  for (let i = 0; i < spheres.value.length; i++) {
    for (let j = i + 1; j < spheres.value.length; j++) {
      const s1 = spheres.value[i]
      const s2 = spheres.value[j]

      if (!s1 || !s2) continue

      const dx = s2.x - s1.x
      const dy = s2.y - s1.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const minDistance = s1.radius + s2.radius + 5

      if (distance < minDistance && distance > 0) {
        // Normalize direction
        const nx = dx / distance
        const ny = dy / distance

        // 1. Separation - verhindert Überlappung
        const overlap = minDistance - distance
        const separationForce = overlap * 0.7
        s1.x -= nx * separationForce
        s1.y -= ny * separationForce
        s2.x += nx * separationForce
        s2.y += ny * separationForce

        // 2. Elastische Kollision - Geschwindigkeiten austauschen
        // Relative Geschwindigkeit
        const dvx = s2.vx - s1.vx
        const dvy = s2.vy - s1.vy

        // Relative Geschwindigkeit in Kollisionsrichtung
        const dotProduct = dvx * nx + dvy * ny

        // Nur wenn sie sich aufeinander zu bewegen
        if (dotProduct < 0) {
          // Für gleiche Massen: Velocities tauschen sich aus
          // Coefficient of restitution = 1 (perfekt elastisch)
          const restitution = 1.0

          // Impulse berechnen
          const impulse = -(1 + restitution) * dotProduct / 2

          // Velocities anpassen
          s1.vx -= impulse * nx
          s1.vy -= impulse * ny
          s2.vx += impulse * nx
          s2.vy += impulse * ny
        }
      }
    }
  }

  animationFrameId = requestAnimationFrame(updatePhysics)
}

const startPhysicsEngine = () => {
  initSpheres()

  // Mache die Sphären sichtbar nach kurzer Verzögerung
  setTimeout(() => {
    document.querySelectorAll('.sphere').forEach((el) => {
      el.classList.add('loaded')
    })
  }, 50)

  updatePhysics()
}

const stopPhysicsEngine = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
}

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

const addProduct = async (name: string, expiryDate: string) => {
  try {
    const response = await axios.post(`${baseUrl}/test`, {
      name: name,
      expiryDate: expiryDate
    })
    console.log('Produkt hinzugefügt:', response.data)
    await loadProducts()
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Produkts:', error)
  }
}

// Auth Modal Funktionen
const openAuthModal = () => {
  showAuthModal.value = true
  isLoginMode.value = true
  email.value = ''
  password.value = ''
  passwordConfirm.value = ''
  errorMessage.value = ''
}

const closeAuthModal = () => {
  showAuthModal.value = false
  email.value = ''
  password.value = ''
  passwordConfirm.value = ''
  errorMessage.value = ''
}

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  errorMessage.value = ''
  passwordConfirm.value = ''
}

const logout = () => {
  isLoggedIn.value = false
  currentUser.value = ''
  showHomePage.value = false
  email.value = ''
  password.value = ''
  passwordConfirm.value = ''
  errorMessage.value = ''
}

const handleLogin = () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Bitte füllen Sie alle Felder aus'
    return
  }

  if (!email.value.includes('@')) {
    errorMessage.value = 'Bitte geben Sie eine gültige E-Mail ein'
    return
  }

  console.log('Login:', email.value, password.value)
  isLoggedIn.value = true
  currentUser.value = email.value
  showHomePage.value = true
  closeAuthModal()
}

const handleRegister = () => {
  errorMessage.value = ''

  if (!email.value || !password.value || !passwordConfirm.value) {
    errorMessage.value = 'Bitte füllen Sie alle Felder aus'
    return
  }

  if (!email.value.includes('@')) {
    errorMessage.value = 'Bitte geben Sie eine gültige E-Mail ein'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Passwort muss mindestens 6 Zeichen lang sein'
    return
  }

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'Passwörter stimmen nciht überein'
    return
  }

  console.log('Register:', email.value, password.value)
  isLoggedIn.value = true
  currentUser.value = email.value
  showHomePage.value = true
  closeAuthModal()
}

onMounted(() => {
  loadProducts()
  startPhysicsEngine()
})

onUnmounted(() => {
  stopPhysicsEngine()
})
</script>

<template>
  <!-- Home Page (nach Login) -->
  <HomeView v-if="showHomePage" :current-user="currentUser" :on-logout="logout" />

  <!-- Landing Page (vor Login) -->
  <div v-else class="landing-page">
    <!-- Top Bar / Header -->
    <header class="top-bar">
      <div class="logo-container">
        <div class="logo">
          <span class="logo-text">PanTrix</span>
        </div>
      </div>
      <nav class="nav-links">
        <button v-if="!isLoggedIn" class="nav-button">Über uns</button>
        <button v-if="!isLoggedIn" class="nav-button">Features</button>
        <button v-if="!isLoggedIn" class="nav-button" @click="openAuthModal" style="margin-left: auto;">Anmelden</button>

        <!-- Profil Section wenn angemeldet -->
        <div v-if="isLoggedIn" class="profile-section">
          <div class="profile-icon">👤</div>
          <span class="profile-email">{{ currentUser }}</span>
          <button class="nav-button logout-btn" @click="logout">Abmelden</button>
        </div>
      </nav>
    </header>

    <!-- Scrollable Container -->
    <div class="scroll-container">
      <!-- Hero Section -->
      <section class="section hero-section">
        <!-- Schwebende Sphären -->
        <div class="sphere sphere1"></div>
        <div class="sphere sphere2"></div>
        <div class="sphere sphere3"></div>
        <div class="sphere sphere4"></div>
        <div class="sphere sphere5"></div>

        <!-- Glass Container -->
        <div class="glass-container">
          <h1>Willkommen zu PanTrix</h1>
          <p class="hero-subtitle">Dein intelligenter Lebensmittel-Tracker</p>
          <p class="hero-tagline">Spare Geld, schütze die Umwelt, verschwende nichts mehr</p>
          <button class="btn-login" @click="openAuthModal">Jetzt anmelden</button>
        </div>
      </section>

      <!-- Features Section -->
      <section class="section features-section">
        <div class="section-content">
          <h2>Warum PanTrix?</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🔔</div>
              <h3>Intelligente Benachrichtigungen</h3>
              <p>Werde rechtzeitig benachrichtigt, bevor Lebensmittel ablaufen und verschwenden nicht mehr!</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🍳</div>
              <h3>Rezept-Vorschläge</h3>
              <p>Erhalte personalisierte Rezepte für Frühstück, Mittagessen und Abendessen basierend auf deinen Lebensmitteln</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🌍</div>
              <h3>Umwelt sparen</h3>
              <p>Reduziere Lebensmittelverschwendung und trage zu einer nachhaltigen Zukunft bei</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💰</div>
              <h3>Geld sparen</h3>
              <p>Nutze deine Lebensmittel optimal und spare Geld beim Einkaufen</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="section how-it-works-section">
        <div class="section-content">
          <h2>So funktioniert's</h2>
          <div class="steps-container">
            <div class="step">
              <div class="step-number">1</div>
              <h3>Hinzufügen</h3>
              <p>Scanne oder gib deine Lebensmittel mit Ablaufdatum ein</p>
            </div>
            <div class="step-arrow">→</div>
            <div class="step">
              <div class="step-number">2</div>
              <h3>Benachrichtigungen</h3>
              <p>Erhalte Warnungen, bevor Lebensmittel ablaufen</p>
            </div>
            <div class="step-arrow">→</div>
            <div class="step">
              <div class="step-number">3</div>
              <h3>Verwalten</h3>
              <p>Behalte den Überblick über deine Lebensmittel</p>
            </div>
          </div>
          <div class="upcoming-feature">
            <p>🔜 <strong>Bald verfügbar:</strong> Intelligente Rezept-Vorschläge basierend auf deinen Lebensmitteln</p>
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
          <div class="footer-section">
            <h4>Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">Über uns</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Rechtliches</h4>
            <ul>
              <li><a href="#privacy">Datenschutz</a></li>
              <li><a href="#terms">Nutzungsbedingungen</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 PanTrix. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>

    <!-- Auth Modal -->
    <Transition name="modal-fade">
      <div v-if="showAuthModal" class="modal-overlay" @click.self="closeAuthModal">
        <div class="auth-modal-flip-container">
          <div class="auth-modal-flipper" :class="{ flipped: !isLoginMode }">
            <!-- Login Side -->
            <div class="auth-modal-front glass">
              <div class="auth-form">
                <h2>Anmelden</h2>
                <p class="auth-subtitle">Willkommen zurück!</p>

                <div class="form-group">
                  <label>E-Mail</label>
                  <input
                    v-model="email"
                    type="email"
                    placeholder="deine@email.com"
                    class="input-field"
                  />
                </div>

                <div class="form-group">
                  <label>Passwort</label>
                  <input
                    v-model="password"
                    type="password"
                    placeholder="••••••••"
                    class="input-field"
                    @keyup.enter="handleLogin"
                  />
                </div>

                <div v-if="errorMessage && isLoginMode" class="error-message">{{ errorMessage }}</div>

                <button @click="handleLogin" class="btn-submit">Anmelden</button>

                <p class="auth-toggle">
                  Noch kein Konto?
                  <button @click="toggleMode" class="toggle-link">Registrieren</button>
                </p>
              </div>
            </div>

            <!-- Register Side -->
            <div class="auth-modal-back glass">
              <div class="auth-form">
                <h2>Registrieren</h2>
                <p class="auth-subtitle">Erstelle dein Konto</p>

                <div class="form-group">
                  <label>E-Mail</label>
                  <input
                    v-model="email"
                    type="email"
                    placeholder="deine@email.com"
                    class="input-field"
                  />
                </div>

                <div class="form-group">
                  <label>Passwort</label>
                  <input
                    v-model="password"
                    type="password"
                    placeholder="••••••••"
                    class="input-field"
                  />
                </div>

                <div class="form-group">
                  <label>Passwort bestätigen</label>
                  <input
                    v-model="passwordConfirm"
                    type="password"
                    placeholder="••••••••"
                    class="input-field"
                    @keyup.enter="handleRegister"
                  />
                </div>

                <div v-if="errorMessage && !isLoginMode" class="error-message">{{ errorMessage }}</div>

                <button @click="handleRegister" class="btn-submit">Registrieren</button>

                <p class="auth-toggle">
                  Du hast schon ein Konto?
                  <button @click="toggleMode" class="toggle-link">Anmelden</button>
                </p>
              </div>
            </div>
          </div>

          <button @click="closeAuthModal" class="btn-close" :class="{ flipped: !isLoginMode }">✕</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-page {
  background: #000000;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow: hidden;
}

/* Top Bar / Header */
.top-bar {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.1);
  padding: 1.2rem 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.15);
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo:hover {
  transform: translateY(-2px);
}

.logo-icon {
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-button {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  font-weight: 500;
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

/* Profile Section - Glass Morphism */
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

/* Scroll Container */
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
}

.features-section {
  background: #000000;
  padding: 6rem 2rem;
}

.how-it-works-section {
  background: #000000;
  padding: 6rem 2rem;
}

.section-content {
  max-width: 1200px;
  width: 100%;
}

.section-content h2 {
  font-size: 3.5rem;
  color: #ffffff;
  text-align: center;
  margin-bottom: 4rem;
  font-weight: 900;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 3rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 3rem 1.5rem;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
  z-index: 10;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 25px 25px 0 0;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-10px);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.2rem;
  display: block;
}

.feature-card h3 {
  font-size: 1.1rem;
  color: #ffffff;
  margin-bottom: 1rem;
  font-weight: 700;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1.6;
}

/* Steps Container */
.steps-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 3rem;
}

.step {
  flex: 1;
  min-width: 250px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
  z-index: 10;
}

.step::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 20px 20px 0 0;
}

.step:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(173, 216, 255, 0.3), rgba(255, 105, 180, 0.3));
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 2rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0 auto 1.5rem;
}

.step h3 {
  font-size: 1.3rem;
  color: #ffffff;
  margin-bottom: 0.8rem;
  font-weight: 700;
}

.step p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.step-arrow {
  color: rgba(255, 255, 255, 0.3);
  font-size: 2rem;
  font-weight: bold;
  display: none;
}

@media (min-width: 768px) {
  .step-arrow {
    display: block;
  }
}

/* Upcoming Feature Box */
.upcoming-feature {
  margin-top: 3rem;
  padding: 1.5rem 2rem;
  background: rgba(144, 238, 144, 0.08);
  border: 1px solid rgba(144, 238, 144, 0.3);
  border-radius: 15px;
  text-align: center;
  color: rgba(144, 238, 144, 0.9);
  font-size: 0.95rem;
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  transition: all 0.3s ease;
}

.upcoming-feature:hover {
  background: rgba(144, 238, 144, 0.08);
  border-color: rgba(144, 238, 144, 0.5);
  transform: translateY(-2px);
}

.upcoming-feature p {
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.3px;
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

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.9rem;
}

.footer-section a:hover {
  color: #ffffff;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.landing-page {
  background: #000000;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow: hidden;
}

/* Schwebende Sphären */
.sphere {
  position: fixed;
  border-radius: 50%;
  box-shadow:
    /* Hauptschatten */
    0 30px 80px rgba(0, 0, 0, 0.9),
    /* Innere Highlights */
    inset -20px -20px 50px rgba(0, 0, 0, 0.6),
    inset 10px 10px 40px rgba(255, 255, 255, 0.5),
    inset -5px -5px 20px rgba(0, 0, 0, 0.4),
    /* Oberflächenglanz */
    inset 15px 15px 30px rgba(255, 255, 255, 0.4);
  filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.7));
  z-index: 1;
  opacity: 1;
  animation: fallFromTop var(--fall-duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  pointer-events: none;
}

/* Individuelle Verzögerungen für jede Sphäre beim Laden */
.sphere1 {
  --fall-duration: 1.4s;
  animation-delay: 0s;
}

.sphere2 {
  --fall-duration: 1.6s;
  animation-delay: 0.15s;
}

.sphere3 {
  --fall-duration: 1.5s;
  animation-delay: 0.1s;
}

.sphere4 {
  --fall-duration: 1.7s;
  animation-delay: 0.2s;
}

.sphere5 {
  --fall-duration: 1.55s;
  animation-delay: 0.05s;
}

@keyframes fallFromTop {
  0% {
    transform: translateY(-150vh);
    opacity: 0;
  }

  5% {
    opacity: 1;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}


/* Sphere 1 - Hellblau */
.sphere1 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle at 25% 25%, rgba(100, 200, 255, 1) 0%, rgba(50, 150, 255, 0.9) 20%, rgba(30, 120, 220, 0.6) 45%, rgba(20, 80, 180, 0.2) 70%, rgba(0, 0, 0, 0.3));
}

/* Sphere 2 - Rosa */
.sphere2 {
  width: 280px;
  height: 280px;
  background: radial-gradient(circle at 25% 25%, rgba(255, 100, 180, 1) 0%, rgba(255, 50, 150, 0.9) 20%, rgba(230, 20, 120, 0.6) 45%, rgba(180, 10, 80, 0.2) 70%, rgba(0, 0, 0, 0.3));
}

/* Sphere 3 - Grün */
.sphere3 {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle at 25% 25%, rgba(100, 255, 100, 1) 0%, rgba(50, 220, 50, 0.9) 20%, rgba(20, 180, 20, 0.6) 45%, rgba(10, 140, 10, 0.2) 70%, rgba(0, 0, 0, 0.3));
}

/* Sphere 4 - Orange */
.sphere4 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle at 25% 25%, rgba(255, 180, 80, 1) 0%, rgba(255, 150, 50, 0.9) 20%, rgba(230, 120, 20, 0.6) 45%, rgba(180, 90, 10, 0.2) 70%, rgba(0, 0, 0, 0.3));
}

/* Sphere 5 - Violett */
.sphere5 {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle at 25% 25%, rgba(200, 100, 255, 1) 0%, rgba(180, 60, 255, 0.9) 20%, rgba(150, 40, 220, 0.6) 45%, rgba(120, 20, 180, 0.2) 70%, rgba(0, 0, 0, 0.3));
}


.glass-container {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  padding: 4rem 5rem;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
  min-width: auto;
  max-width: 900px;
  position: relative;
  z-index: 20;
  transition: all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

.glass-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 50px 50px 0 0;
}

.glass-container:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.landing-page h1 {
  font-size: 5.5rem;
  color: #ffffff;
  text-align: center;
  font-weight: 900;
  letter-spacing: 3px;
  margin: 0 auto 1.5rem auto;
  padding: 0;
  text-shadow:
    0 4px 30px rgba(0, 0, 0, 0.3),
    0 0 60px rgba(255, 255, 255, 0.15);
  background: linear-gradient(135deg, #ffffff 0%, #e8e8e8 50%, #d0d0d0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.12));
  animation: slideInDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  line-height: 1.2;
  width: 100%;
}

/* Hero Subtitle */
.hero-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  font-weight: 500;
  letter-spacing: 1.5px;
  margin: 0 0 1rem 0;
  padding: 0;
  animation: slideInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s backwards;
  line-height: 1.4;
}

/* Hero Tagline */
.hero-tagline {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  font-weight: 300;
  letter-spacing: 0.8px;
  margin: 0 0 2.5rem 0;
  padding: 0;
  max-width: 600px;
  line-height: 1.7;
  animation: slideInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-login {
  margin-top: 2.5rem;
  padding: 1.2rem 3.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  letter-spacing: 1px;
  animation: slideInUp 0.8s ease-out 0.6s backwards;
  margin-left: auto;
  margin-right: auto;
  display: block;
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
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-3px);
  box-shadow:
    0 10px 30px rgba(255, 255, 255, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.btn-login:hover::before {
  left: 100%;
}

/* Lichtimpulse - subtil und elegant - hinter Sphären */
/* ENTFERNT */

@media (max-width: 768px) {
  /* Landing Page */
  .landing-page {
    padding-top: 60px;
  }

  .top-bar {
    padding: 1rem 1.5rem;
  }

  .logo-text {
    font-size: 1.2rem !important;
  }

  .nav-links {
    gap: 0.5rem;
  }

  .nav-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  /* Glass Container */
  .glass-container {
    min-width: 90%;
    max-width: 95%;
    padding: 2rem 1.5rem;
    border-radius: 30px;
  }

  /* Hero Text */
  .landing-page h1 {
    font-size: 2.2rem;
    letter-spacing: 1px;
    margin-bottom: 1rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
    letter-spacing: 0.8px;
    margin-bottom: 0.8rem;
  }

  .hero-tagline {
    font-size: 0.9rem;
    letter-spacing: 0.5px;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  /* Button */
  .btn-login {
    padding: 0.9rem 2rem;
    font-size: 0.95rem;
    margin-top: 1.5rem;
  }

  /* Sections */
  .section {
    padding: 2rem 1rem;
  }

  .hero-section {
    padding-top: 60px;
  }

  .features-section {
    padding: 3rem 1rem;
  }

  .how-it-works-section {
    padding: 3rem 1rem;
  }

  /* Section Content */
  .section-content h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    letter-spacing: 1px;
  }

  /* Features Grid */
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .feature-card {
    padding: 1.5rem 1rem;
    min-height: auto;
    border-radius: 12px;
  }

  .feature-icon {
    font-size: 2rem;
    margin-bottom: 0.8rem;
  }

  .feature-card h3 {
    font-size: 1rem;
    margin-bottom: 0.6rem;
  }

  .feature-card p {
    font-size: 0.8rem;
    line-height: 1.4;
  }

  /* Steps */
  .steps-container {
    gap: 1rem;
  }

  .step {
    padding: 1.5rem 1rem;
    min-width: auto;
  }

  .step-number {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .step h3 {
    font-size: 1.1rem;
    margin-bottom: 0.6rem;
  }

  .step p {
    font-size: 0.8rem;
  }

  .step-arrow {
    font-size: 1.5rem;
    margin: 0 0.5rem;
  }

  /* Upcoming Feature */
  .upcoming-feature {
    padding: 1.2rem 1rem;
    margin-top: 2rem;
    font-size: 0.85rem;
  }

  .upcoming-feature p {
    font-size: 0.85rem;
  }

  /* Footer */
  .footer {
    padding: 2rem 1rem 1rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .footer-section h4 {
    font-size: 1rem;
  }

  .footer-section p,
  .footer-section a,
  .footer-bottom p {
    font-size: 0.8rem;
  }

  /* Auth Modal */
  .auth-modal-flip-container {
    width: 95%;
    max-width: 100%;
  }

  .auth-modal-front.glass,
  .auth-modal-back.glass {
    padding: 2rem 1.5rem;
    border-radius: 25px;
  }

  .auth-form h2 {
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }

  .auth-subtitle {
    font-size: 0.8rem;
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.2rem;
  }

  .form-group label {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
  }

  .input-field {
    padding: 0.8rem 0.9rem;
    font-size: 0.9rem;
  }

  .btn-submit {
    padding: 0.8rem;
    font-size: 0.9rem;
    margin-bottom: 1.2rem;
  }

  .auth-toggle {
    font-size: 0.75rem;
  }

  .btn-close {
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
    top: 1rem;
    right: 1rem;
  }

  /* Sphären - kleinere Sphären für Handy (Farben intensiv!) */
  .sphere1 {
    width: 120px !important;
    height: 120px !important;
    background: radial-gradient(circle at 25% 25%, rgba(100, 200, 255, 1) 0%, rgba(50, 150, 255, 0.9) 20%, rgba(30, 120, 220, 0.6) 45%, rgba(20, 80, 180, 0.2) 70%, rgba(0, 0, 0, 0.3)) !important;
  }

  .sphere2 {
    width: 90px !important;
    height: 90px !important;
    background: radial-gradient(circle at 25% 25%, rgba(255, 100, 180, 1) 0%, rgba(255, 50, 150, 0.9) 20%, rgba(230, 20, 120, 0.6) 45%, rgba(180, 10, 80, 0.2) 70%, rgba(0, 0, 0, 0.3)) !important;
  }

  .sphere3 {
    width: 110px !important;
    height: 110px !important;
    background: radial-gradient(circle at 25% 25%, rgba(100, 255, 100, 1) 0%, rgba(50, 220, 50, 0.9) 20%, rgba(20, 180, 20, 0.6) 45%, rgba(10, 140, 10, 0.2) 70%, rgba(0, 0, 0, 0.3)) !important;
  }

  .sphere4 {
    width: 100px !important;
    height: 100px !important;
    background: radial-gradient(circle at 25% 25%, rgba(255, 180, 80, 1) 0%, rgba(255, 150, 50, 0.9) 20%, rgba(230, 120, 20, 0.6) 45%, rgba(180, 90, 10, 0.2) 70%, rgba(0, 0, 0, 0.3)) !important;
  }

  .sphere5 {
    width: 110px !important;
    height: 110px !important;
    background: radial-gradient(circle at 25% 25%, rgba(200, 100, 255, 1) 0%, rgba(180, 60, 255, 0.9) 20%, rgba(150, 40, 220, 0.6) 45%, rgba(120, 20, 180, 0.2) 70%, rgba(0, 0, 0, 0.3)) !important;
  }
}

/* Auth Modal Flip Animation - Option 3 */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.auth-modal-flip-container {
  perspective: 1200px;
  width: 90%;
  max-width: 500px;
  position: relative;
}

.auth-modal-flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform-style: preserve-3d;
}

.auth-modal-flipper.flipped {
  transform: rotateY(180deg);
}

.auth-modal-front,
.auth-modal-back {
  backface-visibility: hidden;
  position: relative;
  width: 100%;
}

.auth-modal-front {
  transform: rotateY(0deg);
}

.auth-modal-back {
  transform: rotateY(180deg);
  position: absolute;
  top: 0;
  left: 0;
}

.auth-modal-front.glass,
.auth-modal-back.glass {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  padding: 3.5rem 2.5rem;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
}

.auth-modal-front.glass::before,
.auth-modal-back.glass::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 40px 40px 0 0;
}

.auth-form {
  position: relative;
  z-index: 1;
}

.auth-form h2 {
  font-size: 1.8rem;
  color: #ffffff;
  text-align: center;
  margin-bottom: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.auth-subtitle {
  color: rgba(255, 255, 255, 0.65);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.85rem;
  letter-spacing: 0.3px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  margin-bottom: 0.6rem;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.input-field {
  width: 100%;
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: #ffffff;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input-field:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.1);
}

.error-message {
  background: rgba(244, 67, 54, 0.15);
  border: 1px solid rgba(244, 67, 54, 0.4);
  color: #ff9999;
  padding: 0.7rem 0.9rem;
  border-radius: 8px;
  margin-bottom: 1.2rem;
  font-size: 0.8rem;
  text-align: center;
  letter-spacing: 0.3px;
}

.btn-submit {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  margin-bottom: 1.5rem;
  letter-spacing: 0.5px;
}

.btn-submit:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow:
    0 8px 20px rgba(255, 255, 255, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.auth-toggle {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  letter-spacing: 0.3px;
  line-height: 1.4;
}

.toggle-link {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.95);
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.3s ease;
  padding: 0;
  margin-left: 0.3rem;
}

.toggle-link:hover {
  color: rgba(200, 200, 255, 1);
}

.btn-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.btn-close.flipped {
  transform: rotateY(180deg);
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.btn-close.flipped:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: rotateY(180deg) rotate(90deg);
}


/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .auth-modal,
.modal-fade-leave-active .auth-modal {
  transition: all 0.3s ease;
}

.modal-fade-enter .auth-modal,
.modal-fade-leave-to .auth-modal {
  transform: scale(0.9);
  opacity: 0;
}
</style>

