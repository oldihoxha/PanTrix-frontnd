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
      // Wenn 401 Unauthorized, Token ist wahrscheinlich abgelaufen
      if (error.response?.status === 401) {
        // Token löschen
        localStorage.removeItem('authToken')
        localStorage.removeItem('currentUser')
        delete apiClient.defaults.headers.common['Authorization']

        // Benutzer zur Login-Seite umleiten
        window.location.href = '/login'
      }

      return Promise.reject(error)
    }
  )
}

