# Vue Authentication System mit Axios

Dieses Authentifizierungssystem bietet eine vollständige Lösung für Login, Registrierung und Token-Management in Vue 3.

## Features

✅ **Login & Registrierung** mit Backend-API  
✅ **JWT Token Management** mit localStorage  
✅ **Axios Interceptors** für automatische Token-Verwaltung  
✅ **Auth Guards** für Route-Schutz  
✅ **Composables** für einfache Wiederverwendung  
✅ **Error Handling** mit spezifischen Fehlermeldungen  
✅ **Token Refresh** bei Ablauf  
✅ **Logout** mit Token-Löschung  

## Struktur

```
src/
├── services/
│   ├── authService.ts          # Auth-Service (Login, Register, Logout)
│   └── axiosInterceptors.ts    # Axios Interceptors für Token-Handling
├── composables/
│   └── useAuth.ts              # Auth-Composable für Vue-Komponenten
└── utils/
    └── authUtils.ts            # Utility-Funktionen (Token-Validierung, etc.)
```

## Verwendung

### 1. Im Main-File (main.ts)

```typescript
import { useAuth } from './composables/useAuth'

const app = createApp(App)

// Initialisiere Auth beim App-Start
const { initialize } = useAuth()
initialize()

app.mount('#app')
```

### 2. In Komponenten

```vue
<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { 
  login, 
  register, 
  logout,
  isLoggedIn,
  currentUser,
  errorMessage,
  isLoading
} = useAuth()

const handleLogin = async () => {
  const success = await login(email, password)
  if (success) {
    // Redirect zur HomeView
  }
}

const handleLogout = async () => {
  await logout()
  // Redirect zur LoginView
}
</script>
```

### 3. Token-Validierung

```typescript
import { 
  isTokenValid, 
  decodeToken, 
  getCurrentToken 
} from '@/utils/authUtils'

// Überprüfe ob Token gültig ist
if (isTokenValid()) {
  // Token ist gültig
}

// Dekodiere Token
const payload = decodeToken()
console.log(payload.user_id) // Zugriff auf Token-Daten
```

## API-Anforderungen

Die Backend-API sollte folgende Endpoints haben:

### Login
**POST** `/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### Registrierung
**POST** `/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response: Gleich wie Login

### Logout (Optional)
**POST** `/auth/logout`

## Sicherheit

- ✅ Token wird in **localStorage** gespeichert
- ✅ Token wird automatisch zu jedem Request hinzugefügt
- ✅ Bei 401-Fehler wird Token gelöscht und Benutzer zur Login-Seite umgeleitet
- ✅ Token-Validierung mit Ablauf-Überprüfung
- ✅ CSRF-Schutz durch Token-basierte Authentifizierung

## Interceptors

### Request Interceptor
- Fügt automatisch `Authorization: Bearer ${token}` Header hinzu
- Wird vor jedem Request ausgeführt

### Response Interceptor
- Überwacht 401-Fehler (Token abgelaufen)
- Löscht Token und leitet zum Login um
- Loggt alle Fehler

## Error Handling

Das System behandelt folgende Fehler automatisch:

- **400** - Ungültige Eingabe
- **401** - Falsche Anmeldedaten / Token abgelaufen
- **404** - Benutzer nicht gefunden
- **409** - E-Mail bereits registriert
- **422** - Validierungsfehler
- **500** - Serverfehler

## Umgebungsvariablen

```
VITE_API_URL=https://api.example.com
```

Wenn nicht gesetzt, wird die Standard-URL verwendet.

## Best Practices

1. **Initialisiere Auth beim App-Start**
2. **Verwende Composables** statt direkter Service-Aufrufe
3. **Überprüfe isAuthenticated** vor geschützten Routes
4. **Speichere nur öffentliche Daten** im localStorage
5. **Implementiere Token Refresh** für längere Sessions
6. **Validiere Tokens** auf der Server-Seite
7. **Verwende HTTPS** in Produktion

## Erweiterungen

### Token Refresh
```typescript
// In authService.ts hinzufügen
async refreshToken(): Promise<string> {
  const response = await this.apiClient.post('/auth/refresh')
  const token = response.data.token
  this.setToken(token)
  return token
}
```

### Remember Me
```typescript
// localStorage nutzen
localStorage.setItem('rememberMe', 'true')
```

### Multi-Factor Authentication
```typescript
// Zusätzlicher Validierungsschritt vor Login
async verifyMFA(code: string): Promise<boolean>
```

## Troubleshooting

**Problem**: Token wird nicht gespeichert
- ✅ Überprüfe localStorage in Browser DevTools
- ✅ Überprüfe Response vom API

**Problem**: 401-Fehler nach Login
- ✅ Überprüfe Token-Format in Response
- ✅ Überprüfe API-Endpoint

**Problem**: Logout funktioniert nicht
- ✅ Überprüfe ob localStorage gelöscht wird
- ✅ Überprüfe ob Authorization Header entfernt wird

## Support

Für weitere Informationen siehe:
- [JWT Token Dokumentation](https://jwt.io)
- [Axios Dokumentation](https://axios-http.com)
- [Vue 3 Dokumentation](https://vuejs.org)

