import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type { Product, ProductResponse } from '../types'
import authService from './authService'

class ProductService {
  private apiClient: AxiosInstance

  constructor() {
    this.apiClient = axios.create({
      baseURL: import.meta.env.DEV ? 'http://localhost:8080' : (import.meta.env.VITE_API_URL || 'https://pantrix.onrender.com'),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Setup Request-Interceptor für Token
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = authService.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Setup Response-Interceptor für Fehler
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token abgelaufen - logout
          authService.clearToken()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * Hole alle Produkte des aktuellen Benutzers
   */
  async getProducts(): Promise<Product[]> {
    try {
      const response = await this.apiClient.get<Product[]>('/api/products')
      // Backend gibt direkt ein Array zurück, nicht wrapped in { data: ... }
      return Array.isArray(response.data) ? response.data : [response.data]
    } catch (error: unknown) {
      const err = error as any
      console.error('Fehler beim Abrufen der Produkte:', error)
      throw {
        message: err?.response?.data?.message || 'Fehler beim Laden der Produkte',
        status: err?.response?.status
      }
    }
  }

  /**
   * Erstelle ein neues Produkt
   */
  async createProduct(product: Product): Promise<Product> {
    try {
      const response = await this.apiClient.post<Product>('/api/products', product)
      // Backend gibt direkt das Produkt zurück mit ID
      return response.data
    } catch (error: unknown) {
      const err = error as any
      console.error('Fehler beim Erstellen des Produkts:', error)
      throw {
        message: err?.response?.data?.message || 'Fehler beim Hinzufügen des Produkts',
        status: err?.response?.status
      }
    }
  }

  /**
   * Aktualisiere ein Produkt
   */
  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    try {
      const response = await this.apiClient.put<Product>(`/api/products/${id}`, product)
      // Backend gibt direkt das aktualisierte Produkt zurück
      return response.data
    } catch (error: unknown) {
      const err = error as any
      console.error('Fehler beim Aktualisieren des Produkts:', error)
      throw {
        message: err?.response?.data?.message || 'Fehler beim Aktualisieren des Produkts',
        status: err?.response?.status
      }
    }
  }

  /**
   * Lösche ein Produkt
   */
  async deleteProduct(id: number): Promise<void> {
    try {
      await this.apiClient.delete(`/api/products/${id}`)
    } catch (error: unknown) {
      const err = error as any
      console.error('Fehler beim Löschen des Produkts:', error)
      throw {
        message: err?.response?.data?.message || 'Fehler beim Löschen des Produkts',
        status: err?.response?.status
      }
    }
  }

  /**
   * Markiere ein Produkt als verbraucht (gerettet)
   */
  async consumeProduct(id: number): Promise<Product> {
    try {
      const response = await this.apiClient.post<Product>(`/api/products/${id}/consume`, {})
      // Backend gibt direkt das aktualisierte Produkt zurück
      return response.data
    } catch (error: unknown) {
      const err = error as any
      console.error('Fehler beim Markieren des Produkts:', error)
      throw {
        message: err?.response?.data?.message || 'Fehler beim Markieren des Produkts',
        status: err?.response?.status
      }
    }
  }
}

export default new ProductService()

