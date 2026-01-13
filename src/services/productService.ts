import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type { Product, ProductResponse } from '../types'
import authService from './authService'

export interface ProductError {
  message: string
  status?: number
}

class ProductService {
  private apiClient: AxiosInstance

  constructor() {
    this.apiClient = axios.create({
      baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'https://pantrix.onrender.com'),
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
   * Fehlerbehandlung für API-Responses
   */
  private handleError(error: unknown): ProductError {
    const err = error as Record<string, unknown>
    const defaultMessage = 'Ein Fehler ist aufgetreten'

    if (err?.response) {
      const response = err.response as Record<string, unknown>
      const data = response.data as Record<string, unknown> | undefined
      return {
        message: (data?.message as string) || defaultMessage,
        status: response.status as number
      }
    }

    return {
      message: defaultMessage,
      status: undefined
    }
  }

  /**
   * Hole alle Produkte des aktuellen Benutzers
   */
  async getProducts(): Promise<Product[]> {
    try {
      const response = await this.apiClient.get<ProductResponse>('/api/products')
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
    } catch (error: unknown) {
      console.error('Fehler beim Abrufen der Produkte:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Erstelle ein neues Produkt
   */
  async createProduct(product: Product): Promise<Product> {
    try {
      const response = await this.apiClient.post<ProductResponse>('/api/products', product)
      return response.data.data as Product
    } catch (error: unknown) {
      console.error('Fehler beim Erstellen des Produkts:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Aktualisiere ein Produkt
   */
  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    try {
      const response = await this.apiClient.put<ProductResponse>(`/api/products/${id}`, product)
      return response.data.data as Product
    } catch (error: unknown) {
      console.error('Fehler beim Aktualisieren des Produkts:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Lösche ein Produkt
   */
  async deleteProduct(id: number): Promise<void> {
    try {
      await this.apiClient.delete(`/api/products/${id}`)
    } catch (error: unknown) {
      console.error('Fehler beim Löschen des Produkts:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Markiere ein Produkt als verzerrt (gerettet)
   */
  async consumeProduct(id: number): Promise<Product> {
    try {
      const response = await this.apiClient.put<ProductResponse>(`/api/products/${id}`, {
        status: 'saved'
      })
      return response.data.data as Product
    } catch (error: unknown) {
      console.error('Fehler beim Markieren des Produkts:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Hole ein einzelnes Produkt
   */
  async getProduct(id: number): Promise<Product> {
    try {
      const response = await this.apiClient.get<ProductResponse>(`/api/products/${id}`)
      return response.data.data as Product
    } catch (error: unknown) {
      console.error('Fehler beim Abrufen des Produkts:', error)
      throw this.handleError(error)
    }
  }
}

export default new ProductService()

