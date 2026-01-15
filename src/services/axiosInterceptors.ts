import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'

export function setupAxiosInterceptors(apiClient: AxiosInstance): void {
  /**
   * Request Interceptor - Token zu jedem Request hinzufügen
   */
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('authToken')

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error: AxiosError) => {
      return Promise.reject(error)
    }
  )

  /**
   * Response Interceptor - Token-Abgelaufen-Fehler handhaben
   */
  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Wenn 401 Unauthorized kommt, wurde bereits im Backend durch JwtAuthenticationFilter abgewiesen
      if (error.response?.status === 401) {
        console.warn('401 Unauthorized - Token ist ungültig oder abgelaufen')
        // Token löschen da ungültig
        localStorage.removeItem('authToken')
        localStorage.removeItem('currentUser')
        localStorage.removeItem('userId')
        delete apiClient.defaults.headers.common['Authorization']

        // Benutzer wird zur Landing Page neu geladen (durch App-Logic)
        // window.location.reload() ist nicht nötig - Frontend wird neu gerendert
      }

      return Promise.reject(error)
    }
  )
}

