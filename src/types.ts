export type Thing = { id?: number, name: string, price: number, owner: string }

/**
 * Produkt-Typ für die Vorratskammer
 */
export interface Product {
  id?: number
  userId?: number
  name: string
  category: string
  expiryDate: string // ISO-Format: YYYY-MM-DD
  addedDate?: string // ISO-Format: YYYY-MM-DD
  quantity: number
  unit: string // z.B. "kg", "l", "Stück"
  status?: 'fresh' | 'expiring_soon' | 'expired' | 'saved' // Status des Produkts
  notes?: string
  imageBase64?: string // Base64-kodiertes Produktbild
  createdAt?: string
  updatedAt?: string
}

/**
 * Statistik-Typ für Dashboard-Metriken
 */
export interface Statistics {
  userId: number
  totalProducts: number
  savedProducts: number
  expiredProducts: number
  capacity: number
  capacityPercentage: number
  lastUpdated: string
}

/**
 * API Response für Produkte
 */
export interface ProductResponse {
  success: boolean
  data: Product | Product[]
  message?: string
}

/**
 * Alert/Meldung für Produkte in der Vorratskammer
 */
export interface Alert {
  id: number
  type: 'warning' | 'info' | 'success'
  icon: string
  title: string
  message: string
  date: string
  expiryDate?: string
  productName?: string
  category?: string
}

/**
 * API Response für Statistiken
 */
export interface StatisticsResponse {
  success: boolean
  data: Statistics
  message?: string
}

