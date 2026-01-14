import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type { Statistics, StatisticsResponse } from '../types'
import authService from './authService'

class StatisticsService {
  private apiClient: AxiosInstance
  private statsCache: Statistics | null = null
  private lastUpdateTime: number = 0
  private cacheTimeout: number = 5 * 60 * 1000 // 5 Minuten Cache

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
   * Hole Statistiken mit Cache
   * Endpoint ist optional - wenn 404, gibt es null zurück
   */
  async getStatistics(forceRefresh: boolean = false): Promise<Statistics | null> {
    const now = Date.now()

    // Wenn Cache noch gültig und kein Force-Refresh
    if (
      !forceRefresh &&
      this.statsCache &&
      now - this.lastUpdateTime < this.cacheTimeout
    ) {
      return this.statsCache
    }

    try {
      const response = await this.apiClient.get<StatisticsResponse>('/api/statistics')
      this.statsCache = response.data.data
      this.lastUpdateTime = now
      return this.statsCache
    } catch (error: any) {
      // Statistiken sind optional - 404 ist OK
      if (error?.response?.status === 404) {
        return null // Endpoint existiert nicht
      }
      // Für andere Fehler: still schweigen (keine console.error)
      return null
    }
  }

  /**
   * Berechne Statistiken neu (nach Änderungen)
   * Endpoint ist optional - ignoriere Fehler silent
   */
  async recalculateStatistics(): Promise<Statistics | null> {
    try {
      const response = await this.apiClient.post<StatisticsResponse>('/api/statistics/recalculate', {})
      this.statsCache = response.data.data
      this.lastUpdateTime = Date.now()
      return this.statsCache
    } catch (error: any) {
      // Statistiken sind optional - Fehler ignorieren
      return null
    }
  }

  /**
   * Cache invalidieren
   */
  invalidateCache(): void {
    this.statsCache = null
    this.lastUpdateTime = 0
  }
}

export default new StatisticsService()

