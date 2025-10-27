<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import { ref } from 'vue'

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

const expandedCategories = ref<Set<string>>(new Set())

const toggleCategory = (categoryName: string) => {
  if (expandedCategories.value.has(categoryName)) {
    expandedCategories.value.delete(categoryName)
  } else {
    expandedCategories.value.add(categoryName)
  }
}

const addProductToCategory = (categoryName: string) => {
  const category = categories.value.find(cat => cat.name === categoryName)
  if (category) {
    const newProduct: Product = {
      name: 'Neues Produkt',
      expiryDate: '01.01.2027',
      icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 5L9 17l-4-4 1.41-1.41L9 14.17l6.59-6.59L17 7z" fill="#2196f3"/>',
      background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)'
    }
    category.products.push(newProduct)
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
      <div v-for="category in categories" :key="category.name" class="category">
        <button @click="toggleCategory(category.name)" style="width:100%;padding:0.75rem;background:#e0e0e0;border:none;border-radius:8px;cursor:pointer;font-size:1.1rem;font-weight:600;margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center;">
          {{ category.name }}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="{ transform: expandedCategories.has(category.name) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }">
            <path d="M7 10l5 5 5-5z" fill="#333"/>
          </svg>
        </button>
        <div v-if="expandedCategories.has(category.name)" class="products" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;margin-bottom:1rem;">
          <div v-for="(product, index) in category.products" :key="index" class="product-card" :style="{ background: product.background, borderRadius: '12px', padding: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }">
            <div class="product-icon" style="display:flex;justify-content:center;margin-bottom:0.5rem;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-html="product.icon"></svg>
            </div>
            <h4 style="margin:0 0 0.25rem 0;font-size:1.1rem;font-weight:600;color:#333;">{{ product.name }}</h4>
            <p style="margin:0;font-size:0.9rem;color:#666;">Ablaufdatum: {{ product.expiryDate }}</p>
          </div>
        </div>
        <button v-if="expandedCategories.has(category.name)" @click="addProductToCategory(category.name)" style="margin-top:0.5rem;padding:0.5rem 1rem;background:#4caf50;color:white;border:none;border-radius:8px;cursor:pointer;font-size:1rem;display:flex;align-items:center;gap:0.5rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="white"/>
          </svg>
          Produkt hinzufügen
        </button>
      </div>
    </div>
  </WelcomeItem>
</template>
