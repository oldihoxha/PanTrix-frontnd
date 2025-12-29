<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import HomeView from './HomeView.vue'
import * as THREE from 'three'

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

// 3D Scene Setup
let scene: THREE.Scene
let camera: THREE.OrthographicCamera
let renderer: THREE.WebGLRenderer
let apples: any[] = []
let animationFrameId: number | null = null
const BOUNCE_DAMPING = 0.7  // Weltraum-Effekt: sanftes, elastisches Abprallen

const APPLE_RADIUS = 80 // Größerer Apfel (war 55, jetzt 80)

let heroSectionHeight = 0
let viewportWidthWorld = 0
let viewportHeightWorld = 0

// Scale Animation States
const currentSloganIndex = ref(0)
const currentSlogan = ref('')
const isScaling = ref(false)
const isFading = ref(false)

// Slogans für die Typing-Animation
const slogans = [
  'Dein intelligenter Lebensmittel-Tracker',
  'Spare Geld, schütze die Umwelt, verschwende nichts mehr',
  'Rette Lebensmittel',
  'Schone die Umwelt',
  'Sei nachhaltig'
]

// Explosion Animation States
const isExplosionMode = ref(false)
const explosionDuration = 2000 // 2 Sekunden
const explosionStartTime = ref(0)

const createRealisticApple = (x: number, y: number, vx: number = 0, vy: number = 0, scale: number = 1.0) => {
  // Apfel als detaillierte Kugel mit Stieldetails
  const appleGroup = new THREE.Group()

  // Hauptkörper - rote Kugel mit realistischen Materialien
  const sphereGeometry = new THREE.SphereGeometry(APPLE_RADIUS, 64, 64)

  const appleMaterial = new THREE.MeshStandardMaterial({
    color: 0xdc3545,  // Natürliches, sattes Rot
    metalness: 0.05,
    roughness: 0.5,
    emissive: 0x330000,  // Subtiles inneres Glühen
    emissiveIntensity: 0.06,
    flatShading: false,
    wireframe: false
  })

  const sphere = new THREE.Mesh(sphereGeometry, appleMaterial)
  sphere.castShadow = true
  sphere.receiveShadow = true
  // Stelle sicher, dass der Apfel immer uniform skaliert ist (keine Verzerrung)
  sphere.scale.set(1, 1, 1)
  appleGroup.add(sphere)

  // Stiel (etwas dunkler und natürlicher)
  const stemGeometry = new THREE.CylinderGeometry(4, 5, 20, 8)
  const stemMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b4423,  // Natürlicheres Braun
    metalness: 0,
    roughness: 0.8
  })
  const stem = new THREE.Mesh(stemGeometry, stemMaterial)
  stem.position.y = APPLE_RADIUS + 2
  stem.castShadow = true
  stem.receiveShadow = true
  appleGroup.add(stem)

  // Blatt
  const leafGeometry = new THREE.BufferGeometry()
  const leafVertices = new Float32Array([
    0, 0, 0,      // Anfang
    15, 8, 0,     // Spitze
    18, -2, 0,    // Ende
    0, -5, 0      // Verbindung
  ])
  const leafIndices = [0, 1, 2, 0, 2, 3]
  leafGeometry.setAttribute('position', new THREE.BufferAttribute(leafVertices, 3))
  leafGeometry.setIndex(leafIndices)
  leafGeometry.computeVertexNormals()

  const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d6b2e,  // Natürlicheres Blattgrün
    metalness: 0,
    roughness: 0.6,
    side: THREE.DoubleSide
  })
  const leaf = new THREE.Mesh(leafGeometry, leafMaterial)
  leaf.position.set(8, APPLE_RADIUS + 2, 0)
  leaf.rotation.z = 0.3
  leaf.castShadow = true
  leaf.receiveShadow = true
  appleGroup.add(leaf)

  // Glanzpunkt für Realismus
  const shineGeometry = new THREE.SphereGeometry(25, 32, 32)
  const shineMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd9d9,  // Sanfteres Rosa/Weiß
    metalness: 0.7,
    roughness: 0.1,
    emissive: 0xffaaaa,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.65
  })
  const shine = new THREE.Mesh(shineGeometry, shineMaterial)
  shine.position.set(-12, 15, -15)
  shine.scale.set(0.6, 0.8, 0.4)
  appleGroup.add(shine)

  appleGroup.position.set(x, y, 0)
  // Wende individuelle Skalierung an für Größenvariation
  appleGroup.scale.set(scale, scale, scale)

  scene.add(appleGroup)

  const appleObj = {
    type: 'apple',
    group: appleGroup,
    mesh: sphere,
    x: x,
    y: y,
    z: 0,
    vx: vx,  // Nutze übergebene Geschwindigkeit
    vy: vy,  // Nutze übergebene Geschwindigkeit
    vz: 0,
    radius: APPLE_RADIUS * scale,  // Radius angepasst an Scale
    resting: false,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scale: scale  // Speichere Scale für später
  }

  apples.push(appleObj)
  return appleObj
}


const init3DScene = () => {
  const container = document.querySelector('.hero-section') as HTMLElement
  if (!container) return

  heroSectionHeight = container.clientHeight

  // Scene setup
  scene = new THREE.Scene()

  // Schwarzer Hintergrund
  scene.background = new THREE.Color(0x000000)
  scene.fog = new THREE.Fog(0x000000, 1500, 4000)

  // Orthographic Camera: sorgt dafür, dass Kugeln unabhängig von X/Y-Position rund bleiben
  // Wir verwenden World-Einheiten, die 1:1 zu Pixeln sind (Viewport in Pixeln als World)
  viewportWidthWorld = window.innerWidth
  viewportHeightWorld = window.innerHeight

  const left = -viewportWidthWorld / 2
  const right = viewportWidthWorld / 2
  const top = viewportHeightWorld / 2
  const bottom = -viewportHeightWorld / 2

  camera = new THREE.OrthographicCamera(left, right, top, bottom, -2000, 2000)
  // Positioniere Kamera so, dass Z=0 die Ebene ist, auf der Äpfel liegen
  camera.position.set(0, 0, 1000)
  camera.lookAt(0, 0, 0)

  // Renderer mit besseren Einstellungen
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  // begrenze pixel ratio für Performance/Stabilität
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  // setSize und update style zusammen
  renderer.setSize(window.innerWidth, window.innerHeight, true)
  // explizit CSS-Größen setzen, damit Canvas-Style und drawing buffer übereinstimmen
  renderer.domElement.style.width = `${window.innerWidth}px`
  renderer.domElement.style.height = `${window.innerHeight}px`
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap  // Weichere Schatten
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1  // Leicht erhöht für Premium-Look

  const canvas = container.querySelector('canvas')
  if (canvas) container.removeChild(canvas)
  container.insertBefore(renderer.domElement, container.firstChild)

  // Premium Studio-Beleuchtung für hochwertigen Look
  const ambientLight = new THREE.AmbientLight(0xf0f0ff, 0.3)  // Kühler, subtiler Ambient
  scene.add(ambientLight)

  // Hauptlicht von oben (kühl-weiß für Premium-Look)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
  directionalLight.position.set(200, 700, 400)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.left = -600
  directionalLight.shadow.camera.right = 600
  directionalLight.shadow.camera.top = 600
  directionalLight.shadow.camera.bottom = -600
  directionalLight.shadow.bias = -0.0001
  scene.add(directionalLight)

  // Fülllicht von der Seite (kühles Blau für Tiefe)
  const fillLight = new THREE.DirectionalLight(0x88bbff, 0.35)
  fillLight.position.set(-400, 250, 300)
  scene.add(fillLight)

  // Akzentlicht von hinten (Cyan für modernen Look)
  const rimLight = new THREE.DirectionalLight(0x66ddff, 0.4)
  rimLight.position.set(0, 250, -400)
  scene.add(rimLight)

  // Warmes Gegenlicht für Kontrast (subtil)
  const warmAccent = new THREE.PointLight(0xffddaa, 0.25)
  warmAccent.position.set(350, 450, 350)
  scene.add(warmAccent)

  // Subtile Boden-Ebene für Schatten-Effekt (unsichtbar, nur für Schatten)
  const floorGeometry = new THREE.PlaneGeometry(5000, 5000)
  const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.15 })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -viewportHeightWorld / 2
  floor.receiveShadow = true
  scene.add(floor)


  // Erstelle 5 schwebende Äpfel mit verschiedenen Startpositionen und Größen
  // Langsame Weltraum-Geschwindigkeiten für schwebendes Gefühl
  const applePositions = [
    { x: -viewportWidthWorld * 0.3, y: viewportHeightWorld * 0.2, vx: 0.4, vy: -0.3, scale: 0.8 },
    { x: viewportWidthWorld * 0.25, y: viewportHeightWorld * 0.1, vx: -0.35, vy: 0.45, scale: 1.2 },
    { x: -viewportWidthWorld * 0.15, y: -viewportHeightWorld * 0.15, vx: 0.3, vy: 0.4, scale: 1.0 },
    { x: viewportWidthWorld * 0.35, y: -viewportHeightWorld * 0.25, vx: -0.5, vy: -0.35, scale: 1.4 },
    { x: 0, y: viewportHeightWorld * 0.3, vx: 0.45, vy: 0.3, scale: 0.9 }
  ]

  applePositions.forEach(pos => {
    createRealisticApple(pos.x, pos.y, pos.vx, pos.vy, pos.scale)
  })

  // Starte die Haupt-Animationsschleife
  animate3D()
}

const animate3D = () => {
  animationFrameId = requestAnimationFrame(animate3D)

  // Normale Physik-Phase (Äpfel schweben frei)

  // Physik-Update für jeden Apfel (schwebend, keine Schwerkraft)
  apples.forEach((apple) => {
    // Stelle sicher, dass die korrekte individuelle Skalierung erhalten bleibt
    if (apple.group && apple.scale) apple.group.scale.set(apple.scale, apple.scale, apple.scale)
    if (apple.mesh) apple.mesh.scale.set(1, 1, 1)

    // Keine Schwerkraft - Äpfel schweben frei
    // Keine resting-Logik mehr

    // Minimale Reibung (Weltraum-Effekt: fast keine Dämpfung)
    apple.vx *= 0.9995  // Extrem geringe Reibung für schwebendes Gefühl
    apple.vy *= 0.9995
    apple.vz *= 0.9995

    // Position updaten
    apple.x += apple.vx
    apple.y += apple.vy
    apple.z += apple.vz

    // Rotation basierend auf Bewegung (immer)
    apple.rotationX += apple.vz * 0.005
    apple.rotationY += apple.vx * 0.005
    apple.rotationZ += apple.vy * 0.005

    // Alle 4 Grenzen (Bounce an allen Seiten) - Äpfel bleiben im sichtbaren Bereich
    if (apple.x - apple.radius < -viewportWidthWorld / 2) {
      apple.x = -viewportWidthWorld / 2 + apple.radius
      apple.vx *= -BOUNCE_DAMPING
    }
    if (apple.x + apple.radius > viewportWidthWorld / 2) {
      apple.x = viewportWidthWorld / 2 - apple.radius
      apple.vx *= -BOUNCE_DAMPING
    }

    if (apple.y - apple.radius < -viewportHeightWorld / 2) {
      apple.y = -viewportHeightWorld / 2 + apple.radius
      apple.vy *= -BOUNCE_DAMPING
    }
    if (apple.y + apple.radius > viewportHeightWorld / 2) {
      apple.y = viewportHeightWorld / 2 - apple.radius
      apple.vy *= -BOUNCE_DAMPING
    }

    // Mesh Position & Rotation updaten
    apple.group.position.set(apple.x, apple.y, apple.z)

    // Rotation für Äpfel (nur Mesh rotiert, nicht die Gruppe)
    if (apple.type === 'apple') {
      apple.mesh.rotation.x = apple.rotationX
      apple.mesh.rotation.y = apple.rotationY
      apple.mesh.rotation.z = apple.rotationZ
    }
  })

  // Kollisionserkennung zwischen Äpfeln - wie ursprüngliche Spheren mit Abstoßung
  for (let i = 0; i < apples.length; i++) {
    for (let j = i + 1; j < apples.length; j++) {
      const a1 = apples[i]
      const a2 = apples[j]

      // Beide sind Spheres (Apfel) - präzise Sphere-Sphere Kollision
      const dx = a2.x - a1.x
      const dy = a2.y - a1.y
      const dz = a2.z - a1.z
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

      // Exakte Radien für perfekte Berührung
      const minDistance = a1.radius + a2.radius

      if (distance < minDistance && distance > 0.01) {
        // Kollision detektiert
        const nx = dx / distance
        const ny = dy / distance
        const nz = dz / distance
        const overlap = minDistance - distance

        // Stärkere Separation für deutliche Abstoßung (wie Spheren)
        const separationForce = overlap / 1.5  // War /2.0, jetzt stärker

        a1.x -= nx * separationForce
        a1.y -= ny * separationForce
        a1.z -= nz * separationForce
        a2.x += nx * separationForce
        a2.y += ny * separationForce
        a2.z += nz * separationForce

        // Sanfte elastische Kollision für Weltraum-Effekt
        const dvx = a2.vx - a1.vx
        const dvy = a2.vy - a1.vy
        const dvz = a2.vz - a1.vz
        const dotProduct = dvx * nx + dvy * ny + dvz * nz

        if (dotProduct < 0) {
          const impulse = -dotProduct * 1.2  // Etwas mehr Abstoßung (war 0.5)

          a1.vx -= impulse * nx
          a1.vy -= impulse * ny
          a1.vz -= impulse * nz
          a2.vx += impulse * nx
          a2.vy += impulse * ny
          a2.vz += impulse * nz
        }
      }
    }
  }

  renderer.render(scene, camera)
}

const onWindowResize = () => {
  if (!camera || !renderer) return
  // Recompute pixel-based world viewport and update orthographic camera frustum
  viewportWidthWorld = window.innerWidth
  viewportHeightWorld = window.innerHeight

  const left = -viewportWidthWorld / 2
  const right = viewportWidthWorld / 2
  const top = viewportHeightWorld / 2
  const bottom = -viewportHeightWorld / 2

  // @ts-ignore - update orthographic camera frustum
  camera.left = left
  // @ts-ignore
  camera.right = right
  // @ts-ignore
  camera.top = top
  // @ts-ignore
  camera.bottom = bottom
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight, true)
  renderer.domElement.style.width = `${window.innerWidth}px`
  renderer.domElement.style.height = `${window.innerHeight}px`
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
    errorMessage.value = 'Passwörter stimmen nicht überein'
    return
  }

  console.log('Register:', email.value, password.value)
  isLoggedIn.value = true
  currentUser.value = email.value
  showHomePage.value = true
  closeAuthModal()
}

// Cube Flip Animation Start - jetzt Fade Animation
const startCubeAnimation = () => {
  isScaling.value = true

  const showNextSlogan = () => {
    // Fade out
    isFading.value = true

    setTimeout(() => {
      // Wechsle Text
      currentSlogan.value = slogans[currentSloganIndex.value]
      currentSloganIndex.value = (currentSloganIndex.value + 1) % slogans.length

      // Fade in
      isFading.value = false

      // Nächsten Slogan nach 3 Sekunden anzeigen
      setTimeout(showNextSlogan, 3000)
    }, 500) // Fade-Dauer
  }

  showNextSlogan()
}

const stopCubeAnimation = () => {
  isScaling.value = false
}

onMounted(() => {
  loadProducts()
  init3DScene()
  window.addEventListener('resize', onWindowResize)

  // Starte die Cube-Animation nach dem Laden der Seite
  startCubeAnimation()

  // Starte die Haupt-Animationsschleife
  animate3D()
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('resize', onWindowResize)
  if (renderer) {
    renderer.dispose()
  }
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
        <!-- 3D Canvas wird hier von Three.js eingefügt -->

        <!-- Glass Container -->
        <div class="glass-container">
          <h1>Willkommen bei PanTrix</h1>
          <div class="cube-container">
            <p class="typing-text" :class="{ fading: isFading }">{{ currentSlogan }}</p>
          </div>
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

/* Three.js Canvas - Fixed auf dem Viewport, scrollt nicht mit der Seite */
:deep(canvas) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 5 !important;
  width: 100% !important;
  height: 100vh !important;
  pointer-events: none !important;
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
  background: rgba(255, 255, 255, 0.1);
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
  position: relative;
  z-index: 10;
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
  z-index: 15;
}

.hero-section {
  background: transparent;
  padding-top: 200px; /* Erhöht von 100px auf 150px für bessere Zentrierung */
  padding-bottom: 4rem;
  z-index: 15;
}

.features-section {
  background: transparent;
  padding: 6rem 2rem;
}

.how-it-works-section {
  background: transparent;
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

/* Typing Text - smaller than h1 */
.typing-text {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  font-weight: 500;
  letter-spacing: 1.5px;
  margin: 0 0 1rem 0;
  padding: 0;
  line-height: 1.4;
  transition: opacity 0.4s ease;
}

.typing-text.fading {
  opacity: 0;
}

/* Cube Container for 3D Flip Animation */
.cube-container {
  perspective: 1200px;
  display: inline-block;
  width: 100%;
  height: auto;
  position: relative;
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

.feature-card::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 25px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s ease;
  filter: blur(6px);
}

.feature-card:hover {
  transform: translateY(-15px);
  backdrop-filter: blur(35px);
  -webkit-backdrop-filter: blur(35px);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.25),
    0 0 35px rgba(255, 255, 255, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.25);
}

.feature-card:hover::after {
  opacity: 1;
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

.step::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s ease;
  filter: blur(6px);
}

.step:hover {
  transform: translateY(-10px);
  backdrop-filter: blur(35px);
  -webkit-backdrop-filter: blur(35px);
  box-shadow:
    0 18px 50px rgba(0, 0, 0, 0.2),
    0 0 30px rgba(255, 255, 255, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.25);
}

.step:hover::after {
  opacity: 1;
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

/* Glass Container */
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
  max-width: 1200px; /* Erhöht von 900px auf 1200px für breitere Darstellung */
  position: relative;
  z-index: 12;
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
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.5s ease;
  filter: blur(8px);
}

/* .glass-container:hover {
  transform: translateY(-10px);
  backdrop-filter: blur(35px);
  -webkit-backdrop-filter: blur(35px);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.2),
    0 0 40px rgba(255, 255, 255, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.25);
}

.glass-container:hover::before {
  opacity: 1;
} */

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

/* Auth Modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.auth-modal-flip-container {
  position: relative;
  width: 400px;
  height: 500px;
}

.auth-modal-flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.auth-modal-flipper.flipped {
  transform: rotateY(180deg);
}

.auth-modal-front,
.auth-modal-back {
  position: absolute;
  width: 100%;
  height: 100%;
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.auth-form {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
}

.auth-form h2 {
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
}

.auth-subtitle {
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.input-field {
  width: 100%;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.input-field:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.error-message {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  padding: 0.8rem;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  text-align: center;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.btn-submit:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.auth-toggle {
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.toggle-link {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-weight: 700;
  text-decoration: underline;
  transition: all 0.3s ease;
}

.toggle-link:hover {
  color: #ffffff;
}

.btn-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: rotate(90deg);
}

@media (max-width: 768px) {
  .auth-modal-flip-container {
    width: 100%;
    max-width: 350px;
  }

  .landing-page h1 {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .section {
    padding: 2rem 1rem;
  }
}
</style>
