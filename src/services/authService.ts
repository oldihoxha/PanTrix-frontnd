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
      },
      // Nicht withCredentials nutzen für öffentliche Endpoints
      withCredentials: false
    })

    // Setup Interceptors für diesen Client
    setupAxiosInterceptors(this.apiClient)
  }

  /**
   * Login Benutzer mit E-Mail und Passwort
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      console.log('Login versucht mit:', payload.email)
      const response = await this.apiClient.post<AuthResponse>('/auth/login', payload)
      console.log('Login Response:', response.data)

      const token = response.data.token || response.data.access_token

      if (!token) {
        console.error('Kein Token in Response erhalten')
        throw new Error('Kein Token vom Server erhalten')
      }

      // Token speichern
      this.setToken(token)
      console.log('Token gespeichert und User angemeldet')

      return response.data
    } catch (error: unknown) {
      console.error('Login Error vollständig:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Registriere neuen Benutzer
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      console.log('Registrierung versucht mit:', payload.email)
      const response = await this.apiClient.post<AuthResponse>('/auth/register', payload)
      console.log('Register Response:', response.data)

      const token = response.data.token || response.data.access_token

      if (!token) {
        console.error('Kein Token in Response erhalten')
        throw new Error('Kein Token vom Server erhalten')
      }

      // Token speichern
      this.setToken(token)
      console.log('Token gespeichert und User registriert')

      return response.data
    } catch (error: unknown) {
      console.error('Register Error vollständig:', error)
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
  private handleError(error: unknown): never {
    let errorMessage = 'Ein Fehler ist aufgetreten'
    const err = error as Record<string, unknown>

    if (err.response) {
      // Server hat geantwortet mit Error-Status
      const response = err.response as Record<string, unknown>
      const status = response.status as number

      switch (status) {
        case 400:
          errorMessage = (response.data as Record<string, unknown>)?.message as string || 'Ungültige Eingabe'
          break
        case 401:
          errorMessage = 'E-Mail oder Passwort ist falsch'
          break
        case 404:
          errorMessage = 'Benutzer nicht gefunden'
          break
        case 409:
          errorMessage = 'Diese E-Mail ist bereits registriert'
          break
        case 422:
          errorMessage = (response.data as Record<string, unknown>)?.message as string || 'Validierungsfehler'
          break
        case 500:
          errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut'
          break
        default:
          errorMessage = (response.data as Record<string, unknown>)?.message as string || 'Ein Fehler ist aufgetreten'
      }
    } else if ((err as Record<string, unknown>).message === 'Kein Token vom Server erhalten') {
      errorMessage = 'Login erfolgreich, aber Token konnte nicht empfangen werden'
    } else if (err.request) {
      // Request wurde gesendet, aber keine Antwort erhalten
      errorMessage = 'Keine Antwort vom Server. Bitte überprüfen Sie Ihre Verbindung'
    } else {
      // Fehler beim Erstellen des Request
      errorMessage = (err as unknown as Error)?.message || 'Ein unbekannter Fehler ist aufgetreten'
    }

    // Werfe Error mit Nachricht
    throw new Error(errorMessage)
  }
}

// Singleton-Instanz exportieren
export default new AuthService()

