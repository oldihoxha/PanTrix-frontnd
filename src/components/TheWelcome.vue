<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import axios from 'axios'
import { onMounted, ref } from 'vue'


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

const fetchedProducts = ref<Product[]>([])


const baseUrl = import.meta.env.VITE_API_URL || 'https://pantrix.onrender.com'


const loadThings = async () => {
  try {
    const response = await axios.get(`${baseUrl}/test`)
    console.log('Produkte beim Laden (onMounted):', response.data)
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
  testResult.value = ''
  try {
    const response = await axios.get(`${baseUrl}/test`)


    console.log('Gespeicherte Produkte aus dem Backend (Test-Button):', response.data)

    fetchedProducts.value = response.data
    const count = Array.isArray(response.data) ? response.data.length : 0
    testResult.value = `Es wurden ${count} Produkte aus dem Backend geladen. (siehe Konsole)`
  } catch (error) {
    console.error('Fehler beim Abrufen der Produkte (Test-Button):', error)
    testResult.value = 'Fehler beim Laden der Produkte (Details in der Konsole)'
  } finally {
    isLoading.value = false
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
  <div class="blank-page">
    <h1>Blank Page</h1>
    <p>Diese Seite ist leer, damit wir gemeinsam gestalten können.</p>
  </div>
</template>

<style scoped>
.blank-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f9f9f9;
  color: #333;
  text-align: center;
}

.blank-page h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.blank-page p {
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
}
</style>
