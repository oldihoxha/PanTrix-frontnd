import { ref, computed } from 'vue'
import authService from '../services/authService'

export function useAuth() {
  const isLoggedIn = ref(false)
  const currentUser = ref<string>('')
  const authToken = ref<string>('')
  const isLoading = ref(false)
  const errorMessage = ref('')

  // Check ob bereits angemeldet
  const isAuthenticated = computed(() => authService.isAuthenticated())

  /**
   * Login mit E-Mail und Passwort
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    errorMessage.value = ''
    isLoading.value = true

    try {
      const response = await authService.login({ email, password })

      const token = response.token || response.access_token
      if (!token) {
        throw new Error('Kein Token vom Server erhalten')
      }

      authToken.value = token
      currentUser.value = email
      isLoggedIn.value = true

      return true
    } catch (error: any) {
      errorMessage.value = error.message || 'Login fehlgeschlagen'
      console.error('Login Error:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Registriere neuen Benutzer
   */
  const register = async (email: string, password: string): Promise<boolean> => {
    errorMessage.value = ''
    isLoading.value = true

    try {
      const response = await authService.register({ email, password })

      const token = response.token || response.access_token
      if (!token) {
        throw new Error('Kein Token vom Server erhalten')
      }

      authToken.value = token
      currentUser.value = email
      isLoggedIn.value = true

      return true
    } catch (error: any) {
      errorMessage.value = error.message || 'Registrierung fehlgeschlagen'
      console.error('Register Error:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout
   */
  const logout = async (): Promise<void> => {
    isLoading.value = true

    try {
      await authService.logout()
    } finally {
      authToken.value = ''
      currentUser.value = ''
      isLoggedIn.value = false
      errorMessage.value = ''
      isLoading.value = false
    }
  }

  /**
   * Initialisiere Auth-Status beim App-Start
   */
  const initialize = (): void => {
    authService.initializeToken()

    if (authService.isAuthenticated()) {
      isLoggedIn.value = true
      // Versuche Benutzer-Info aus localStorage zu laden oder vom Token zu dekodieren
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        currentUser.value = storedUser
      }
      authToken.value = authService.getToken() || ''
    }
  }

  /**
   * Setze aktuellen Benutzer
   */
  const setCurrentUser = (user: string): void => {
    currentUser.value = user
    localStorage.setItem('currentUser', user)
  }

  return {
    // States
    isLoggedIn,
    currentUser,
    authToken,
    isLoading,
    errorMessage,

    // Computed
    isAuthenticated,

    // Methods
    login,
    register,
    logout,
    initialize,
    setCurrentUser
  }
}

