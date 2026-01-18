# PanTrix - Projektdokumentation

## 📋 Projektübersicht

**PanTrix** ist eine innovative web-basierte Anwendung zur intelligenten Verwaltung von Lebensmitteln und Vorratskammern. Die Plattform ermöglicht Benutzer, ihre Lebensmittelbestände zu erfassen, zu verwalten und zu optimieren, mit Fokus auf die Reduktion von Lebensmittelverschwendung durch die Verfolgung von Ablaufdaten.

**Technologie-Stack:**
- **Frontend-Framework**: Vue 3 (Composition API)
- **Sprache**: TypeScript
- **Build-Tool**: Vite
- **Styling**: CSS mit Glassmorphismus & Backdrop-Filter
- **Testing**: Vitest + @vue/test-utils
- **Komponenten-Architektur**: Single-File Components (.vue)

---

## 🎨 Design-Philosophie

### Visuelles Konzept: Futuristischer Glasmorphismus

Das Design von PanTrix basiert auf modernen Design-Trends und bietet eine einzigartige visuelle Identität:

#### **Glasmorphismus-Effekte**
- **Backdrop-Filter (Blur)**: Alle Komponenten nutzen `backdrop-filter: blur(50px)` für einen transparenten Glaseffekt
- **Transparenz & Tiefe**: Semi-transparent Hintergründe mit Glasoberflächen-Effekt
- **Subtile Glare-Linien**: Obere Border-Verlauf erzeugt Lichteinfalls-Simulation

```css
.pantry-main-container {
  background: transparent;
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 1px 1px rgba(255, 255, 255, 0.2);
}
```

#### **Farb-Palette (Kategorien)**
| Kategorie | Farbe | Hex-Code | Nutzung |
|-----------|-------|----------|---------|
| Gemüse | Grün | `#06d660` | Frische, Natürlichkeit |
| Obst | Lila | `#9D4EDD` | Eleganz, Premium |
| Fleisch | Rot | `#FF6B6B` | Energie, Warnung |
| Milchprodukte | Gold | `#FFD93D` | Wärme, Vielseitigkeit |
| Sonstiges | Cyan | `#4ECDC4` | Frische, Modern |

#### **Animationen & Übergänge**
- Cubic-Bezier Easing: `cubic-bezier(0.4, 0, 0.2, 1)` für flüssige, professionelle Bewegungen
- Pulse-Animationen bei abgelaufenen Produkten für visuelle Warnung
- Smooth Transitions auf allen Interaktiven Elementen (0.35s Standard)
- Transform-Effekte: `translateY(-1px)` bei Hover für subtile Tiefenwirkung

---

## 🏗️ Systemarchitektur

### Komponenten-Struktur

```
src/
├── components/
│   ├── HomeView.vue                 # Haupt-Dashboard mit Statistiken
│   ├── PantryInterfaceModal.vue     # Kern-Komponente für Produktverwaltung
│   ├── HelloWorld.vue               # Demo-Komponente
│   ├── TheWelcome.vue               # Willkommens-Screen
│   ├── WelcomeItem.vue              # Willkommens-Item-Komponente
│   └── __tests__/                   # Test-Suite (10 umfassende Tests)
├── composables/
│   ├── useAuth.ts                   # Authentifizierung & Session-Verwaltung
│   ├── useProducts.ts               # Produkt-CRUD-Operationen
│   └── useStatistics.ts             # Statistik-Berechnungen & Tracking
├── services/
│   ├── authService.ts               # Backend-Auth (Token, Login)
│   ├── axiosInterceptors.ts         # HTTP-Middleware
│   ├── productService.ts            # REST-API für Produkte
│   └── statisticsService.ts         # API für Statistiken
├── router/
│   └── index.ts                     # Vue Router Konfiguration
├── utils/
│   └── authUtils.ts                 # Auth-Hilfsfunktionen
└── types.ts                         # TypeScript Definitionen
```

### Datenfluss

```
HomeView (Parent)
    ↓
PantryInterfaceModal (Produktverwaltung)
    ├─→ useProducts() [Composable]
    │   ├─→ productService.ts [API-Calls]
    │   └─→ localStorage [Bild-Speicherung]
    └─→ Props: products[] | Emits: update:products
```

---

## 🔧 Kernfunktionalitäten

### 1. **Produktverwaltung (PantryInterfaceModal.vue)**

#### A. Produktliste & Filterung

**Toolbar-Features:**
- **Suchleiste**: Real-time Filter nach Produktnamen (case-insensitive)
- **Kategorien-Tabs**: Dynamische Filter nach 5 Kategorien
- **Sortierungs-Dropdown**: 4 Sortier-Optionen (Neu hinzugefügt, Ablaufdatum, Kategorie, Name)
- **Add-Button**: Modal-Dialog zum Hinzufügen neuer Produkte

**Berechtigte Zustände:**
```typescript
- activeProducts: Produkte, die noch nicht abgelaufen sind (status !== 'saved')
- expiredProducts: Produkte mit Ablaufdatum < Heute (mit Pulse-Animation)
```

#### B. Produkt-Hinzufügen Modal

Das Modal wurde professionell modularisiert in drei Sektionen:

**1. Kalender-Sektion (Links)**
- Interaktive Monats-Navigation (Prev/Next)
- Dynamische Datums-Berechnung mit Lokalisierung
- Heute-Hervorhebung
- Auswahl von Ablaufdaten mit einfachem Klick

**2. Form-Sektion (Mitte)**
```typescript
Form-Felder:
- Produktname (required)
- Kategorie-Selector mit Farbpunkten (required)
- Ablaufdatum (required, aus Kalender)
- Menge (optional, Standard: 1)
- Buttons: Abbrechen | Hinzufügen
```

**3. Bild-Sektion (Rechts)**
- **Kamera-Integration**: `navigator.mediaDevices.getUserMedia()`
- **Datei-Upload**: Standard HTML File Input
- **Inline-Vorschau**: Base64-encoded Bilder
- **LocalStorage-Persistierung**: Produktbilder werden lokal gespeichert (IndexedDB-Alternative)

#### C. Produktkarten-Design

```
┌─────────────────────────────────┐
│ Produktbild oder Farbtextur     │
│ ┌─────────────────────────────┐ │
│ │ Product Name  │ TT.MM.YYYY │ │ ← Overlay-Header
│ └─────────────────────────────┘ │
│                                 │
│ Kategorie-Farb-Border + Glow    │
└─────────────────────────────────┘
  ┌──────────┬──────────┬────────┐
  │ ✕ Delete │ VERZEHRT │ Status │
  └──────────┴──────────┴────────┘
```

**Farb-Kodierung:**
- **Kategorie-Border**: Farbcodiert nach Produktkategorie
- **Box-Shadow mit Glow**: `0 0 16px ${categoryColor}40` für subtiles Kategorie-Highlighting
- **Abgelaufene Produkte**: Rote Border mit Pulse-Animation

---

### 2. **Statistik-Dashboard (HomeView.vue)**

#### Widgets-Architektur

```typescript
Layout-Grid: 3-Spalten-System mit responsiven Breakpoints
├─ Kategorien-Widget (3x3)
├─ Gesamt-Produkte Widget (6x3, prominent)
├─ Verbrauchts-Widget
├─ Ablauf-Informationen
└─ Meldungen-Sektion (Dropdown)
```

#### Widget-Features

**1. Kategorien-Widget**
- 4x Mini-Cards für jede Kategorie
- Dynamische Farbzuweisung basierend auf Bestandszahl
- Aktivierungsschwelle: `getCategoryCount(category) > 0`

**2. Gesamt-Produkte Widget** (Primary Widget)
- Großer numerischer Display (`big-number`)
- Farbiger Progress-Bar mit Kategorie-Segmenten
- Visualisierung der Verteilung

**3. Verbrauchts-Statistik** (Rescue-Status)
- Anzahl der als "verzehrt" markierten Produkte
- Visuelles Feedback für Benutzer-Engagement

**4. Ablauf-Informationen**
- `bald ablaufen`: Produkte mit 0-3 Tage bis Ablauf
- `abgelaufen`: Produkte mit Ablaufdatum < Heute
- **Wichtig**: Verhältnis wird dynamisch neu berechnet

---

### 3. **Authentifizierung & Session-Management**

**useAuth.ts Composable:**
```typescript
- Benutzer-Email tracking
- Token-basierte Session
- Logout-Funktionalität
- Auto-Refresh bei Expiry (Backend-Implementierung)
```

**authService.ts:**
- JWT-Token Speicherung
- Login/Logout Endpoints
- User ID Extraction aus JWT

---

## 📱 Responsive & Adaptive Design

### Breakpoints
```css
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
Ultra-Wide: > 1400px
```

### Container-Queries für Dynamische Anpassung
```typescript
max-width: 1400px  // PantryInterfaceModal
Padding: 3rem (desktop), 1.5rem (tablet)
Grid-Gap: Dynamische Anpassung basierend auf Viewport
```

---

## 🔐 Datenspeicherung & Persistierung

### Backend-Integration
```typescript
API-Endpoints:
POST   /api/products             → Produkt erstellen
GET    /api/products             → Produkte abrufen
PUT    /api/products/:id         → Produkt aktualisieren
DELETE /api/products/:id         → Produkt löschen
GET    /api/statistics           → Statistiken abrufen
```

### LocalStorage-Schema

```typescript
// productImages - Base64-kodierte Bilder
localStorage.productImages = {
  "1": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
  "2": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
}
```

### Datenbindung
```typescript
// Vue 3 Reactive Props
interface Props {
  products: Product[]
}

// Event-Emittierung
emits: {
  'update:products': (products: Product[]) => true
}
```

---

## 🧪 Testing & Qualitätssicherung

### Test-Suite: 10 Automatisierte Tests

#### HomeView Tests (Tests 1-5)
| Test # | Name | Szenario | Verifikation |
|--------|------|----------|--------------|
| 1 | Header Rendering | Logo & Logout-Button | Existence & Content |
| 2 | Logout Button | Callback beim Klick | Emit Validation |
| 3 | E-Mail Display | Profil-Sektion | Text Content Match |
| 4 | Grußformel | Personalisierung | Username in Text |
| 5 | My-Pantry Section | Section Rendering | ID & Heading Check |

#### PantryInterfaceModal Tests (Tests 6-10)
| Test # | Name | Szenario | Verifikation |
|--------|------|----------|--------------|
| 6 | Toolbar Rendering | Suche, Kategorien, Add-Button | Element Existence |
| 7 | Produkt-Anzeige | Mehrere Produkte | Section & Cards |
| 8 | Empty State | Keine Produkte | Empty Message |
| 9 | Such-Filter | Text-Input Filtering | Query Processing |
| 10 | Props Update | Neue Produkte | Props Validation |

### Test-Setup
```typescript
Framework: Vitest
DOM-Testing: @vue/test-utils mount()
Mocking: vi.mock() für Composables
Selektoren: Stabile Klassen (.category-btn, .product-item)
```

---

## 🚀 Performance-Optimierungen

### CSS-Optimierungen
```css
will-change: transform       /* GPU-Beschleunigung */
-webkit-font-smoothing: antialiased
-moz-osx-font-smoothing: grayscale
contain: none                /* Layout-Isolation */
```

### Vue 3 Optimierungen
```typescript
- Reactive computed properties für Filterung
- Efficient array methods (filter, map, sort)
- NextTick für DOM-Updates nach Modal-Öffnung
- Conditional rendering mit v-if statt v-show
```

### Image-Handling
```typescript
- Base64-Encoding statt separate HTTP-Requests
- Canvas-Kompression bei Kamera (0.9 JPEG Quality)
- LocalStorage für Client-seitige Persistierung
```

---

## 📊 Datentypen & Interfaces

### Product Interface
```typescript
export interface Product {
  id?: number                          // Backend ID
  userId?: number                      // Benutzer-Zuordnung
  name: string                         // Produktname
  category: string                     // Kategorie (Gemüse, Obst, etc.)
  expiryDate: string                   // ISO-Format: YYYY-MM-DD
  addedDate?: string                   // Hinzufügungs-Datum
  quantity: number                     // Menge
  unit: string                         // Einheit (kg, l, Stück)
  status?: 'fresh'|'expiring_soon'|'expired'|'saved'
  notes?: string                       // Notizen
  imageBase64?: string                 // Base64 Bild-Daten
  createdAt?: string                   // Backend-Zeitstempel
  updatedAt?: string                   // Backend-Update-Zeitstempel
}
```

### Statistics Interface
```typescript
export interface Statistics {
  userId: number
  totalProducts: number                // ∑ aller Produkte
  savedProducts: number                // Status === 'saved'
  expiredProducts: number              // expiryDate < today
  capacity: number                     // Max. Kapazität
  capacityPercentage: number           // Auslastung in %
  lastUpdated: string                  // Letzter Update-Zeitstempel
}
```

---

## 🎯 Spezielle Features

### 1. Kalender-Integration
```typescript
- Dynamische Monats-Navigation
- 42-Tage-Gitter-Layout (6 Wochen)
- Vorherige/Nächste Monats-Tage gekennzeichnet
- Heute-Hervorhebung mit spezieller Klasse
```

### 2. Kamera-Support
```typescript
getUserMedia() API Integration
- facingMode: 'environment' (Rückkamera auf Mobilgeräten)
- Canvas-basierte Fotoverarbeitung
- Retry-Mechanismus für Benutzer-Freundlichkeit
```

### 3. Bild-Verarbeitung
```typescript
- FileReader API für Upload
- Base64-Encoding für Speicherung
- LocalStorage-Persistierung
- Lazy-Loading mit Conditional-Rendering
```

### 4. Smart-Filterung
```typescript
1. Kategorie-Filter
2. Text-Such-Filter (Name-basiert)
3. Status-Filter (aktiv/abgelaufen)
4. Automatische Sortierung nach Ablaufdatum
```

---

## 💻 Technische Best Practices

### Code-Qualität
✅ **TypeScript**: Vollständige Type-Safety  
✅ **Composition API**: Moderne Vue 3 Pattern  
✅ **Single-Responsibility**: Jede Komponente hat eine Aufgabe  
✅ **Props-Validation**: Streng typisierte Prop-Schemas  
✅ **Error-Handling**: Try-Catch für API-Calls  

### Sicherheit
✅ **XSS-Prävention**: Vue 3 Auto-Escaping  
✅ **CORS-Handling**: axiosInterceptors konfiguriert  
✅ **Token-Management**: JWT in localStorage  
✅ **Input-Validierung**: Form-Validation vor Submit  

### Accessibility
✅ **Semantisches HTML**: Proper label tags  
✅ **ARIA-Attribute**: title und role-Attribute  
✅ **Keyboard-Navigation**: Tab-Order korrekt  
✅ **Farb-Kontraste**: WCAG-konform (mind. 4.5:1)  

---

## 🔄 Aktualisierung & Wartung

### State-Management-Flow
```
User-Aktion (z.B. Produkt hinzufügen)
    ↓
Method in Komponente (z.B. addProduct())
    ↓
Composable-Function (useProducts.addProduct())
    ↓
Backend API Call (axios POST)
    ↓
Response Processing
    ↓
emit('update:products', newList)
    ↓
Parent Update & Re-render
```

### Cache-Invalidation
```typescript
- Nach API-Response: Komponenten-Props aktualisieren
- Nach lokalen Änderungen: LocalStorage sofort updaten
- Nach Logout: Alle Client-Side Data löschen
```

---

## 🎓 Entwickler-Hinweise

### Debugging-Tipps
```typescript
// Vue DevTools für Komponenten-Inspection
console.log(props.products)  // Props überprüfen
console.log(computed.activeProducts)  // Berechnete Werte
```

### Häufige Szenarien

**Produkt hinzufügen:**
1. Modal öffnen → `openAddProductModal()`
2. Form ausfüllen → `newProduct` ref aktualisieren
3. Bild hochladen (optional) → FileReader oder Camera
4. Absenden → `addProduct()` → Backend → Props update

**Produkt löschen:**
1. ✕-Button klicken → `deleteProduct(id)`
2. Backend-Call → localStorage-Cleanup
3. Props emit → Parent re-render

---

## 📝 Zusammenfassung

PanTrix ist eine **professionelle, futuristische Web-Anwendung** für intelligente Lebensmittel-Verwaltung. Mit seinem innovativen Glasmorphismus-Design, robusten TypeScript-Architektur und umfassender Test-Coverage bietet es Benutzer ein intuitives und visuell ansprechendes Erlebnis.

Das Projekt demonstriert **Best Practices in moderner Frontend-Entwicklung** mit Vue 3, vollständiger Typ-Sicherheit und professioneller Komponenten-Architektur.

---

**Version**: 1.0  
**Letzte Aktualisierung**: Januar 2026  
**Entwickler**: Oldi Hoxha, Nikolaos Pazartziklis
