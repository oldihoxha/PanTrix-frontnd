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
        <!-- Actual Products -->
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card product-item"
          @click="selectProduct(product)"
        >
          <div class="card-content">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-category">{{ product.category }}</div>
            <div class="product-expiry">Ablauf: {{ product.expiryDate }}</div>
          </div>
        </div>

        <!-- Add Product Card (Last Card) -->
        <div class="product-card add-card" @click="openAddProductModal">
          <div class="card-content">
            <div class="plus-icon">+</div>
            <span class="card-text">Produkt hinzufügen</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddProductModal">
      <div class="modal-content">
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
            <select v-model="newProduct.category" required>
              <option value="">Kategorie wählen</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Ablaufdatum *</label>
            <input v-model="newProduct.expiryDate" type="date" required />
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

const categories = ref(['Alle', 'Getränke', 'Backwaren', 'Gewürze', 'Konserven'])
const sortOptions = ref(['Neu hinzugefügt', 'Ablaufdatum', 'Kategorie', 'Name'])

const products = ref<Product[]>([
  { id: 1, name: 'Milch', category: 'Getränke', expiryDate: '2026-01-15', quantity: 2 },
  { id: 2, name: 'Brot', category: 'Backwaren', expiryDate: '2026-01-12', quantity: 1 },
  { id: 3, name: 'Tomaten', category: 'Konserven', expiryDate: '2026-06-20', quantity: 3 },
  { id: 4, name: 'Pfeffer', category: 'Gewürze', expiryDate: '2027-01-10', quantity: 1 },
  { id: 5, name: 'Orangensaft', category: 'Getränke', expiryDate: '2026-02-01', quantity: 1 },
])

const newProduct = ref<Partial<Product>>({
  name: '',
  category: '',
  expiryDate: '',
  quantity: 1,
})

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
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Search Bar */
.search-wrapper {
  flex: 0 0 280px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.85rem 2.5rem 0.85rem 1.2rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(200, 200, 200, 0.3);
  border-radius: 50px;
  font-size: 0.95rem;
  color: #333333;
  font-family: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.search-input::placeholder {
  color: rgba(100, 100, 100, 0.6);
}

.search-input:focus {
  outline: none;
  background: #ffffff;
  border-color: rgba(200, 150, 100, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
}

.search-icon {
  position: absolute;
  right: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  opacity: 0.5;
  font-size: 1rem;
}

/* Category Tabs */
.category-tabs {
  flex: 1;
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.7rem 1.8rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 25px;
  color: rgba(200, 200, 200, 0.9);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.category-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.category-btn.active {
  background: linear-gradient(135deg, rgba(255, 159, 28, 0.3) 0%, rgba(255, 159, 28, 0.1) 100%);
  color: #FF9F1C;
  border-color: rgba(255, 159, 28, 0.5);
  box-shadow: 0 4px 15px rgba(255, 159, 28, 0.2);
}

/* Dropdown */
.dropdown-wrapper {
  flex: 0 0 auto;
}

.dropdown-btn {
  padding: 0.7rem 1.8rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: rgba(200, 200, 200, 0.9);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.dropdown-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dropdown-arrow {
  font-size: 0.65rem;
  display: inline-block;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.8rem;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  transition: all 0.3s ease;
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

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(20, 20, 30, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  margin-top: 0.6rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 100;
  min-width: 180px;
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
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.dropdown-menu button:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
}

.dropdown-menu button.selected {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.95);
}

.dropdown-menu button:last-child {
  border-bottom: none;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
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

.product-category {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.2rem;
}

.product-expiry {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: rgba(20, 20, 30, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 700;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: rgba(255, 255, 255, 0.9);
}

/* Form */
.product-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.form-group label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 700;
}

.form-group input,
.form-group select {
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.form-group select option {
  background: #1a1a2e;
  color: rgba(255, 255, 255, 0.9);
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.9rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
}

.btn-submit {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-submit:hover {
  background: rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
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

