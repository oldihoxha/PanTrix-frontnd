<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'


interface Product {
  name: string
  expiryDate: string
  icon: string
  background: string
}

interface Category {
  name: string
  products: Product[]
}

const categories = ref<Category[]>([
  {
    name: 'Obst',
    products: [
      {
        name: 'Apfel',
        expiryDate: '15.11.2025',
        icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4caf50"/>',
        background: 'linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%)'
      },
      {
        name: 'Banane',
        expiryDate: '30.12.2025',
        icon: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#ff9800"/>',
        background: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)'
      }
    ]
  },
  {
    name: 'Gemüse',
    products: [
      {
        name: 'Karotte',
        expiryDate: '10.01.2026',
        icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 5L9 17l-4-4 1.41-1.41L9 14.17l6.59-6.59L17 7z" fill="#2196f3"/>',
        background: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)'
      }
    ]
  },
  {
    name: 'Milchprodukte',
    products: [
      {
        name: 'Käse',
        expiryDate: '30.12.2025',
        icon: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#ff9800"/>',
        background: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)'
      },

      {
        name: 'Milch',
        expiryDate: '05.02.2026',
        icon: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#8bc34a"/>',
        background: 'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)'
      }
    ]
  },
  {
    name: 'Backwaren',
    products: [
      {
        name: 'Brot',
        expiryDate: '10.01.2026',
        icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 5L9 17l-4-4 1.41-1.41L9 14.17l6.59-6.59L17 7z" fill="#2196f3"/>',
        background: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)'
      }
    ]
  },
  {
    name: 'Fleisch',
    products: [
      {
        name: 'Wurst',
        expiryDate: '15.11.2025',
        icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4caf50"/>',
        background: 'linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%)'
      }
    ]
  }
])

import axios from 'axios'
import { onMounted, ref } from 'vue'


const fetchedProducts = ref<Product[]>([])

const loadThings = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://pantrix.onrender.com'
    const response = await axios.get(`${baseUrl}/test`)
    console.log('products', response.data)

    fetchedProducts.value = response.data


  } catch (error) {
    console.error('Fehler beim Laden der Produkte:', error)
  }
}

onMounted(loadThings)

const testResult = ref<string>('')

const isLoading = ref(false)

const test = async () => {
  isLoading.value = true
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://pantrix.onrender.com'
    const response = await axios.get(`${baseUrl}/test`)

    console.log('Gespeicherte Produkte aus dem Backend:', response.data)

    const count = Array.isArray(response.data) ? response.data.length : 0
    testResult.value = `Es wurden ${count} Produkte aus dem Backend geladen.`
  } catch (error) {
    console.error('Fehler beim Abrufen der Produkte:', error)
    testResult.value = 'Fehler beim Laden der Produkte'
  } finally {
    isLoading.value = false
  }
}

const save = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://pantrix.onrender.com'
    await axios.post(`${baseUrl}/test`, fetchedProducts.value)
    console.log('Produkte erfolgreich gespeichert.')
  } catch (error) {
    console.error('Fehler beim Speichern der Produkte:', error)
  }
}

const expandedCategories = ref<Set<string>>(new Set());

const showAddProductModal = ref(false)
const selectedCategory = ref('');
const newProductName = ref('');
const newProductExpiryDate = ref('')
const dateError = ref('')

const toggleCategory = (categoryName: string) => {
  if (expandedCategories.value.has(categoryName)) {
    expandedCategories.value.delete(categoryName)
  } else {
    expandedCategories.value.add(categoryName)
  }
}

const openAddProductModal = (categoryName: string) => {
  selectedCategory.value = categoryName
  newProductName.value = ''
  newProductExpiryDate.value = ''
  dateError.value = ''
  showAddProductModal.value = true
}

const validateDate = (dateStr: string): boolean => {
  const parts = dateStr.split('.')
  if (parts.length !== 3) return false
  const [dayStr, monthStr, yearStr] = parts as [string, string, string]
  const day = parseInt(dayStr, 10)
  const month = parseInt(monthStr, 10)
  const year = parseInt(yearStr, 10)
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

const addProduct = async () => {

  try {
    const baseUrl = import.meta.env.VITE_API_URL;
    const response = await axios.get(`https://pantrix.onrender.com/test`);
    console.log('Test response:', response.data);
  } catch (error) {
    console.error('Fehler beim Abrufen von /test:', error)
  }

  dateError.value = ''
  if (!newProductName.value.trim()) {

  }
  if (!validateDate(newProductExpiryDate.value)) {
    dateError.value = 'Bitte geben Sie ein gültiges Datum im Format TT.MM.JJJJ ein.'
    return
  }
  if (newProductName.value.trim() && newProductExpiryDate.value.trim()) {
    const category = categories.value.find(cat => cat.name === selectedCategory.value)
    if (category) {
      category.products.push({
        name: newProductName.value.trim(),
        expiryDate: newProductExpiryDate.value.trim(),
        icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4caf50"/>',
        background: 'linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%)'
      })
      newProductName.value = ''
      newProductExpiryDate.value = ''
      dateError.value = ''
      showAddProductModal.value = false
    }
  }
}
</script>

<template>
  <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Kategorien und Produkte</template>

    <div class="categories">
      <button class="test-button" @click="test" :disabled="isLoading">
        <span v-if="isLoading" class="loader"></span>
        <span v-else>Test</span>
      </button>
      <p v-if="testResult">Test\-Ergebnis: {{ testResult }}</p>
      <div v-for="category in categories" :key="category.name" class="category">
        <button @click="toggleCategory(category.name)" class="category-button">
          {{ category.name }}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{ 'arrow-rotated': expandedCategories.has(category.name) }" class="arrow">
            <path d="M7 10l5 5 5-5z" fill="#fff"/>
          </svg>
        </button>
        <Transition name="slide">
          <div v-if="expandedCategories.has(category.name)" class="products">
            <div v-for="(product, index) in category.products" :key="index" class="product-card" :style="{ background: product.background, animationDelay: `${index * 0.1}s` }">
              <div class="product-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-html="product.icon"></svg>
              </div>
              <h4>{{ product.name }}</h4>
              <p>Ablaufdatum: {{ product.expiryDate }}</p>
            </div>
          </div>
        </Transition>
        <Transition name="fade">
          <button v-if="expandedCategories.has(category.name)" @click="openAddProductModal(category.name)" class="add-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="white"/>
            </svg>
            Produkt hinzufügen
          </button>
        </Transition>
      </div>
    </div>

    <Transition name="modal">
      <div v-if="showAddProductModal" class="modal-overlay">
        <div class="modal">
          <h3>Neues Produkt hinzufügen</h3>
          <label>
            Produktname:
            <input type="text" v-model="newProductName" />
          </label>
          <label>
            Ablaufdatum:
            <input type="text" v-model="newProductExpiryDate" />
          </label>
          <p v-if="dateError" class="error">{{ dateError }}</p>
          <div class="modal-actions">
            <button @click="addProduct">Hinzufügen</button>
            <button @click="showAddProductModal = false">Abbrechen</button>
          </div>
        </div>
      </div>
    </Transition>
  </WelcomeItem>
</template>

<style scoped>
.categories {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 70vh;
  overflow-y: auto;
}

.category {
  margin-bottom: 1rem;
}

.category-button {
  width: 100%;
  padding: 0.75rem;
  background: #2196f3;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  transition: background-color 0.3s, transform 0.2s;
}

.category-button:hover {
  background: #1976d2;
  transform: translateY(-2px);
}

.arrow {
  transition: transform 0.2s;
}

.arrow-rotated {
  transform: rotate(180deg);
}

.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.product-card {
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  animation: fadeInUp 0.5s ease-out forwards;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.product-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.product-card h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.product-card p {
  margin: 0;
  font-size: 0.9rem;
}

.add-button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s, transform 0.2s;
}

.add-button:hover {
  background: #1976d2;
  transform: translateY(-2px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
}

.modal h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.modal label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.modal input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s, transform 0.2s;
}

.modal-actions button:first-child {
  background: #4caf50;
  color: white;
}

.modal-actions button:first-child:hover {
  background: #43a047;
}

.modal-actions button:last-child {
  background: #f44336;
  color: white;
}

.modal-actions button:last-child:hover {
  background: #e53935;
}

.error {
  color: red;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
}

.slide-enter-active, .slide-leave-active {
  transition: max-height 0.5s ease-in-out, opacity 0.5s ease;
}

.slide-enter, .slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.modal-enter, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loader {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  margin-right: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
