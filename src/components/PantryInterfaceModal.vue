<template>
  <div class="pantry-interface-modal">
    <!-- Main Container with Toolbar and Products -->
    <div class="pantry-main-container">

      <!-- Toolbar Section -->
      <div class="pantry-toolbar">
        <!-- Search Bar (Left) -->
        <div class="search-wrapper">
          <div class="search-input-container">
            <input
              type="text"
              class="search-input"
              placeholder="Produkt suchen…"
              v-model="searchQuery"
              @focus="searchFocused = true"
              @blur="searchFocused = false"
            />
            <span class="search-icon">🔍</span>
            <div v-if="searchFocused" class="border-light"></div>
          </div>
        </div>

        <!-- Category Tabs (Middle) -->
        <div class="category-tabs">
                <button
                  v-for="category in categories"
                  :key="category"
                  :class="['category-btn', { active: activeCategory === category }]"
                  :style="{
                    background: activeCategory === category && category !== 'Alle' ? getCategoryColor(category) : 'rgba(255, 255, 255, 0.04)',
                    borderColor: activeCategory === category && category !== 'Alle' ? getCategoryColor(category) : 'rgba(255, 255, 255, 0.08)',
                  }"
                  @click="activeCategory = category"
                >
                  {{ category }}
                </button>
        </div>

        <!-- Add Button & Dropdown (Right) -->
        <div class="toolbar-actions">
          <button class="add-product-btn" @click="openAddProductModal">
            <span class="btn-icon">+</span>
            <span class="btn-text">Hinzufügen</span>
          </button>
          <div class="dropdown-wrapper">
            <button class="dropdown-btn" @click="toggleSortDropdown">
              {{ selectedSort }}
              <span class="dropdown-arrow" :class="{ open: showSortDropdown }">▼</span>
            </button>
            <div v-if="showSortDropdown" class="dropdown-menu">
              <button
                v-for="sort in sortOptions"
                :key="sort"
                @click="selectSort(sort)"
                :class="{ selected: selectedSort === sort }"
              >
                {{ sort }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Grid Container -->
      <div class="products-grid">
        <!-- Empty State -->
        <div v-if="filteredProducts.length === 0" class="empty-state">
          <h3>Noch keine Produkte hinzugefügt</h3>
          <p>Nutze die <strong>Hinzufügen</strong> Taste in der Toolbar um Produkte zu hinzufügen.</p>
        </div>

        <!-- Active Products Section -->
        <div v-if="activeProducts.length > 0" class="products-section">
          <div class="section-title">Aktive Produkte</div>
          <div class="products-list">
            <div
              v-for="product in activeProducts"
              :key="product.id"
              class="product-card product-item"
              :style="{
                backgroundImage: product.imageBase64 ? `url(${product.imageBase64})` : 'none',
                backgroundColor: product.imageBase64 ? 'transparent' : getCategoryColor(product.category)
              }"
            >
              <div v-if="product.imageBase64" class="image-overlay"></div>
              <button v-if="product.id" class="delete-btn" @click="deleteProduct(product.id)" title="Löschen">×</button>
              <div class="card-content">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-expiry">{{ formatDate(product.expiryDate) }}</div>
              </div>
              <button
                v-if="product.id && product.status !== 'saved'"
                class="consume-btn"
                :style="{ backgroundColor: getCategoryColor(product.category) }"
                @click="rescueProduct(product.id)"
                title="Produkt als verbraucht markieren">
                Aufgegessen
              </button>
              <div v-else-if="product.status === 'saved'" class="consume-badge" :style="{ backgroundColor: getCategoryColor(product.category) }">
                ✓ Aufgegessen
              </div>
            </div>
          </div>
        </div>

        <!-- Expired Products Section -->
        <div v-if="expiredProducts.length > 0" class="products-section expired-section">
          <div class="section-title expired-title">⚠️ Abgelaufene Produkte</div>
          <div class="products-list">
            <div
              v-for="product in expiredProducts"
              :key="product.id"
              class="product-card product-item expired-product"
              :class="{ 'pulse-animation': true }"
              :style="{
                backgroundImage: product.imageBase64 ? `url(${product.imageBase64})` : 'none',
                backgroundColor: product.imageBase64 ? 'transparent' : '#333333'
              }"
            >
              <div v-if="product.imageBase64" class="image-overlay expired-overlay"></div>
              <button v-if="product.id" class="delete-btn" @click="deleteProduct(product.id)" title="Löschen">×</button>
              <div class="card-content">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-expiry expired-date">{{ formatDate(product.expiryDate) }}</div>
              </div>
              <button
                v-if="product.id && product.status !== 'saved'"
                class="consume-btn expired-consume"
                :style="{ backgroundColor: getCategoryColor(product.category) }"
                @click="rescueProduct(product.id)"
                title="Produkt als verbraucht markieren">
                Aufgegessen
              </button>
              <div v-else-if="product.status === 'saved'" class="consume-badge" :style="{ backgroundColor: getCategoryColor(product.category) }">
                ✓ Aufgegessen
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddProductModal">
      <div class="modal-content modal-with-calendar">
        <!-- Calendar Section (Left) -->
        <div class="modal-calendar-section">
          <div class="calendar-wrapper">
            <div class="calendar-header">
              <button @click="previousMonth" class="calendar-nav">‹</button>
              <h3>{{ monthYearDisplay }}</h3>
              <button @click="nextMonth" class="calendar-nav">›</button>
            </div>
            <div class="calendar-grid">
              <div class="calendar-weekdays">
                <div v-for="day in ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']" :key="day" class="weekday">
                  {{ day }}
                </div>
              </div>
              <div class="calendar-dates">
                <button
                  v-for="date in calendarDates"
                  :key="date.dateString"
                  :class="['calendar-date', {
                    'other-month': !date.currentMonth,
                    'selected': newProduct.expiryDate === date.dateString,
                    'today': date.isToday
                  }]"
                  @click="selectDate(date.dateString!)"
                >
                  {{ date.day }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Section (Right) -->
        <div class="modal-form-section">
          <div class="modal-header">
            <h2>Neues Produkt hinzufügen</h2>
            <button class="close-btn" @click="closeAddProductModal">✕</button>
          </div>
          <form @submit.prevent="addProduct" class="product-form">
            <div class="form-group">
              <label>Produktname *</label>
              <input v-model="newProduct.name" type="text" required placeholder="z.B. Tomaten" />
            </div>
            <div class="form-group">
              <label>Kategorie *</label>
              <div class="category-selector">
                <button
                  v-for="cat in categories.filter(c => c !== 'Alle')"
                  :key="cat"
                  type="button"
                  :class="['category-select-btn', { selected: newProduct.category === cat }]"
                  :style="{ '--dot-color': getCategoryColor(cat) }"
                  @click="newProduct.category = cat"
                >
                  <span class="select-dot" :style="{ backgroundColor: getCategoryColor(cat) }"></span>
                  {{ cat }}
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Ablaufdatum *</label>
              <div class="selected-date-display">
                {{ newProduct.expiryDate ? formatDate(newProduct.expiryDate) : 'Nicht gewählt' }}
              </div>
            </div>
            <div class="form-group">
              <label>Menge</label>
              <input v-model="newProduct.quantity" type="number" min="1" placeholder="1" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeAddProductModal">Abbrechen</button>
              <button type="submit" class="btn-submit">Hinzufügen</button>
            </div>
          </form>
        </div>

        <!-- Image Preview Section (Right) -->
        <div class="modal-image-section">
          <div class="image-preview-container">
            <h3>Produktbild</h3>
            <div class="image-upload-buttons">
              <button type="button" class="camera-btn" @click="openCameraInline" title="Foto mit Kamera machen">
                📷 Foto machen
              </button>
              <button type="button" class="file-btn" @click="openFileInput" title="Bild aus Dateien wählen">
                🖼️ Datei wählen
              </button>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
            </div>
            <!-- Camera View Inline -->
            <div v-if="showCameraView" class="camera-view-inline">
              <video
                v-if="!capturedImage"
                ref="videoElement"
                class="camera-video-inline"
                autoplay
                playsinline
              ></video>
              <img v-else :src="capturedImage" alt="Aufgenommenes Foto" class="captured-image-inline" />
              <div class="camera-controls-inline">
                <button v-if="!capturedImage" type="button" class="capture-btn-inline" @click="capturePhoto">
                  📸 Foto
                </button>
                <div v-else class="captured-actions-inline">
                  <button type="button" class="retry-btn-inline" @click="retryPhoto">
                    🔄 Erneut
                  </button>
                  <button type="button" class="confirm-btn-inline" @click="confirmPhotoFromInline">
                    ✓ OK
                  </button>
                </div>
              </div>
              <button type="button" class="close-camera-btn-inline" @click="closeCameraView">
                ✕
              </button>
            </div>
            <!-- Normal Preview -->
            <template v-else>
              <div v-if="newProduct.imageBase64" class="image-preview-large">
                <img :src="newProduct.imageBase64" alt="Produktbild" />
                <button type="button" class="remove-image-btn-large" @click="removeImage" title="Bild entfernen">
                  🗑️ Löschen
                </button>
              </div>
              <div v-else class="image-preview-empty">
                <div class="empty-icon">📷</div>
                <p>Klicken Sie auf "Foto machen" oder "Datei wählen" um ein Bild hinzuzufügen</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Camera Modal -->
    <div v-if="showCameraModal" class="camera-modal-overlay" @click.self="closeCameraModal">
      <div class="camera-modal-content">
        <div class="camera-header">
          <h3>Produktfoto machen</h3>
          <button class="close-camera-btn" @click="closeCameraModal">✕</button>
        </div>
        <div class="camera-body">
          <video
            v-if="!capturedImage"
            ref="videoElement"
            class="camera-video"
            autoplay
            playsinline
          ></video>
          <img v-else :src="capturedImage" alt="Aufgenommenes Foto" class="captured-image" />
        </div>
        <div class="camera-actions">
          <button v-if="!capturedImage" type="button" class="capture-btn" @click="capturePhoto">
            📸 Foto machen
          </button>
          <div v-else class="captured-actions">
            <button type="button" class="retry-btn" @click="retryPhoto">
              🔄 Wiederholen
            </button>
            <button type="button" class="confirm-btn" @click="confirmPhoto">
              ✓ Bestätigen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useProducts } from '../composables/useProducts'
import type { Product } from '../types'

// Props vom Parent (HomeView)
const props = defineProps<{
  products: Product[]
}>()

// Nutze das useProducts Composable
const {
  addProduct: addProductToBackend,
  updateProduct: updateProductInBackend,
  deleteProduct: deleteProductFromBackend,
  errorMessage
} = useProducts()

const emit = defineEmits<{
  'update:products': [products: Product[]]
}>()

const searchQuery = ref('')
const searchFocused = ref(false)
const activeCategory = ref('Alle')
const selectedSort = ref('Neu hinzugefügt')
const showSortDropdown = ref(false)
const showAddModal = ref(false)
const currentMonth = ref(new Date())

// Kamera- und Bild-Upload State
const showCameraModal = ref(false)
const showCameraView = ref(false)
const videoElement = ref<HTMLVideoElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const capturedImage = ref<string>('')
const stream = ref<MediaStream | null>(null)

const categories = ref(['Alle', 'Obst', 'Gemüse', 'Fleisch', 'Milchprodukte', 'Sonstiges'])
const sortOptions = ref(['Neu hinzugefügt', 'Ablaufdatum', 'Kategorie', 'Name'])

// Nutze products vom Props statt lokal
const products = computed(() => {
  // Lade Bilder aus localStorage und füge sie zu den Produkten hinzu
  return props.products.map(product => {
    const storedImage = getImageFromStorage(product.id)
    return {
      ...product,
      imageBase64: storedImage || product.imageBase64
    }
  })
})


const rescuedProducts = ref<Product[]>([])

const newProduct = ref<Partial<Product>>({
  name: '',
  category: '',
  expiryDate: '',
  quantity: 1,
})

const monthYearDisplay = computed(() => {
  const month = currentMonth.value.toLocaleDateString('de-DE', { month: 'long' })
  const year = currentMonth.value.getFullYear()
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`
})

const calendarDates = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7 // Mo = 0, Su = 6

  const dates = []

  // Nutze lokales Datum für today ohne Zeitzone-Konvertierung
  const today = new Date()
  const todayString = today.getFullYear() + '-' +
                      String(today.getMonth() + 1).padStart(2, '0') + '-' +
                      String(today.getDate()).padStart(2, '0')

  // Previous month's days
  const prevMonth = new Date(year, month, 0)
  const daysInPrevMonth = prevMonth.getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(year, month - 1, day)
    const dateString = date.getFullYear() + '-' +
                      String(date.getMonth() + 1).padStart(2, '0') + '-' +
                      String(date.getDate()).padStart(2, '0')
    dates.push({
      day,
      dateString: dateString,
      currentMonth: false,
      isToday: dateString === todayString
    })
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateString = date.getFullYear() + '-' +
                      String(date.getMonth() + 1).padStart(2, '0') + '-' +
                      String(date.getDate()).padStart(2, '0')
    dates.push({
      day,
      dateString: dateString,
      currentMonth: true,
      isToday: dateString === todayString
    })
  }

  // Next month's days
  const remainingDays = 42 - dates.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    const dateString = date.getFullYear() + '-' +
                      String(date.getMonth() + 1).padStart(2, '0') + '-' +
                      String(date.getDate()).padStart(2, '0')
    dates.push({
      day,
      dateString: dateString,
      currentMonth: false,
      isToday: dateString === todayString
    })
  }

  return dates
})

const previousMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1)
}

const nextMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1)
}

const selectDate = (dateString: string) => {
  newProduct.value.expiryDate = dateString
}

const isProductExpired = (expiryDate: string): boolean => {
  const today = new Date()
  const todayString = today.getFullYear() + '-' +
                      String(today.getMonth() + 1).padStart(2, '0') + '-' +
                      String(today.getDate()).padStart(2, '0')
  return expiryDate < todayString
}

const filteredProducts = computed(() => {
  let filtered = products.value

  // Filter by category
  if (activeCategory.value !== 'Alle') {
    filtered = filtered.filter(p => p.category === activeCategory.value)
  }

  // Filter by search
  if (searchQuery.value) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Sort
  if (selectedSort.value === 'Ablaufdatum') {
    filtered = [...filtered].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
  } else if (selectedSort.value === 'Name') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
  } else if (selectedSort.value === 'Kategorie') {
    filtered = [...filtered].sort((a, b) => a.category.localeCompare(b.category))
  }

  return filtered
})

const activeProducts = computed(() => {
  return filteredProducts.value.filter(p => !isProductExpired(p.expiryDate) && p.status !== 'saved')
})

const expiredProducts = computed(() => {
  return filteredProducts.value.filter(p => isProductExpired(p.expiryDate))
})

const toggleSortDropdown = () => {
  showSortDropdown.value = !showSortDropdown.value
}

const selectSort = (sort: string) => {
  selectedSort.value = sort
  showSortDropdown.value = false
}

const openAddProductModal = () => {
  showAddModal.value = true
  newProduct.value = { name: '', category: '', expiryDate: '', quantity: 1 }
  // Disable body scroll wenn Modal offen ist
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
}

const closeAddProductModal = () => {
  showAddModal.value = false
  newProduct.value = { name: '', category: '', expiryDate: '', quantity: 1 }
  // Enable body scroll wenn Modal geschlossen ist
  document.body.style.overflow = 'auto'
  document.documentElement.style.overflow = 'auto'
}

const addProduct = async () => {
  if (newProduct.value.name && newProduct.value.category && newProduct.value.expiryDate) {
    // Heutiges Datum im Format YYYY-MM-DD (lokale Zeit)
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayString = `${year}-${month}-${day}`

    // Speichere das Bild vorübergehend
    const imageToSave = newProduct.value.imageBase64 || ''

    const product: Product = {
      name: newProduct.value.name,
      category: newProduct.value.category,
      expiryDate: newProduct.value.expiryDate,
      quantity: newProduct.value.quantity || 1,
      addedDate: todayString,
      unit: 'Stück',
      status: 'fresh'
    }

    try {
      // Sende Produkt zum Backend (OHNE Bild, da Backend es möglicherweise nicht speichert)
      const createdProduct = await addProductToBackend(product)

      // Speichere das Bild lokal im localStorage wenn vorhanden
      if (imageToSave && createdProduct.id) {
        saveImageToStorage(createdProduct.id, imageToSave)
        // Füge das Bild auch zum returnde Produkt hinzu
        createdProduct.imageBase64 = imageToSave
      }

      // Aktualisiere Liste mit neuem Produkt vom Backend
      const updatedProducts = [createdProduct, ...props.products]
      emit('update:products', updatedProducts)
      closeAddProductModal()
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Produkts:', error)
      alert(errorMessage.value || 'Fehler beim Hinzufügen des Produkts')
    }
  }
}

// Kamera-Funktionen
const openCameraModal = () => {
  showCameraModal.value = true
  capturedImage.value = ''
  // Disable body scroll wenn Modal offen ist
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  nextTick(() => {
    startCamera()
  })
}

const closeCameraModal = () => {
  stopCamera()
  showCameraModal.value = false
  capturedImage.value = ''
  // Enable body scroll wenn Modal geschlossen ist
  document.body.style.overflow = 'auto'
  document.documentElement.style.overflow = 'auto'
}

// Inline Kamera-Funktionen (in der Image-Section)
const openCameraInline = () => {
  showCameraView.value = true
  capturedImage.value = ''
  nextTick(() => {
    startCamera()
  })
}

const closeCameraView = () => {
  stopCamera()
  showCameraView.value = false
  capturedImage.value = ''
}

const confirmPhotoFromInline = () => {
  newProduct.value.imageBase64 = capturedImage.value
  closeCameraView()
}

const startCamera = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    })

    if (videoElement.value) {
      videoElement.value.srcObject = stream.value
    }
  } catch (error) {
    console.error('Fehler beim Zugriff auf die Kamera:', error)
    alert('Kamerafreigabe wurde abgelehnt oder Kamera nicht verfügbar')
  }
}

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
}

const capturePhoto = () => {
  if (videoElement.value) {
    const canvas = document.createElement('canvas')
    canvas.width = videoElement.value.videoWidth
    canvas.height = videoElement.value.videoHeight

    const context = canvas.getContext('2d')
    if (context) {
      context.drawImage(videoElement.value, 0, 0)
      capturedImage.value = canvas.toDataURL('image/jpeg', 0.9)
    }
  }
}

const retryPhoto = () => {
  capturedImage.value = ''
}

const confirmPhoto = () => {
  newProduct.value.imageBase64 = capturedImage.value
  closeCameraModal()
}

// LocalStorage-Funktionen für Bild-Speicherung
const saveImageToStorage = (productId: number | undefined, imageBase64: string) => {
  if (productId && imageBase64) {
    const imageStorage = JSON.parse(localStorage.getItem('productImages') || '{}')
    imageStorage[productId] = imageBase64
    localStorage.setItem('productImages', JSON.stringify(imageStorage))
  }
}

const getImageFromStorage = (productId: number | undefined): string | undefined => {
  if (!productId) return undefined
  const imageStorage = JSON.parse(localStorage.getItem('productImages') || '{}')
  return imageStorage[productId]
}

const deleteImageFromStorage = (productId: number | undefined) => {
  if (productId) {
    const imageStorage = JSON.parse(localStorage.getItem('productImages') || '{}')
    delete imageStorage[productId]
    localStorage.setItem('productImages', JSON.stringify(imageStorage))
  }
}

// Datei-Upload-Funktionen
const openFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newProduct.value.imageBase64 = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  newProduct.value.imageBase64 = ''
}

const deleteProduct = async (id: number) => {
  try {
    // Wenn das Produkt eine ID vom Backend hat, lösche es dort
    if (id) {
      await deleteProductFromBackend(id)
    }

    // Lösche auch das Bild aus localStorage
    deleteImageFromStorage(id)

    // Entferne aus Liste
    const updatedProducts = props.products.filter(p => p.id !== id)
    emit('update:products', updatedProducts)
  } catch (error) {
    console.error('Fehler beim Löschen des Produkts:', error)
    alert('Fehler beim Löschen des Produkts')
  }
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-')
  return `${day}.${month}.${year}`
}

const categoryColors: Record<string, string> = {
  'Gemüse': '#06D6A0',      // Grün - modern
  'Obst': '#9D4EDD',         // Lila - elegant
  'Fleisch': '#FF6B6B',      // Rot - energetisch
  'Milchprodukte': '#FFD93D', // Gelb/Gold - warm
  'Sonstiges': '#4ECDC4'     // Cyan/Türkis - frisch
}

const getCategoryColor = (category: string): string => {
  return categoryColors[category] || 'rgba(255, 255, 255, 0.5)'
}

const getDaysUntilExpiry = (expiryDate: string): number => {
  const today = new Date()
  const todayString = today.getFullYear() + '-' +
                      String(today.getMonth() + 1).padStart(2, '0') + '-' +
                      String(today.getDate()).padStart(2, '0')
  const timeDiff = new Date(expiryDate).getTime() - new Date(todayString).getTime()
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
}

const canBeRescued = (expiryDate: string): boolean => {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate)
  return daysUntilExpiry >= 0 && daysUntilExpiry <= 3
}

const rescueProduct = async (id: number) => {
  const productIndex = props.products.findIndex(p => p.id === id)
  if (productIndex !== -1) {
    try {
      // Aktualisiere Status im Backend
      const updatedProduct = await updateProductInBackend(id, { status: 'saved' })

      // Speichere in der geretteten Liste
      rescuedProducts.value.push(updatedProduct)

      // Entferne aus aktiver Liste
      const updatedProducts = props.products.filter(p => p.id !== id)
      emit('update:products', updatedProducts)
    } catch (error) {
      console.error('Fehler beim Retten des Produkts:', error)
      alert('Fehler beim Retten des Produkts')
    }
  }
}
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.pantry-interface-modal {
  width: 100%;
  padding: 0;
  position: relative;
  z-index: 20;
}

/* Main Container - Cooles Design mit Toolbar und Produkten */
.pantry-main-container {
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 30px;
  padding: 3rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25),
              inset 0 1px 1px rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
}

/* Glass Glow Effect */
.pantry-main-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  border-radius: 30px 30px 0 0;
}


/* Category Tabs */
.category-tabs {
  flex: 1;
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  flex-wrap: wrap;
  min-width: 0;
}

.category-btn {
  padding: 0.7rem 1.4rem;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.3px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.category-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: transparent;
  opacity: 0;
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
  border-radius: 12px;
  display: none;
}

.category-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.category-btn.active {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 800;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15),
              0 0 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.category-btn.active:hover {
  filter: brightness(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2),
              0 0 16px rgba(0, 0, 0, 0.2);
}

/* Special styling for "Alle" button */
.category-btn:first-child {
  position: relative;
}

.category-btn:first-child::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: conic-gradient(
    from 0deg,
    #06D6A0 0%,
    #9D4EDD 20%,
    #FF6B6B 40%,
    #FFD93D 60%,
    #4ECDC4 80%,
    #06D6A0 100%
  );
  opacity: 0;
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
  pointer-events: none;
  display: block;
}

.category-btn:first-child.active::before {
  opacity: 1;
}


/* Toolbar Section */
.pantry-toolbar {
  background: transparent;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: nowrap;
  justify-content: space-between;
  width: 100%;
}

/* Search Bar */
.search-wrapper {
  flex: 0 0 auto;
  min-width: 280px;
  max-width: 350px;
  position: relative;
}

.search-input-container {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.8rem 2rem 0.8rem 1.1rem;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.12);
}

.border-light {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  pointer-events: none;
  z-index: 0;
  background: conic-gradient(
    from 0deg,
    #06D6A0 0%,
    #9D4EDD 20%,
    #FF6B6B 40%,
    #FFD93D 60%,
    #4ECDC4 80%,
    #06D6A0 100%
  );
  padding: 1.5px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  animation: rotateBorder 5s linear infinite;
}

@keyframes rotateBorder {
  0% {
    filter: drop-shadow(0 0 6px rgba(6, 214, 160, 0.5)) drop-shadow(0 0 2px rgba(6, 214, 160, 0.3));
  }
  20% {
    filter: drop-shadow(0 0 8px rgba(6, 214, 160, 0.6)) drop-shadow(0 0 3px rgba(6, 214, 160, 0.4));
  }
  25% {
    filter: drop-shadow(0 0 8px rgba(157, 78, 221, 0.6)) drop-shadow(0 0 3px rgba(157, 78, 221, 0.4));
  }
  45% {
    filter: drop-shadow(0 0 8px rgba(255, 107, 107, 0.6)) drop-shadow(0 0 3px rgba(255, 107, 107, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 8px rgba(255, 217, 61, 0.6)) drop-shadow(0 0 3px rgba(255, 217, 61, 0.4));
  }
  75% {
    filter: drop-shadow(0 0 8px rgba(78, 205, 196, 0.6)) drop-shadow(0 0 3px rgba(78, 205, 196, 0.4));
  }
  100% {
    filter: drop-shadow(0 0 6px rgba(6, 214, 160, 0.5)) drop-shadow(0 0 2px rgba(6, 214, 160, 0.3));
  }
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  opacity: 0.45;
  font-size: 0.95rem;
  transition: opacity 0.3s ease;
}

.search-input:focus ~ .search-icon {
  opacity: 0.65;
}


/* Toolbar Actions */
.toolbar-actions {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-shrink: 0;
}

.add-product-btn {
  padding: 0.55rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  letter-spacing: 0.2px;
}

.add-product-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 0.9rem;
  font-weight: 900;
}

/* Dropdown */
.dropdown-wrapper {
  position: relative;
  flex-shrink: 0;
}

.dropdown-btn {
  padding: 0.55rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  letter-spacing: 0.2px;
}

.dropdown-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dropdown-arrow {
  font-size: 0.55rem;
  display: inline-block;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  margin-top: 0.6rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.06);
  z-index: 100;
  min-width: 160px;
  overflow: hidden;
}

.dropdown-menu button {
  width: 100%;
  padding: 0.8rem 1.2rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  letter-spacing: 0.2px;
}

.dropdown-menu button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.95);
}

.dropdown-menu button.selected {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.95);
  font-weight: 700;
}

.dropdown-menu button:last-child {
  border-bottom: none;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.8rem;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 1rem 0;
  letter-spacing: 0.3px;
}

.empty-state p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  max-width: 500px;
  line-height: 1.6;
}

.empty-state strong {
  color: rgba(255, 255, 255, 0.75);
  font-weight: 700;
}

/* Product Cards */
.product-card {
  aspect-ratio: 1 / 1;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2),
              inset 0 1px 1px rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  border-radius: 24px 24px 0 0;
}

.product-card::after {
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

.product-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-6px);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.25),
              inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 1.2rem 0.8rem 1.2rem 0.8rem;
  padding-bottom: 56px;
}

/* Consume Button - Bottom Full Width */
.consume-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 0 0 24px 24px;
  font-size: 0.85rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.2);
  z-index: 11;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.consume-btn:hover {
  height: 50px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.3);
  filter: brightness(1.1);
}

.consume-btn:active {
  height: 40px;
  filter: brightness(0.95);
}

.consume-btn.expired-consume {
  opacity: 0.8;
}

.consume-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 44px;
  border-radius: 0 0 24px 24px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.85rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 11;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  border: none;
  cursor: default;
}



/* Toolbar Actions */
.toolbar-actions {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}

.add-product-btn {
  padding: 0.7rem 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: rgba(200, 200, 200, 0.9);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  white-space: nowrap;
}

.add-product-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 1rem;
  font-weight: 900;
}

.btn-text {
  display: none;
}

@media (min-width: 900px) {
  .btn-text {
    display: inline;
  }
}

/* Dropdown Menu */
.dropdown-wrapper {
  position: relative;
}


/* Product Items */
.product-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-item .card-content {
  text-align: center;
  width: 100%;
  padding: 0.6rem;
}

.product-name {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 800;
  letter-spacing: 0.3px;
  line-height: 1.3;
  max-width: 100%;
  word-wrap: break-word;
  text-align: center;
}

.product-expiry {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 700;
  letter-spacing: 0.2px;
}

.days-left {
  font-size: 0.72rem;
  color: rgba(255, 200, 100, 0.95);
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-top: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: rgba(255, 200, 100, 0.15);
  border: 1px solid rgba(255, 200, 100, 0.3);
  border-radius: 8px;
  animation: pulse-warning 2s ease-in-out infinite;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

@keyframes pulse-warning {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Delete Button */
.delete-btn {
  position: absolute;
  top: 0.8rem;
  left: 0.8rem;
  width: 36px;
  height: 36px;
  background: rgba(255, 100, 100, 0.15);
  border: 1.5px solid rgba(255, 100, 100, 0.4);
  border-radius: 50%;
  color: rgba(255, 150, 150, 0.85);
  font-size: 1.6rem;
  font-weight: 300;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(255, 100, 100, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 12;
}

.delete-btn:hover {
  background: rgba(255, 100, 100, 0.25);
  border-color: rgba(255, 100, 100, 0.5);
  color: rgba(255, 100, 100, 0.95);
  box-shadow: 0 0 15px rgba(255, 100, 100, 0.2);
  transform: scale(1.1);
}

/* Products Sections */
.products-section {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.15);
}

.expired-title {
  color: rgba(255, 100, 100, 0.9);
  border-bottom-color: rgba(255, 100, 100, 0.3);
}

.products-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.8rem;
}

/* Expired Product Styling */
.expired-product {
  background: linear-gradient(135deg, rgba(255, 100, 100, 0.12), rgba(255, 150, 100, 0.08));
  border-color: rgba(255, 100, 100, 0.35);
  animation: pulse-expired 2.5s ease-in-out infinite;
}

.expired-product:hover {
  background: linear-gradient(135deg, rgba(255, 100, 100, 0.18), rgba(255, 150, 100, 0.12));
  border-color: rgba(255, 100, 100, 0.5);
  animation: none;
}

.expired-date {
  color: rgba(255, 100, 100, 0.95) !important;
  font-weight: 800;
}

/* Pulse Animation for Expired Products */
@keyframes pulse-expired {
  0% {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15),
                inset 0 1px 1px rgba(255, 255, 255, 0.2),
                0 0 0 0 rgba(255, 100, 100, 0.4);
  }
  50% {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15),
                inset 0 1px 1px rgba(255, 255, 255, 0.2),
                0 0 0 8px rgba(255, 100, 100, 0);
  }
  100% {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15),
                inset 0 1px 1px rgba(255, 255, 255, 0.2),
                0 0 0 0 rgba(255, 100, 100, 0);
  }
}


/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  overflow: auto;
  animation: fadeIn 0.3s ease;
  padding: 2rem;
  pointer-events: auto;
}

.modal-content {
  background: rgba(10, 10, 20, 0.08);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 32px;
  padding: 3.5rem;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15),
              inset 0 1px 2px rgba(255, 255, 255, 0.25);
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-content.modal-with-calendar {
  max-width: 85vw;
  width: 85vw;
  display: grid;
  grid-template-columns: 400px 1fr 450px;
  gap: 2.5rem;
  padding: 2.5rem;
  max-height: 85vh;
  background: rgba(10, 10, 20, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15),
              inset 0 1px 2px rgba(255, 255, 255, 0.25);
}

/* Calendar Section */
.modal-calendar-section {
  flex: 0 0 350px;
  display: flex;
  justify-content: center;
  align-items: stretch;
  min-height: 600px;
}

.calendar-wrapper {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.calendar-header h3 {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.3px;
}

.calendar-nav {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.calendar-nav:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  padding: 0.5rem;
}

.calendar-dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.8rem;
}

.calendar-date {
  aspect-ratio: 1 / 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  min-height: 45px;
}

.calendar-date:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.95);
}

.calendar-date.other-month {
  color: rgba(255, 255, 255, 0.3);
  cursor: default;
}

.calendar-date.other-month:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.3);
}

.calendar-date.today {
  background: rgba(200, 50, 50, 0.25);
  border-color: rgba(200, 50, 50, 0.4);
  color: rgba(255, 255, 255, 0.95);
}

.calendar-date.selected {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.95);
  font-weight: 800;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
}

/* Form Section */
.modal-form-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.modal-form-section::-webkit-scrollbar {
  width: 6px;
}

.modal-form-section::-webkit-scrollbar-track {
  background: transparent;
}

.modal-form-section::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

.modal-form-section::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.selected-date-display {
  padding: 0.9rem 1.2rem;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  min-height: 44px;
  display: flex;
  align-items: center;
}


.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.modal-header h2 {
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 800;
  letter-spacing: 0.5px;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.6rem;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  transform: rotate(90deg);
}

/* Form */
.product-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.form-group label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 700;
  letter-spacing: 0.3px;
}

.form-group input,
.form-group select {
  padding: 0.9rem 1.2rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-family: inherit;
  -webkit-appearance: none;
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  background-size: 1.4em 1.4em;
  padding-right: 2.5rem;
  color-scheme: dark;
  accent-color: rgba(255, 255, 255, 0.3);
}

/* Category Selector */
.category-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.category-select-btn {
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  letter-spacing: 0.3px;
}

.select-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2);
}

.category-select-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-select-btn.selected {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.15);
  font-weight: 800;
}

.category-select-btn.selected .select-dot {
  width: 12px;
  height: 12px;
  box-shadow: 0 0 10px currentColor, inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.06);
}

.form-group select option {
  background: #000000;
  color: rgba(255, 255, 255, 0.9);
  padding: 0.8rem;
  border: none;
  margin: 0;
}

.form-group select option:checked {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.9rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  letter-spacing: 0.3px;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

.btn-submit {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.95);
}

.btn-submit:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.08);
}

/* Responsive Design */
@media (max-width: 1200px) {

  .pantry-main-container {
    padding: 2rem;
  }

  .products-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }

  .pantry-toolbar {
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
}

@media (max-width: 768px) {
  .pantry-interface-modal {
    padding: 1.5rem;
  }

  .pantry-main-container {
    padding: 1.5rem;
    border-radius: 20px;
  }

  .pantry-toolbar {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .search-wrapper {
    flex: 1;
    width: 100%;
  }

  .category-tabs {
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .dropdown-wrapper {
    width: 100%;
  }

  .dropdown-btn {
    width: 100%;
    justify-content: center;
  }

  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem;
  }

  .plus-icon {
    font-size: 2.5rem;
  }

  .card-text {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .pantry-main-container {
    padding: 1rem;
    border-radius: 15px;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .search-input {
    padding: 0.6rem 2rem 0.6rem 1rem;
    font-size: 0.85rem;
  }

  .category-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }

  .dropdown-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }

  .plus-icon {
    font-size: 2rem;
  }

  .card-text {
    font-size: 0.7rem;
  }
}

/* ========== IMAGE & CAMERA STYLES ========== */

/* Product Card mit Bild-Hintergrund */
.product-card {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  transition: all 0.3s ease;
}

.product-card.product-item {
  background-color: #ff6b6b;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6));
  border-radius: 20px;
  z-index: 1;
}

.image-overlay.expired-overlay {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7));
}

.product-card.product-item > * {
  position: relative;
  z-index: 2;
}

/* Image Upload Section im Modal */
.image-upload-section {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.camera-btn,
.file-btn {
  flex: 1;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.camera-btn:hover,
.file-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  transform: translateY(-1px);
}

.camera-btn {
  background: rgba(100, 200, 255, 0.1);
  border-color: rgba(100, 200, 255, 0.3);
  color: rgba(100, 200, 255, 0.9);
}

.camera-btn:hover {
  background: rgba(100, 200, 255, 0.2);
  border-color: rgba(100, 200, 255, 0.5);
  color: #64c8ff;
}

.file-btn {
  background: rgba(157, 78, 221, 0.1);
  border-color: rgba(157, 78, 221, 0.3);
  color: rgba(157, 78, 221, 0.9);
}

.file-btn:hover {
  background: rgba(157, 78, 221, 0.2);
  border-color: rgba(157, 78, 221, 0.5);
  color: #9d4edd;
}

/* Image Preview */
.image-preview {
  position: relative;
  margin-top: 1rem;
  border-radius: 16px;
  overflow: hidden;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
}

.image-preview img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(255, 50, 80, 0.9);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.remove-image-btn:hover {
  background: rgba(255, 30, 60, 1);
  transform: scale(1.1);
}

/* Camera Modal */
.camera-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1999;
}

.camera-modal-content {
  background: rgba(0, 0, 0, 0.9);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.camera-header {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.camera-header h3 {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: 0.5px;
}

.close-camera-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-camera-btn:hover {
  color: #ffffff;
}

.camera-body {
  min-height: 400px;
  background: #000000;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-video,
.captured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.camera-actions {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.capture-btn,
.retry-btn,
.confirm-btn {
  padding: 0.9rem 1.5rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.capture-btn {
  background: rgba(100, 200, 255, 0.2);
  color: #64c8ff;
  border: 1.5px solid rgba(100, 200, 255, 0.4);
  flex: 1;
}

.capture-btn:hover {
  background: rgba(100, 200, 255, 0.3);
  border-color: rgba(100, 200, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(100, 200, 255, 0.2);
}

.retry-btn {
  background: rgba(255, 150, 50, 0.2);
  color: #ff9632;
  border: 1.5px solid rgba(255, 150, 50, 0.4);
  flex: 1;
}

.retry-btn:hover {
  background: rgba(255, 150, 50, 0.3);
  border-color: rgba(255, 150, 50, 0.6);
  transform: translateY(-2px);
}

.confirm-btn {
  background: rgba(100, 255, 150, 0.2);
  color: #64ff96;
  border: 1.5px solid rgba(100, 255, 150, 0.4);
  flex: 1;
}

.confirm-btn:hover {
  background: rgba(100, 255, 150, 0.3);
  border-color: rgba(100, 255, 150, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(100, 255, 150, 0.2);
}

.captured-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
}

/* ========== MODAL IMAGE SECTION ========== */

.modal-image-section {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  height: 100%;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
}

.image-preview-container h3 {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.image-upload-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.image-upload-buttons .camera-btn,
.image-upload-buttons .file-btn {
  width: 100%;
  padding: 0.9rem 1rem;
}

.image-preview-large {
  flex: 1;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.image-preview-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn-large {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(255, 50, 80, 0.95);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s ease;
  z-index: 10;
}

.remove-image-btn-large:hover {
  background: rgba(255, 30, 60, 1);
  transform: scale(1.05);
}

.image-preview-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  padding: 2rem;
  text-align: center;
  min-height: 300px;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.7;
}

.image-preview-empty p {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.5;
}

/* ========== MODAL ANIMATIONS ========== */

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ========== INLINE CAMERA VIEW ========== */

.camera-view-inline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  height: 100%;
  min-height: 350px;
}

.camera-video-inline,
.captured-image-inline {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

.camera-controls-inline {
  display: flex;
  gap: 0.6rem;
  padding: 0.8rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  justify-content: center;
}

.capture-btn-inline,
.retry-btn-inline,
.confirm-btn-inline {
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  flex: 1;
}

.capture-btn-inline {
  background: rgba(100, 200, 255, 0.2);
  color: #64c8ff;
  border: 1px solid rgba(100, 200, 255, 0.4);
}

.capture-btn-inline:hover {
  background: rgba(100, 200, 255, 0.3);
  border-color: rgba(100, 200, 255, 0.6);
}

.retry-btn-inline {
  background: rgba(255, 150, 50, 0.2);
  color: #ff9632;
  border: 1px solid rgba(255, 150, 50, 0.4);
}

.retry-btn-inline:hover {
  background: rgba(255, 150, 50, 0.3);
  border-color: rgba(255, 150, 50, 0.6);
}

.confirm-btn-inline {
  background: rgba(100, 255, 150, 0.2);
  color: #64ff96;
  border: 1px solid rgba(100, 255, 150, 0.4);
}

.confirm-btn-inline:hover {
  background: rgba(100, 255, 150, 0.3);
  border-color: rgba(100, 255, 150, 0.6);
}

.captured-actions-inline {
  display: flex;
  gap: 0.6rem;
  width: 100%;
}

.close-camera-btn-inline {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.close-camera-btn-inline:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

</style>
