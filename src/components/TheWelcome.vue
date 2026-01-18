<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import HomeView from './HomeView.vue'
import * as THREE from 'three'
import { useAuth } from '../composables/useAuth'
import authService from '../services/authService'

// In Entwicklung: Nutze relative URLs für Proxy, in Produktion: absolute URLs
const baseUrl = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'https://pantrix.onrender.com')
const products = ref<object[]>([])

// ...existing code...

// Nutze Auth Composable
const {
  isLoggedIn,
  currentUser,
  isLoading,
  errorMessage,
  login,
  register,
  logout: logoutUser,
  setCurrentUser
} = useAuth()


// Zusätzliche UI-States
const showAuthModal = ref(false)
const isLoginMode = ref(true)
const showHomePage = ref(false)
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

// 3D Scene Setup
let scene: THREE.Scene
let camera: THREE.OrthographicCamera
let renderer: THREE.WebGLRenderer
let apples: THREE.Mesh[] = []
let animationFrameId: number | null = null
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
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, precision: 'mediump' })
  // begrenze pixel ratio für Performance/Stabilität
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  // setSize und update style zusammen
  renderer.setSize(window.innerWidth, window.innerHeight, true)
  // explizit CSS-Größen setzen, damit Canvas-Style und drawing buffer übereinstimmen
  renderer.domElement.style.width = `${window.innerWidth}px`
  renderer.domElement.style.height = `${window.innerHeight}px`
  renderer.shadowMap.enabled = false  // Deaktiviere Schatten für bessere Performance
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1  // Leicht erhöht für Premium-Look

  const canvas = container.querySelector('canvas')
  if (canvas) container.removeChild(canvas)
  container.insertBefore(renderer.domElement, container.firstChild)

  // Premium Studio-Beleuchtung optimiert für Performance
  const ambientLight = new THREE.AmbientLight(0xf0f0ff, 0.4)  // Kühler, subtiler Ambient
  scene.add(ambientLight)

  // Hauptlicht von oben (kühl-weiß für Premium-Look)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(200, 700, 400)
  directionalLight.castShadow = false  // Deaktiviert für Performance
  scene.add(directionalLight)

  // Akzentlicht von hinten (Cyan für modernen Look)
  const rimLight = new THREE.DirectionalLight(0x66ddff, 0.3)
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

  // Erstelle schwebende Emojis statt 3D-Objekte
  const emojiList = ['🍎', '🍌', '🥕', '🐟', '🥩', '🥬', '🍊', '🥦', '🧅', '🍅', '🫒', '🥔']
  const emojiContainer = document.createElement('div')
  emojiContainer.id = 'emoji-container'
  emojiContainer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 7;
    pointer-events: none;
  `
  container.appendChild(emojiContainer)
  console.log('Emoji Container created and added to container')

  // Sunset Fire Palette - Hellere Rot-Töne
  const staticPalette = { name: 'Sunset Fire', light: '#FF4040', dark: '#FF2E2E', shadow: 'rgba(255, 46, 46, 0.4)', darkShadow: 'rgba(255, 46, 46, 0.2)' }

  for (let i = 0; i < 3; i++) {
    const streak = document.createElement('div')
    const yPos = 25 + i * 30 // 25%, 55%, 85%

    streak.style.cssText = `
      position: fixed;
      top: ${yPos}%;
      left: 0;
      width: 100vw;
      height: 2px;
      pointer-events: none;
      z-index: 6;
      transform-origin: left center;
      transform: scaleX(0);
      will-change: transform, background, box-shadow;
      filter: blur(0.5px);
    `
    container.appendChild(streak)

    // Animation für diesen Lichtstreifen
    let startTime: number | null = null
    const delay = i * 1.2

    const animateStreak = (currentTime: number) => {
      if (!startTime) startTime = currentTime

      const elapsedTime = (currentTime - startTime)
      const progress = Math.min(elapsedTime / 3000, 1) // 3 Sekunden Animation

      streak.style.transform = `scaleX(${progress})`

      if (progress < 1) {
        requestAnimationFrame(animateStreak)
      }
    }

    // Starte Animation mit statischer Farbe
    setTimeout(() => {
      streak.style.background = `linear-gradient(to right, transparent, ${staticPalette.light}, ${staticPalette.dark}, ${staticPalette.light}, transparent)`
      streak.style.boxShadow = `0 0 20px ${staticPalette.light}, 0 0 50px ${staticPalette.dark}, 0 0 80px ${staticPalette.dark}, 0 0 120px ${staticPalette.dark}, 0 0 150px ${staticPalette.shadow}, 0 0 200px ${staticPalette.darkShadow}`

      requestAnimationFrame(animateStreak)
    }, delay * 1000)
  }

  // Erstelle 4 vertikale Lichtstreifen - STATISCHE FARBE
  for (let i = 0; i < 4; i++) {
    const verticalStreak = document.createElement('div')
    const xPos = 20 + i * 20 // 20%, 40%, 60%, 80%

    verticalStreak.style.cssText = `
      position: fixed;
      left: ${xPos}%;
      top: 0;
      width: 2px;
      height: 100vh;
      pointer-events: none;
      z-index: 6;
      transform-origin: top center;
      transform: scaleY(0);
      will-change: transform, background, box-shadow;
      filter: blur(0.5px);
    `
    container.appendChild(verticalStreak)

    // Animation für diesen Lichtstreifen
    let startTimeVertical: number | null = null
    const delayVertical = i

    const animateVerticalStreak = (currentTime: number) => {
      if (!startTimeVertical) startTimeVertical = currentTime

      const elapsedTime = (currentTime - startTimeVertical)
      const progress = Math.min(elapsedTime / 3000, 1) // 3 Sekunden Animation

      verticalStreak.style.transform = `scaleY(${progress})`

      if (progress < 1) {
        requestAnimationFrame(animateVerticalStreak)
      }
    }

    // Starte Animation mit statischer Farbe
    setTimeout(() => {
      verticalStreak.style.background = `linear-gradient(to bottom, transparent, ${staticPalette.light}, ${staticPalette.dark}, ${staticPalette.light}, transparent)`
      verticalStreak.style.boxShadow = `0 0 20px ${staticPalette.light}, 0 0 50px ${staticPalette.dark}, 0 0 80px ${staticPalette.dark}, 0 0 120px ${staticPalette.dark}, 0 0 150px ${staticPalette.shadow}, 0 0 200px ${staticPalette.darkShadow}`

      requestAnimationFrame(animateVerticalStreak)
    }, delayVertical * 1000)
  }

  // Erstelle 3 große radiale Gradients - FARBPALETTE (Orange, Rot, Magenta)
  const gradientConfigs = [
    {
      name: 'bottom-left',
      startX: 0.2,
      startY: 0.8,
      offsetX: 0.15,
      offsetY: 0.15,
      colors: ['rgba(255,96,60,0.8)', 'rgba(255, 110, 60, 0.6)', 'rgba(255, 110, 60, 0.2)', 'transparent'],
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
      colors: ['rgba(220,80,143,0.8)', 'rgba(220, 80, 160, 0.6)', 'rgba(220, 80, 160, 0.2)', 'transparent'],
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
      z-index: 5;
      filter: blur(80px);
      opacity: 0.8;
      margin-left: -${config.size / 2}px;
      margin-top: -${config.size / 2}px;
    `
    container.appendChild(glowField)
  })


  // Erstelle Emojis mit verschiedenen Positionen und realistischen Größen
  const emojis = emojiList.map((emoji) => {
    const emojiEl = document.createElement('div')
    const x = Math.random() * (window.innerWidth - 100) // Platz für größte Emoji
    const y = Math.random() * (window.innerHeight - 100) // Platz für größte Emoji
    const vx = (Math.random() - 0.5) * 1.5
    const vy = (Math.random() - 0.5) * 1.5

    // Realistische Größen basierend auf Produkt - GRÖSSER gemacht
    let size = 80 // Default erhöht

    if (emoji === '🍌') {
      size = 100 + Math.random() * 30
    } else if (emoji === '🥕') {
      size = 90 + Math.random() * 25
    } else if (emoji === '🥦') {
      size = 95 + Math.random() * 25
    } else if (emoji === '🥩') {
      size = 100 + Math.random() * 30
    } else if (emoji === '🍎') {
      size = 90 + Math.random() * 25
    } else if (emoji === '🍊') {
      size = 85 + Math.random() * 25
    } else if (emoji === '🥬') {
      size = 95 + Math.random() * 25
    } else if (emoji === '🐟') {
      size = 90 + Math.random() * 30
    } else if (emoji === '🧅') {
      size = 75 + Math.random() * 20
    } else if (emoji === '🍅') {
      size = 70 + Math.random() * 20
    } else if (emoji === '🥔') {
      size = 85 + Math.random() * 25
    } else if (emoji === '🫒') {
      size = 60 + Math.random() * 20
    }

    emojiEl.textContent = emoji
    emojiEl.style.cssText = `
      position: fixed;
      font-size: ${size}px;
      left: ${x}px;
      top: ${y}px;
      z-index: 7;
      pointer-events: none;
      user-select: none;
      background: transparent;
      border: none;
      padding: 0;
      margin: 0;
      width: auto;
      height: auto;
      line-height: 1;
      white-space: nowrap;
      color: rgba(255, 255, 255, 0.7);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      filter: grayscale(100%)
              saturate(0%)
              drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15))
              brightness(0.95)
              contrast(1.1);
      animation: float 3s ease-in-out infinite;
    `
    emojiContainer.appendChild(emojiEl)
    console.log(`Created glass emoji: ${emoji} at (${x}, ${y}) with size ${size}px`)

    return {
      element: emojiEl,
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      size: size,
      radius: size / 2,
      emoji: emoji,
      colored: false
    }
  });

  // Sequentielle Einfärbungs-Animation - LANGSAMER
  let coloringIndex = 0
  const coloringInterval = setInterval(() => {
    if (coloringIndex < emojis.length) {
      const emoji = emojis[coloringIndex]!
      // Animiere die Einfärbung über 2 Sekunden (langsamer)
      const startTime = performance.now()
      const animateColoring = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / 2000, 1) // 2 Sekunden Animation (vorher 1)

        // Interpoliere von grayscale zu farbig
        const saturation = progress * 100
        emoji.element.style.filter = `grayscale(${100 - saturation}%)
                saturate(${saturation}%)
                drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15))
                brightness(0.95)
                contrast(1.1)`

        if (progress < 1) {
          requestAnimationFrame(animateColoring)
        } else {
          emoji.colored = true
        }
      }
      requestAnimationFrame(animateColoring)
      coloringIndex++
    } else {
      clearInterval(coloringInterval)
    }
  }, 600) // Alle 600ms das nächste Emoji einfärben (vorher 300ms)

  // Anime Emojis
  const animateEmojis = () => {
    animationFrameId = requestAnimationFrame(animateEmojis)

    const width = window.innerWidth
    const height = window.innerHeight
    const damping = 0.95

    emojis.forEach((emoji, i) => {
      // Update position
      emoji.x += emoji.vx
      emoji.y += emoji.vy

      // Bounce off walls - emoji.x und emoji.y sind die linke obere Ecke
      // Grenzen: Emoji darf von 0 bis (width - size) gehen (horizontal)
      //          und von 0 bis (height - size) gehen (vertikal)

      if (emoji.x < 0) {
        emoji.vx *= -damping
        emoji.x = 0
      } else if (emoji.x + emoji.size > width) {
        emoji.vx *= -damping
        emoji.x = width - emoji.size
      }

      if (emoji.y < 0) {
        emoji.vy *= -damping
        emoji.y = 0
      } else if (emoji.y + emoji.size > height) {
        emoji.vy *= -damping
        emoji.y = height - emoji.size
      }

      // Collision detection with other emojis
      for (let j = i + 1; j < emojis.length; j++) {
        const other = emojis[j]!
        const dx = other.x - emoji.x
        const dy = other.y - emoji.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const minDist = emoji.radius + other.radius

        if (dist < minDist) {
          // Elastic collision
          const angle = Math.atan2(dy, dx)
          const sin = Math.sin(angle)
          const cos = Math.cos(angle)

          // Velocities in collision-frame
          const vx1 = emoji.vx * cos + emoji.vy * sin
          const vy1 = emoji.vy * cos - emoji.vx * sin
          const vx2 = other.vx * cos + other.vy * sin
          const vy2 = other.vy * cos - other.vx * sin

          // Swap velocities (equal mass)
          const vx1Final = vx2
          const vx2Final = vx1

          // Convert back to world frame
          emoji.vx = vx1Final * cos - vy1 * sin
          emoji.vy = vy1 * cos + vx1Final * sin
          other.vx = vx2Final * cos - vy2 * sin
          other.vy = vy2 * cos + vx2Final * sin

          // Separate overlapping objects
          const overlap = minDist - dist
          const moveX = (overlap / 2) * cos
          const moveY = (overlap / 2) * sin
          emoji.x -= moveX
          emoji.y -= moveY
          other.x += moveX
          other.y += moveY
        }
      }

      // Update element position
      emoji.element.style.left = `${emoji.x}px`
      emoji.element.style.top = `${emoji.y}px`
    })
  }

  animateEmojis()

  // Starte die Haupt-Animationsschleife
  animate3D()
}

const animate3D = () => {
  animationFrameId = requestAnimationFrame(animate3D)

  // Keine 3D-Objekt-Animation mehr - Emojis werden mit separater Funktion animiert

  // Rendern
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

  camera.left = left
  camera.right = right
  camera.top = top
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

const logout = async () => {
  await logoutUser()
  showHomePage.value = false
  email.value = ''
  password.value = ''
  passwordConfirm.value = ''

  // Stelle sicher, dass die Landing Page alle Animationen neu startet
  nextTick(() => {
    // Reset slogan animation
    currentSloganIndex.value = 0
    currentSlogan.value = ''

    // Stoppe alte Animation und starte neu
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }

    // Reinitialize 3D scene
    if (renderer) {
      renderer.dispose()
    }
    apples = []

    // Starte alles neu
    setTimeout(() => {
      init3DScene()
      startCubeAnimation()
      animate3D()
    }, 100)
  })
}

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Bitte füllen Sie alle Felder aus'
    return
  }

  if (!email.value.includes('@')) {
    errorMessage.value = 'Bitte geben Sie eine gültige E-Mail ein'
    return
  }

  const success = await login(email.value, password.value)
  if (success) {
    setCurrentUser(email.value)
    showHomePage.value = true
    closeAuthModal()
  }
}

const handleRegister = async () => {
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

  const success = await register(email.value, password.value)
  if (success) {
    setCurrentUser(email.value)
    showHomePage.value = true
    closeAuthModal()
  }
}

// Cube Flip Animation Start - jetzt Fade Animation
const startCubeAnimation = () => {
  isScaling.value = true

  const typeSlogan = (text: string, callback: () => void) => {
    let index = 0
    currentSlogan.value = ''

    const typeChar = () => {
      if (index < text.length) {
        currentSlogan.value += text[index]
        index++
        setTimeout(typeChar, 50) // 50ms pro Zeichen (normal typing speed)
      } else {
        // Text ist komplett getippt - warte 2 Sekunden und lösche dann
        setTimeout(() => {
          deleteSlogan(callback)
        }, 2000)
      }
    }

    typeChar()
  }

  const deleteSlogan = (callback: () => void) => {
    let index = currentSlogan.value.length

    const deleteChar = () => {
      if (index > 0) {
        currentSlogan.value = currentSlogan.value.slice(0, index - 1)
        index--
        setTimeout(deleteChar, 30) // 30ms pro Zeichen (schneller löschen)
      } else {
        callback()
      }
    }

    deleteChar()
  }

  const showNextSlogan = () => {
    const next = slogans[currentSloganIndex.value] || ''
    currentSloganIndex.value = (currentSloganIndex.value + 1) % slogans.length

    typeSlogan(next, () => {
      // Nach Löschen - nächsten Slogan nach 500ms anzeigen
      setTimeout(showNextSlogan, 500)
    })
  }

  showNextSlogan()
}


onMounted(() => {
  // Überprüfe ob Benutzer bereits angemeldet ist
  if (authService.isAuthenticated()) {
    console.log('Benutzer ist angemeldet - zeige HomePage')
    showHomePage.value = true
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      setCurrentUser(storedUser)
    }
  } else {
    // Benutzer ist nicht angemeldet - zeige Landing Page
    console.log('Benutzer ist nicht angemeldet - zeige Landing Page')
    showHomePage.value = false

    // Initialisiere 3D-Szene und Animationen für Landing Page
    loadProducts()
    init3DScene()
    window.addEventListener('resize', onWindowResize)
    startCubeAnimation()
    animate3D()
  }
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
              <li><a href="/">Home</a></li>
              <li><a href="/">Features</a></li>
              <li><a href="/">Über uns</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Rechtliches</h4>
            <ul>
              <li><a href="/">Datenschutz</a></li>
              <li><a href="/">Nutzungsbedingungen</a></li>
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
                <div class="auth-form-content">
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
                </div>

                <button @click="handleLogin" class="btn-submit" :disabled="isLoading">
                  <span v-if="!isLoading">Anmelden</span>
                  <span v-else>Wird angemeldet...</span>
                </button>

                <p class="auth-toggle">
                  Noch kein Konto?
                  <button @click="toggleMode" class="toggle-link">Registrieren</button>
                </p>
              </div>
            </div>

            <!-- Register Side -->
            <div class="auth-modal-back glass">
              <div class="auth-form">
                <div class="auth-form-content">
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
                </div>

                <button @click="handleRegister" class="btn-submit" :disabled="isLoading">
                  <span v-if="!isLoading">Registrieren</span>
                  <span v-else>Wird registriert...</span>
                </button>

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

:root {
  --ocean-primary: #00a8e8;
  --ocean-secondary: #00c9e8;
  --ocean-accent: #00e5ff;
  --ocean-dark: #001f3f;
  --ocean-light: #e0f4ff;
  --ocean-glow: #00b8e6;

  --current-primary: var(--ocean-primary);
  --current-secondary: var(--ocean-secondary);
  --current-accent: var(--ocean-accent);
  --current-dark: var(--ocean-dark);
  --current-light: var(--ocean-light);
  --current-glow: var(--ocean-glow);
}

.landing-page {
  background: linear-gradient(135deg, #FF4040 0%, #FF3030 25%, #E63946 50%, #FF3030 75%, #FF4040 100%);
  background-attachment: fixed;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow: hidden;
  color: white;
}

/* Three.js Canvas - Fixed auf dem Viewport, scrollt nicht mit der Seite */
:deep(canvas) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 3 !important;
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
  transition: all 0.3s ease;
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
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
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
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button:hover {
  color: #ffffff;
  transform: translateY(-2px);
}

/* Theme Switch */
/* Slider Circle */


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
  transition: all 0.3s ease;
}

/* Typing Text - smaller than h1 */
.typing-text {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  font-weight: 500;
  letter-spacing: 1.5px;
  margin: 0;
  padding: 0;
  line-height: 1.4;
  transition: opacity 0.4s ease;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.typing-text.fading {
  opacity: 0;
}

/* Cube Container for 3D Flip Animation */
.cube-container {
  perspective: 1200px;
  display: inline-block;
  width: 100%;
  height: 60px;
  position: relative;
  margin: 0;
  padding: 0;
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
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 25px;
  padding: 3rem 1.5rem;
  text-align: center;
  transition: all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
  z-index: 10;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 25px 25px 0 0;
  animation: smoothLightStreak 4s ease-in-out infinite;
}

.feature-card::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05), transparent);
  border-radius: 25px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s ease;
  filter: blur(6px);
}

.feature-card:hover {
  transform: translateY(-15px);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(35px);
  -webkit-backdrop-filter: blur(35px);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.25),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
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
  transition: color 0.3s ease;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1.6;
  transition: color 0.3s ease;
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
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
  z-index: 10;
}

.step::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  border-radius: 20px 20px 0 0;
}

.step::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05), transparent);
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
    0 0 30px rgba(255, 255, 255, 0.05),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
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
  background: rgba(255, 255, 255, 0.08);
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
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  transition: all 0.3s ease;
}

.upcoming-feature:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
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
  transition: color 0.3s ease;
}

.footer-section p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.3s ease;
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
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

/* Glass Container */
.glass-container {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 50px;
  padding: 4rem 5rem;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
  min-width: auto;
  max-width: 1200px;
  position: relative;
  z-index: 12;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}


.landing-page h1 {
  font-size: 5.5rem;
  color: #ffffff;
  text-align: center;
  font-weight: 900;
  letter-spacing: 3px;
  margin: 0 auto 1.5rem auto;
  padding: 0;
  text-shadow: none;
  animation: slideInDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  line-height: 1.2;
  transition: all 0.3s ease;
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

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

/* 🌟 Smooth Light Streak Animationen - PanTrix Grün */
@keyframes smoothLightStreak {
  0% {
    left: -100%;
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.9;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}


@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 15px rgba(0, 168, 232, 0.5),
                inset 0 1px 1px rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 35px rgba(0, 168, 232, 0.7),
                inset 0 1px 1px rgba(255, 255, 255, 0.3);
  }
}

@keyframes glowShimmer {
  0% {
    text-shadow: 0 0 10px rgba(0, 168, 232, 0.6),
                 0 0 20px rgba(0, 168, 232, 0.3);
  }
  50% {
    text-shadow: 0 0 20px rgba(0, 168, 232, 0.8),
                 0 0 40px rgba(0, 168, 232, 0.5);
  }
  100% {
    text-shadow: 0 0 10px rgba(0, 168, 232, 0.6),
                 0 0 20px rgba(0, 168, 232, 0.3);
  }
}


.btn-login {
  margin-top: 2.5rem;
  padding: 1.2rem 3.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  letter-spacing: 1px;
  margin-left: auto;
  margin-right: auto;
  display: block;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.08),
              inset 0 1px 1px rgba(255, 255, 255, 0.15);
}

.btn-login:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 25px rgba(255, 255, 255, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.btn-login:active {
  transform: scale(0.98);
}

/* Auth Modal */

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
  transition: background-color 0.3s ease;
}

.auth-modal-flip-container {
  position: relative;
  width: 480px;
  height: 680px;
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
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
}

.auth-form {
  padding: 3.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.auth-form-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 1rem;
}

.auth-form-content::-webkit-scrollbar {
  width: 4px;
}

.auth-form-content::-webkit-scrollbar-track {
  background: transparent;
}

.auth-form-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.auth-form-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.auth-form > :first-child {
  margin-top: 0;
}

.auth-form > :last-child {
  margin-bottom: 0;
}

.auth-form h2 {
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
}

.auth-subtitle {
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #ffffff;
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
  border-color: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.3);
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
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  margin-top: 1rem;
  position: relative;
  overflow: hidden;
}

.btn-submit::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(220, 53, 69, 0.3), transparent);
  transition: left 0.6s ease;
}

.btn-submit:hover {
  background: rgba(220, 53, 69, 0.15);
  border-color: rgba(220, 53, 69, 0.5);
  box-shadow: 0 0 20px rgba(220, 53, 69, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.btn-submit:hover::before {
  left: 100%;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.3);
}

.btn-submit:disabled:hover {
  background: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.3);
  box-shadow: 0 0 20px rgba(220, 53, 69, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.btn-submit:disabled::before {
  display: none;
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


  .features-grid {
    grid-template-columns: 1fr;
  }

  .section {
    padding: 2rem 1rem;
  }
}

</style>
