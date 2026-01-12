import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { setupAxiosInterceptors } from './axiosInterceptors'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  access_token?: string
  user: {
    id: number
    email: string
  }
}

export interface AuthError {
  message: string
  status?: number
}

class AuthService {
  private apiClient: AxiosInstance
  private baseURL: string

  constructor(baseURL: string = '') {
    // In Entwicklung: Nutze relative URLs für Proxy
    // In Produktion: Nutze absolute URLs
    if (import.meta.env.DEV) {
      this.baseURL = ''
    } else {
      this.baseURL = import.meta.env.VITE_API_URL || 'https://pantrix.onrender.com'
    }

    // Wenn baseURL als Parameter übergeben wird, nutze diesen
    if (baseURL) {
      this.baseURL = baseURL
    }

    this.apiClient = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Setup Interceptors für diesen Client
    setupAxiosInterceptors(this.apiClient)
  }

  /**
   * Login Benutzer mit E-Mail und Passwort
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post<AuthResponse>('/auth/login', payload)
      const token = response.data.token || response.data.access_token

      if (!token) {
        // Erstelle einen Error und leite ihn direkt an handleError weiter
        const error: any = new Error('Kein Token vom Server erhalten')
        error.isTokenError = true
        throw error
      }

      // Token speichern
      this.setToken(token)

      return response.data
    } catch (error: any) {
      // Wenn es bereits ein bearbeiteter Error ist, werfe ihn direkt
      if (error.isTokenError) {
        throw this.handleError(error)
      }
      throw this.handleError(error)
    }
  }

  /**
   * Registriere neuen Benutzer
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post<AuthResponse>('/auth/register', payload)
      const token = response.data.token || response.data.access_token

      if (!token) {
        // Behandle Token-Fehler
        const error: any = new Error('Kein Token vom Server erhalten')
        error.isTokenError = true
        throw error
      }

      // Token speichern
      this.setToken(token)

      return response.data
    } catch (error: any) {
      // Wende handleError auf alle Fehler an
      if (error.isTokenError) {
        throw this.handleError(error)
      }
      throw this.handleError(error)
    }
  }

  /**
   * Logout Benutzer
   */
  async logout(): Promise<void> {
    try {
      // Optional: Server notifizieren
      await this.apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout Fehler:', error)
    } finally {
      // Token immer löschen, auch wenn Server-Fehler
      this.clearToken()
    }
  }

  /**
   * Überprüfe ob Benutzer angemeldet ist
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  /**
   * Hole aktuellen Token
   */
  getToken(): string | null {
    return localStorage.getItem('authToken')
  }

  /**
   * Speichere Token
   */
  setToken(token: string): void {
    localStorage.setItem('authToken', token)
    this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  /**
   * Lösche Token
   */
  clearToken(): void {
    localStorage.removeItem('authToken')
    delete this.apiClient.defaults.headers.common['Authorization']
    delete axios.defaults.headers.common['Authorization']
  }

  /**
   * Initialisiere Token beim App-Start
   */
  initializeToken(): void {
    const token = this.getToken()
    if (token) {
      this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }

  /**
   * Hole Fehler-Details
   */
  private handleError(error: any): AuthError {
    const errorObj: AuthError = {
      message: 'Ein Fehler ist aufgetreten'
    }

    if (error.response) {
      errorObj.status = error.response.status

      // Spezifische Fehlermeldungen basierend auf Status
      switch (error.response.status) {
        case 400:
          errorObj.message = error.response.data?.message || 'Ungültige Eingabe'
          break
        case 401:
          errorObj.message = 'E-Mail oder Passwort ist falsch'
          break
        case 404:
          errorObj.message = 'Benutzer nicht gefunden'
          break
        case 409:
          errorObj.message = 'Diese E-Mail ist bereits registriert'
          break
        case 422:
          errorObj.message = error.response.data?.message || 'Validierungsfehler'
          break
        case 500:
          errorObj.message = 'Serverfehler. Bitte versuchen Sie es später erneut'
          break
        default:
          errorObj.message = error.response.data?.message || 'Ein Fehler ist aufgetreten'
      }
    } else if (error.message === 'Kein Token vom Server erhalten') {
      errorObj.message = 'Login erfolgreich, aber Token konnte nicht empfangen werden'
    } else if (error.request) {
      errorObj.message = 'Keine Antwort vom Server. Bitte überprüfen Sie Ihre Verbindung'
    } else {
      errorObj.message = error.message || 'Ein unbekannter Fehler ist aufgetreten'
    }

    return errorObj
  }
}

// Singleton-Instanz exportieren
export default new AuthService()

