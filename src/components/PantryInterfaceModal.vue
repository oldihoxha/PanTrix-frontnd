<template>
  <div class="pantry-interface-modal">
    <!-- Main Container with Toolbar and Products -->
    <div class="pantry-main-container">
      <!-- Toolbar Section -->
      <div class="pantry-toolbar">
        <!-- Search Bar (Left) -->
        <div class="search-wrapper">
          <input
            type="text"
            class="search-input"
            placeholder="Produkt suchen…"
            v-model="searchQuery"
          />
          <span class="search-icon">🔍</span>
        </div>

        <!-- Category Tabs (Middle) -->
        <div class="category-tabs">
                <button
                  v-for="category in categories"
                  :key="category"
                  :class="['category-btn', { active: activeCategory === category }]"
                  :style="{
                    '--category-color': category !== 'Alle' ? getCategoryColor(category) : 'transparent'
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

        <!-- Actual Products -->
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card product-item"
        >
          <button class="delete-btn" @click="deleteProduct(product.id)" title="Löschen">×</button>
          <div class="card-content">
            <div class="product-name">{{ product.name }}</div>
            <div class="category-dot" :style="{ backgroundColor: getCategoryColor(product.category) }" :title="product.category"></div>
            <div class="product-expiry">{{ formatDate(product.expiryDate) }}</div>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Product {
  id: number
  name: string
  category: string
  expiryDate: string
  quantity: number
}

const searchQuery = ref('')
const activeCategory = ref('Alle')
const selectedSort = ref('Neu hinzugefügt')
const showSortDropdown = ref(false)
const showAddModal = ref(false)
const currentMonth = ref(new Date())

const categories = ref(['Alle', 'Obst', 'Gemüse', 'Fleisch', 'Milchprodukte', 'Sonstiges'])
const sortOptions = ref(['Neu hinzugefügt', 'Ablaufdatum', 'Kategorie', 'Name'])

const products = ref<Product[]>([])

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
}

const closeAddProductModal = () => {
  showAddModal.value = false
  newProduct.value = { name: '', category: '', expiryDate: '', quantity: 1 }
}

const addProduct = () => {
  if (newProduct.value.name && newProduct.value.category && newProduct.value.expiryDate) {
    const product: Product = {
      id: Math.max(...products.value.map(p => p.id), 0) + 1,
      name: newProduct.value.name,
      category: newProduct.value.category,
      expiryDate: newProduct.value.expiryDate,
      quantity: newProduct.value.quantity || 1,
    }
    products.value.unshift(product)
    closeAddProductModal()
  }
}

const selectProduct = (product: Product) => {
  console.log('Produkt ausgewählt:', product)
  // TODO: Öffne Produktdetails oder Bearbeitungsseite
}

const deleteProduct = (id: number) => {
  products.value = products.value.filter(p => p.id !== id)
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-')
  return `${day}.${month}.${year}`
}

const categoryColors: Record<string, string> = {
  'Obst': '#9D4EDD',      // Lila
  'Fleisch': '#FF006E',    // Pink
  'Milchprodukte': '#FFD60A', // Gelb
  'Gemüse': '#06D6A0',    // Grün
  'Sonstiges': '#00B4D8'  // Blau
}

const getCategoryColor = (category: string): string => {
  return categoryColors[category] || 'rgba(255, 255, 255, 0.5)'
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

.search-input {
  width: 100%;
  padding: 0.65rem 1.8rem 0.65rem 1rem;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.search-icon {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  opacity: 0.5;
  font-size: 0.8rem;
}

/* Category Tabs */
.category-tabs {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: nowrap;
  min-width: 0;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-btn {
  padding: 0.5rem 1.1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.2px;
  flex-shrink: 1;
  min-width: 90px;
  text-align: center;
  position: relative;
}

.category-btn::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 3px;
  border-radius: 2px;
  opacity: 0;
  background: currentColor;
}

.category-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.75);
}

.category-btn:hover::before {
  opacity: 0.6;
  bottom: 2px;
}

.category-btn.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
  font-weight: 800;
}

.category-btn.active::before {
  opacity: 1;
  bottom: 2px;
  height: 4px;
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

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
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
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  border-radius: 20px 20px 0 0;
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
  border-radius: 20px;
}

.product-card:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2),
              inset 0 1px 1px rgba(255, 255, 255, 0.25);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  position: relative;
  z-index: 1;
}

.plus-icon {
  font-size: 2.8rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 300;
  line-height: 1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15));
}

.card-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
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
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.category-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0.4rem 0;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

.product-item:hover .category-dot {
  width: 14px;
  height: 14px;
  box-shadow: 0 0 12px currentColor, inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

.product-expiry {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* Delete Button */
.delete-btn {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  width: 28px;
  height: 28px;
  background: rgba(255, 100, 100, 0.1);
  border: 1px solid rgba(255, 100, 100, 0.3);
  border-radius: 50%;
  color: rgba(255, 150, 150, 0.7);
  font-size: 1.4rem;
  font-weight: 300;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 10;
  line-height: 1;
}

.delete-btn:hover {
  background: rgba(255, 100, 100, 0.25);
  border-color: rgba(255, 100, 100, 0.5);
  color: rgba(255, 100, 100, 0.95);
  box-shadow: 0 0 15px rgba(255, 100, 100, 0.2);
}

.add-card {
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.add-card:hover {
  border-color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.08);
}

/* Modal */
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
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 30px;
  padding: 3.5rem;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08),
              inset 0 1px 1px rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
}

.modal-content.modal-with-calendar {
  max-width: 1000px;
  display: flex;
  gap: 3rem;
  padding: 2.5rem;
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
</style>

