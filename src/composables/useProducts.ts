import { ref, computed } from 'vue'
import type { Product } from '../types'
import productService from '../services/productService'
import statisticsService from '../services/statisticsService'

export function useProducts() {
  const products = ref<Product[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const selectedProduct = ref<Product | null>(null)

  /**
   * Lade alle Produkte
   */
  const loadProducts = async () => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      products.value = await productService.getProducts()
    } catch (error: unknown) {
      const err = error as Error
      errorMessage.value = err.message || 'Fehler beim Laden der Produkte'
      console.error(error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Füge ein neues Produkt hinzu
   */
  const addProduct = async (product: Product) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const newProduct = await productService.createProduct(product)
      products.value.push(newProduct)

      // Statistiken aktualisieren
      await statisticsService.recalculateStatistics()

      return newProduct
    } catch (error: unknown) {
      const err = error as Error
      errorMessage.value = err.message || 'Fehler beim Hinzufügen des Produkts'
      console.error(error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Aktualisiere ein Produkt
   */
  const updateProduct = async (id: number, updatedData: Partial<Product>) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const updated = await productService.updateProduct(id, updatedData)

      // Aktualisiere in lokaler Liste
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updated
      }

      // Statistiken aktualisieren
      await statisticsService.recalculateStatistics()

      return updated
    } catch (error: unknown) {
      const err = error as Error
      errorMessage.value = err.message || 'Fehler beim Aktualisieren des Produkts'
      console.error(error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lösche ein Produkt
   */
  const deleteProduct = async (id: number) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      await productService.deleteProduct(id)

      // Entferne aus lokaler Liste
      products.value = products.value.filter(p => p.id !== id)

      // Statistiken aktualisieren
      await statisticsService.recalculateStatistics()
    } catch (error: unknown) {
      const err = error as Error
      errorMessage.value = err.message || 'Fehler beim Löschen des Produkts'
      console.error(error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Markiere Produkt als verzerrt (gerettet)
   */
  const consumeProduct = async (id: number) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const updated = await productService.consumeProduct(id)

      // Aktualisiere in lokaler Liste
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updated
      }

      // Statistiken aktualisieren
      await statisticsService.recalculateStatistics()

      return updated
    } catch (error: unknown) {
      const err = error as Error
      errorMessage.value = err.message || 'Fehler beim Markieren des Produkts'
      console.error(error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Computed: Produkte die in den nächsten 3 Tagen ablaufen
   */
  const expiringProducts = computed(() => {
    const today = new Date()
    const inThreeDays = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)

    return products.value.filter(p => {
      if (!p.expiryDate) return false
      const expiry = new Date(p.expiryDate)
      return expiry <= inThreeDays && expiry > today
    })
  })

  /**
   * Computed: Abgelaufene Produkte
   */
  const expiredProducts = computed(() => {
    const today = new Date()
    return products.value.filter(p => {
      if (!p.expiryDate) return false
      const expiry = new Date(p.expiryDate)
      return expiry <= today && p.status !== 'saved'
    })
  })

  /**
   * Computed: Gerettete Produkte
   */
  const savedProducts = computed(() => {
    return products.value.filter(p => p.status === 'saved')
  })

  /**
   * Computed: Frische Produkte
   */
  const freshProducts = computed(() => {
    const today = new Date()
    const inThreeDays = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)

    return products.value.filter(p => {
      if (!p.expiryDate) return true
      const expiry = new Date(p.expiryDate)
      return expiry > inThreeDays
    })
  })

  return {
    // State
    products,
    isLoading,
    errorMessage,
    selectedProduct,

    // Methods
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    consumeProduct,

    // Computed
    expiringProducts,
    expiredProducts,
    savedProducts,
    freshProducts
  }
}

