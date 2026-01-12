import authService from '../services/authService'

/**
 * Hole aktuellen Token
 */
export function getCurrentToken(): string | null {
  return authService.getToken()
}


/**
 * Überprüfe ob Token gültig ist (einfache Überprüfung)
 */
export function isTokenValid(): boolean {
  const token = authService.getToken()

  if (!token) {
    return false
  }

  try {
    // Dekodiere JWT Token (einfache Base64 Dekodierung)
    const parts = token.split('.')

    if (parts.length !== 3) {
      return false
    }

    // Dekodiere Payload
    const decodedPart = parts[1]
    if (!decodedPart) {
      return false
    }
    const payload = JSON.parse(atob(decodedPart))

    // Überprüfe Ablauf-Zeit
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000)
      return payload.exp > now
    }

    return true
  } catch (error) {
    console.error('Token Validierung Fehler:', error)
    return false
  }
}

/**
 * Dekodiere JWT Token und hole Daten
 */
export function decodeToken(token?: string): any {
  const tokenToDecode = token || authService.getToken()

  if (!tokenToDecode) {
    return null
  }

  try {
    const parts = tokenToDecode.split('.')

    if (parts.length !== 3) {
      return null
    }

    const decodedPart = parts[1]
    if (!decodedPart) {
      return null
    }

    return JSON.parse(atob(decodedPart))
  } catch (error) {
    console.error('Token Dekodierung Fehler:', error)
    return null
  }
}

