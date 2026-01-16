<template>
  <div class="home-page">
    <!-- Top Bar -->
    <header class="top-bar">
      <div class="logo-container">
        <div class="logo">
          <span class="logo-text">PanTrix</span>
        </div>
      </div>
      <nav class="nav-links">
        <!-- Profil Section da angemeldet -->
        <div class="profile-section">
          <div class="profile-icon">👤</div>
          <span class="profile-email">{{ currentUser }}</span>
          <button class="nav-button logout-btn" @click="logout">Abmelden</button>
        </div>
      </nav>
    </header>

    <!-- Main Content with Right Sidebar -->
    <div class="content-wrapper">
      <div class="scroll-container">
      <!-- Hero Section -->
      <section class="section hero-section">
        <h1>Willkommen, {{ userName }}! </h1>
        <p class="home-subtitle">Deine Lebensmittel verwalten</p>
        <p class="home-tagline">{{ currentDate }}</p>
      </section>

      <!-- MyPantry - Modern Pantry Interface -->
      <section class="section my-pantry-section">
        <div class="section-content">
          <h2>Meine Vorratskammer</h2>
          <PantryInterfaceModal :products="products" @update:products="onProductsUpdate" />
        </div>
      </section>

      <!-- Quick Stats with Progress Rings -->
      <section class="section quick-stats-section">
        <div class="section-content">
          <h2>Statistiken</h2>

          <!-- Stats Widgets Grid -->
          <div class="stats-widgets-grid">
            <!-- Row 1 -->
            <!-- Categories Widget (Left) -->
            <div class="stat-widget widget-categories">
              <h3>Kategorien</h3>
              <div class="categories-list">
                <div
                  v-for="category in ['Gemüse', 'Obst', 'Milchprodukte', 'Fleisch']"
                  :key="category"
                  class="category-item"
                  :class="{ 'has-products': getCategoryCount(category) > 0 }"
                  :style="{
                    borderColor: getCategoryCount(category) > 0 ? getCategoryColor(category) : 'rgba(255, 255, 255, 0.1)',
                    backgroundColor: getCategoryCount(category) > 0 ? `${getCategoryColor(category)}20` : 'transparent',
                    boxShadow: getCategoryCount(category) > 0 ? `0 0 12px ${getCategoryColor(category)}40` : 'none'
                  }"
                >
                  <span class="cat-name">{{ category }}</span>
                  <span class="cat-count">{{ getCategoryCount(category) }}</span>
                </div>
              </div>
            </div>

            <!-- Total Products Widget (Large Center) -->
            <div class="stat-widget widget-large widget-total">
              <h3>Gesamte Produkte</h3>
              <div class="widget-main-content">
                <div class="big-number">{{ totalProducts }}</div>

                <!-- Farbiger Progress-Bar mit Kategorien -->
                <div class="progress-bar-container">
                  <div class="progress-bar">
                    <!-- Segment für jede Kategorie - nur anzeigen wenn Produkte existieren -->
                    <template v-if="totalProducts > 0">
                      <div
                        v-for="category in ['Gemüse', 'Obst', 'Fleisch', 'Milchprodukte', 'Sonstiges']"
                        :key="category"
                        class="progress-segment"
                        :style="{
                          width: ((getCategoryCount(category)) / totalProducts * 100) + '%',
                          backgroundColor: getCategoryColor(category),
                          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          opacity: getCategoryCount(category) > 0 ? 1 : 0
                        }"
                        :title="`${category}: ${getCategoryCount(category)}`"
                      />
                    </template>
                    <!-- Leerer Balken wenn keine Produkte -->
                    <div
                      v-if="totalProducts === 0"
                      class="progress-segment progress-empty"
                      style="width: 100%; background-color: rgba(255, 255, 255, 0.08);"
                    />
                  </div>
                </div>

                <p class="widget-subtitle">{{ Math.round(capacityPercentage) }}% Kapazität genutzt</p>
              </div>
            </div>

            <!-- Saved Products Widget (Right) -->
            <div class="stat-widget widget-saved">
              <h3>Gerettete Produkte</h3>
              <div class="widget-main-content">
                <div class="medium-number">{{ displayCount2 }}</div>
                <p class="widget-subtitle">vor Verschwendung bewahrt</p>
                <div class="progress-indicator" v-if="getProgressPercentage() > 0">↑ +{{ getProgressPercentage() }}% Ziel erreicht</div>
                <div class="progress-indicator" v-else>Starten Sie jetzt!</div>
              </div>
            </div>

            <!-- Expiring Soon Widget (Combined) -->
            <div class="stat-widget widget-small widget-expiring">
              <h3>Bald ablaufend</h3>
              <div class="widget-main-content">
                <div class="expiring-dual-display">
                  <!-- 7 Tage -->
                  <div class="expiring-time-group">
                    <div class="small-number">{{ getExpiringIn2Days() + getExpiringIn5Days() }}</div>
                    <p class="widget-subtitle">in den nächsten 7 Tagen</p>
                  </div>

                  <!-- Divider - nur anzeigen wenn beide Werte > 0 -->
                  <div v-if="(getExpiringIn2Days() + getExpiringIn5Days()) > 0 && getExpiringIn3Days() > 0" class="expiring-divider"></div>

                  <!-- 3 Tage -->
                  <div class="expiring-time-group">
                    <div class="small-number">{{ getExpiringIn3Days() }}</div>
                    <p class="widget-subtitle">in den nächsten 3 Tagen</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Row 2 -->
            <!-- Storage Widget (Left) - HINZUGEFÜGTE PRODUKTE -->
            <div class="stat-widget widget-storage">
              <h3>Hinzugefügte Produkte</h3>
              <div class="storage-chart-wrapper">
                <!-- Y-Axis Labels -->
                <div class="y-axis">
                  <span class="y-label">20</span>
                  <span class="y-label">15</span>
                  <span class="y-label">10</span>
                  <span class="y-label">5</span>
                  <span class="y-label">0</span>
                </div>

                <!-- Chart -->
                <div class="chart-container">
                  <div class="chart-grid"></div>

                  <!-- SVG Liniendiagramm -->
                  <svg class="line-chart" viewBox="0 0 360 180" preserveAspectRatio="xMidYMid meet">
                    <!-- Baseline (Y=0) als Referenzlinie -->
                    <line x1="0" y1="180" x2="360" y2="180" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="2,2" />

                    <!-- Linien für jede Kategorie -->
                    <polyline
                      v-for="category in chartCategories"
                      :key="'line-' + category"
                      :points="getChartPointsForCategory(category)"
                      :style="{ stroke: getCategoryColor(category) }"
                      class="chart-line"
                    />

                    <!-- Datenpunkte (Dots) für jede Kategorie -->
                    <g v-for="category in chartCategories" :key="'dots-' + category">
                      <circle
                        v-for="(day, dayIndex) in weekDays"
                        :key="'dot-' + category + '-' + day"
                        :cx="dayIndex * 50 + 25"
                        :cy="180 - ((weeklyStats[day]?.[category] || 0) * 9)"
                        r="3.5"
                        :fill="getCategoryColor(category)"
                        class="chart-dot"
                        :style="{ opacity: 0.85 }"
                      />
                      <!-- Optional: Wert-Labels für Debug -->
                      <text
                        v-for="(day, dayIndex) in weekDays"
                        :key="'label-' + category + '-' + day"
                        :x="dayIndex * 50 + 25"
                        :y="165 - ((weeklyStats[day]?.[category] || 0) * 9)"
                        font-size="8"
                        fill="rgba(255,255,255,0.4)"
                        text-anchor="middle"
                        :style="{ pointerEvents: 'none' }"
                      >
                        {{ weeklyStats[day]?.[category] || 0 }}
                      </text>
                    </g>
                  </svg>
                </div>

                <!-- X-Axis Labels -->
                <div class="x-axis">
                  <span v-for="day in weekDays" :key="day" class="x-label">{{ day }}</span>
                </div>
              </div>

              <!-- Legende -->
              <div class="chart-legend-storage">
                <div v-for="category in chartCategories" :key="category" class="legend-item-small">
                  <span class="legend-dot-small" :style="{ backgroundColor: getCategoryColor(category) }"></span>
                  <span class="legend-label-small">{{ category }}</span>
                </div>
              </div>
            </div>

            <!-- Product Status Widget (Large Right) -->
            <div class="stat-widget widget-large widget-product-status">
              <h3>Produktzustand</h3>
              <div class="pie-chart-container">
                <div class="pie-chart-wrapper">
                  <svg class="pie-chart" viewBox="0 0 100 100">
                    <!-- Show segment only if products exist in that category -->
                    <circle
                      v-if="availableProducts > 0"
                      class="pie-segment available"
                      cx="50"
                      cy="50"
                      r="40"
                      :style="{ strokeDasharray: totalProducts > 0 ? `${(availableProducts / totalProducts) * 251.2} 251.2` : '0 251.2' }"
                    />
                    <circle
                      v-if="expiredProducts > 0"
                      class="pie-segment expired"
                      cx="50"
                      cy="50"
                      r="40"
                      :style="{ strokeDasharray: totalProducts > 0 ? `${(expiredProducts / totalProducts) * 251.2} 251.2` : '0 251.2', strokeDashoffset: availableProducts > 0 ? `-${(availableProducts / totalProducts) * 251.2}` : '0' }"
                    />
                    <!-- Transparent circle when no products -->
                    <circle
                      v-if="totalProducts === 0"
                      class="pie-segment-empty"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                  </svg>
                  <div class="pie-center">
                    <div class="pie-center-value">{{ totalProducts }}</div>
                    <div class="pie-center-label">Gesamt</div>
                  </div>
                </div>
                <div class="pie-legend">
                  <div v-if="availableProducts > 0" class="legend-item available">
                    <span class="legend-dot"></span>
                    <div class="legend-info">
                      <div class="legend-name">Verfügbar</div>
                      <div class="legend-count">{{ availableProducts }}</div>
                    </div>
                  </div>
                  <div v-if="expiredProducts > 0" class="legend-item expired">
                    <span class="legend-dot"></span>
                    <div class="legend-info">
                      <div class="legend-name">Abgelaufen</div>
                      <div class="legend-count">{{ expiredProducts }}</div>
                    </div>
                  </div>
                  <div v-if="totalProducts === 0" class="legend-item-empty">
                    <span class="legend-label-empty">Keine Produkte eingetragen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Alerts & Messages -->
      <section class="section alerts-section">
        <div class="section-content">
          <h2>Aktuelle Meldungen</h2>
          <div class="alerts-container">
            <div v-if="alerts.length === 0" class="no-alerts">
              <span class="no-alerts-icon">✅</span>
              <p>Keine Meldungen - alles im grünen Bereich!</p>
            </div>
            <div v-else v-for="alert in alerts" :key="alert.id" class="alert-card" :class="alert.type">
              <span class="alert-icon">{{ alert.icon }}</span>
              <div class="alert-content">
                <p class="alert-title">{{ alert.title }}</p>
                <p class="alert-message">{{ alert.message }}</p>
                <p class="alert-date">{{ alert.date }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Other Actions -->

      <!-- Footer Button Bar -->
      <footer class="footer-bar">
        <div class="footer-bar-content">
          <button class="footer-btn">PanTrix</button>
          <button class="footer-btn">Dein intelligenter Lebensmittel-Tracker</button>
          <button class="footer-btn copyright">&copy; 2025 PanTrix. Alle Rechte vorbehalten.</button>
        </div>
      </footer>
    </div>

    <!-- Right Sidebar -->
    <aside class="right-sidebar">
      <!-- Quick Actions Card -->
      <div class="sidebar-card quick-actions-card">
        <h3>Schnellaktionen</h3>
        <div class="actions-list">
          <button class="action-btn" @click="scrollToSection('my-pantry-section')" title="Zur Vorratskammer">
            <span class="action-icon">📦</span>
            <span class="action-text">Vorratskammer</span>
          </button>
          <button class="action-btn" @click="scrollToSection('quick-stats-section')" title="Zu Statistiken">
            <span class="action-icon">📊</span>
            <span class="action-text">Statistiken</span>
          </button>
          <button class="action-btn" @click="scrollToSection('alerts-section')" title="Zu Meldungen">
            <span class="action-icon">📢</span>
            <span class="action-text">Meldungen</span>
          </button>
        </div>
      </div>

      <!-- Quick Summary Card -->
      <div class="sidebar-card summary-card">
        <h3>Kurzübersicht</h3>
        <div class="summary-items">
          <div class="summary-item">
            <span class="summary-icon">📦</span>
            <div class="summary-content">
              <p class="summary-label">Aktive Produkte</p>
              <p class="summary-value">{{ displayCount1 }}</p>
            </div>
          </div>
          <div class="summary-item">
            <span class="summary-icon">✅</span>
            <div class="summary-content">
              <p class="summary-label">Gerettete Produkte</p>
              <p class="summary-value">{{ displayCount2 }}</p>
            </div>
          </div>
          <div class="summary-item">
            <span class="summary-icon">⏰</span>
            <div class="summary-content">
              <p class="summary-label">Bald ablaufend</p>
              <p class="summary-value">{{ displayCount3 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories Mini Widget -->
      <div class="sidebar-card categories-card">
        <h3>Kategorien</h3>
        <div class="categories-mini-list">
          <div v-for="category in ['Obst', 'Gemüse', 'Fleisch', 'Milchprodukte', 'Sonstiges']" :key="category" class="category-mini">
            <span class="category-mini-dot" :style="{ backgroundColor: getCategoryColor(category) }"></span>
            <span class="category-mini-name">{{ category }}</span>
            <span class="category-mini-count">{{ getCategoryCount(category) }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Alerts Card -->
      <div class="sidebar-card alerts-mini-card">
        <h3>Letzte Meldungen</h3>
        <div v-if="alerts.length === 0" class="no-alerts-mini">
          <p>✅ Alles in Ordnung!</p>
        </div>
        <div v-else class="alerts-mini-list">
          <div v-for="alert in alerts.slice(0, 3)" :key="alert.id" class="alert-mini" :class="alert.type">
            <span class="alert-mini-icon">{{ alert.icon }}</span>
            <div class="alert-mini-content">
              <p class="alert-mini-title">{{ alert.title }}</p>
              <p class="alert-mini-date">{{ alert.date }}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import PantryInterfaceModal from './PantryInterfaceModal.vue'
import { useProducts } from '../composables/useProducts'
import { useStatistics } from '../composables/useStatistics'
import type { Product } from '../types'

interface Props {
  currentUser: string
  onLogout: () => void
}

interface Alert {
  id: number
  type: 'warning' | 'info' | 'success'
  icon: string
  title: string
  message: string
  date: string
}

const props = defineProps<Props>()


// Nutze Products und Statistics Composables
const { loadProducts, products: backendProducts, errorMessage: productError } = useProducts()
const { loadStatistics, errorMessage: statsError } = useStatistics()

// Products from Pantry
const products = ref<Product[]>([])

// ============== BERECHNUNGSFUNKTIONEN (unabhängig von UI) ==============

/**
 * Gibt das Ablaufdatum als Date-Objekt zurück
 * Erwartet Format: "YYYY-MM-DD"
 */
const parseExpiryDate = (dateString: string): Date => {
  const parts = dateString.split('-')
  if (parts.length !== 3) return new Date()
  const [year, month, day] = parts
  // Verwende lokale Zeit, nicht UTC
  return new Date(parseInt(year || '0'), parseInt(month || '1') - 1, parseInt(day || '1'))
}

/**
 * Gibt die Wochennummer aus einem Datum zurück (0 = Montag, 6 = Sonntag)
 */
const getDayOfWeek = (date: Date): number => {
  let day = date.getDay() - 1
  if (day === -1) day = 6
  return day
}

/**
 * Konvertiert heutiges Datum zu YYYY-MM-DD String (lokale Zeit, nicht UTC)
 */
const getTodayStringHelper = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Zählt aktive Produkte nach Kategorie
 */
const getProductsByCategory = (category: string): number => {
  return products.value.filter(p => p.category === category && (p.status === 'fresh' || !p.status)).length
}

/**
 * Zählt alle aktiven Produkte
 */
const getActiveProductsCount = (): number => {
  return products.value.filter(p => (p.status === 'fresh' || p.status === undefined || !p.status)).length
}

/**
 * Zählt ALLE Produkte (egal welcher Status)
 */
const getTotalProductsCount = (): number => {
  return products.value.length
}

/**
 * Zählt Produkte mit status = "verbraucht", deren Ablaufdatum noch nicht überschritten war
 */
const getSavedProductsCount = (): number => {
  const today = new Date()
  return products.value.filter(p => {
    if (!p || !p.status || p.status !== 'saved') return false
    const expiryDate = parseExpiryDate(p.expiryDate)
    return expiryDate >= today
  }).length
}

/**
 * Berechnet den Progress-Prozentsatz für das Ziel der geretteten Produkte
 * Ziel: 20 Produkte vor Verschwendung bewahrt
 */
const getProgressPercentage = (): number => {
  const goal = 20
  const saved = getSavedProductsCount()
  return Math.min(Math.round((saved / goal) * 100), 100)
}
/**
 * Zählt aktive Produkte, deren Ablaufdatum in den nächsten 7 Tagen liegt
 */
const getExpiringProductsCount = (): number => {
  const today = new Date()
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  return products.value.filter(p => {
    const status = p?.status || 'fresh'
    if (status !== 'fresh' && status !== undefined && status !== 'expiring_soon') return false
    const expiryDate = parseExpiryDate(p.expiryDate)
    return expiryDate >= today && expiryDate <= in7Days
  }).length
}

/**
 * Zählt Produkte die in den nächsten 2 Tagen ablaufen (KRITISCH)
 */
const getExpiringIn2Days = (): number => {
  const today = new Date()
  const in2Days = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)

  return products.value.filter(p => {
    if (p.status !== 'fresh' && p.status !== undefined && p.status !== 'expiring_soon') return false
    const expiryDate = parseExpiryDate(p.expiryDate)
    return expiryDate >= today && expiryDate <= in2Days
  }).length
}

/**
 * Zählt Produkte die in den nächsten 3 Tagen ablaufen
 */
const getExpiringIn3Days = (): number => {
  const today = new Date()
  const in3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)

  return products.value.filter(p => {
    if (p.status !== 'fresh' && p.status !== undefined && p.status !== 'expiring_soon') return false
    const expiryDate = parseExpiryDate(p.expiryDate)
    return expiryDate >= today && expiryDate <= in3Days
  }).length
}

/**
 * Zählt Produkte die in 3-7 Tagen ablaufen (WARNUNG)
 */
const getExpiringIn5Days = (): number => {
  const today = new Date()
  const in3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  return products.value.filter(p => {
    if (p.status !== 'fresh' && p.status !== undefined && p.status !== 'expiring_soon') return false
    const expiryDate = parseExpiryDate(p.expiryDate)
    return expiryDate > in3Days && expiryDate <= in7Days
  }).length
}

/**
 * Zählt abgelaufene Produkte (aktive Produkte, deren Ablaufdatum überschritten ist)
 */
const getExpiredProductsCount = (): number => {
  const today = new Date()
  return products.value.filter(p => {
    if (p.status === 'saved' || p.status === 'expired') return false
    const expiryDate = parseExpiryDate(p.expiryDate)
    return expiryDate < today
  }).length
}

/**
 * Zählt verfügbare (noch nicht abgelaufene) Produkte
 */
const getAvailableProductsCount = (): number => {
  const today = new Date()
  return products.value.filter(p => {
    const expiryDate = parseExpiryDate(p.expiryDate)
    return expiryDate >= today
  }).length
}

/**
 * Gruppiert Produkte nach Wochentag UND Kategorie (basierend auf addedAt)
 * Gibt nested Record zurück: { 'Mo': { 'Obst': 5, 'Gemüse': 3, ... }, ... }
 */
const getProductsByWeekdayAndCategory = (): Record<string, Record<string, number>> => {
  const weekdays: string[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const categories: string[] = ['Obst', 'Gemüse', 'Fleisch', 'Milchprodukte', 'Sonstiges']

  // Initialisiere nested structure
  const stats: Record<string, Record<string, number>> = {}
  weekdays.forEach(day => {
    stats[day] = {}
    categories.forEach(cat => {
      const dayRecord = stats[day]
      if (dayRecord) {
        dayRecord[cat] = 0
      }
    })
  })

  // Zähle Produkte nach Wochentag und Kategorie
  products.value.forEach(p => {
    // DEBUG: Zeige Produktdaten in der Konsole
    if (p.name) {
      console.log(`Produkt: ${p.name}, Kategorie: ${p.category}, addedDate: ${p.addedDate}, Status: ${p.status}`)
    }

    if (!p.addedDate || !p.category) return
    const date = parseExpiryDate(p.addedDate)
    const dayIndex = getDayOfWeek(date)

    if (dayIndex >= 0 && dayIndex < weekdays.length) {
      const day = weekdays[dayIndex]
      if (day && stats[day] && p.category in stats[day]) {
        const dayStats = stats[day]
        if (dayStats) {
          dayStats[p.category] = (dayStats[p.category] ?? 0) + 1
        }
      }
    }
  })

  return stats
}

/**
 * Berechnet die maximale Kapazität (hier: 32 Produkte)
 */
const MAX_CAPACITY = 32

/**
 * Berechnet die Kapazitätsauslastung in Prozent
 */
const getCapacityPercentage = (): number => {
  const activeCount = getActiveProductsCount()
  return (activeCount / MAX_CAPACITY) * 100
}

// ============== COMPUTED PROPERTIES (basierend auf Berechnungsfunktionen) ==============

// Live Counter Animation
const displayCount1: Ref<number> = ref(0)
const displayCount2: Ref<number> = ref(0)
const displayCount3: Ref<number> = ref(0)
const displayCount4: Ref<number> = ref(0)

/**
 * Kategorie-Statistiken (nur aktive Produkte)
 */
const categoryStats = computed(() => {
  return {
    'Obst': getProductsByCategory('Obst'),
    'Gemüse': getProductsByCategory('Gemüse'),
    'Fleisch': getProductsByCategory('Fleisch'),
    'Milchprodukte': getProductsByCategory('Milchprodukte'),
    'Sonstiges': getProductsByCategory('Sonstiges')
  }
})

/**
 * Gesamtzahl aktiver Produkte
 */
const totalProducts = computed(() => getTotalProductsCount())

/**
 * Anzahl verfügbarer (nicht abgelaufener) Produkte
 */
const availableProducts = computed(() => getAvailableProductsCount())

/**
 * Anzahl abgelaufener Produkte
 */
const expiredProducts = computed(() => getExpiredProductsCount())


/**
 * Kapazitätsauslastung in Prozent
 */
const capacityPercentage = computed(() => getCapacityPercentage())

/**
 * Produkte pro Wochentag UND Kategorie für das Diagramm
 */
const weeklyStats = computed(() => getProductsByWeekdayAndCategory())

// Dynamische Alerts - generiert aus Produkten der Vorratskammer
const alerts = ref<Alert[]>([])

const userName = computed(() => {
  // Safeguard: props.currentUser könnte leer sein
  const email = props.currentUser ?? ''
  const parts = email.split('@')
  return parts[0] || email || 'Benutzer'
})

const currentDate = computed(() => {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return now.toLocaleDateString('de-DE', options)
})

// Category Colors
const categoryColors: Record<string, string> = {
  'Gemüse': '#06D6A0',      // Grün
  'Obst': '#9D4EDD',         // Lila
  'Fleisch': '#FF6B6B',      // Rot
  'Milchprodukte': '#FFD93D', // Gelb
  'Sonstiges': '#4ECDC4'     // Cyan
}

const getCategoryColor = (category: string): string => {
  return categoryColors[category] || 'rgba(255, 255, 255, 0.5)'
}

/**
 * Sichere Funktion, um Produktanzahl einer Kategorie zu holen
 */
const getCategoryCount = (category: string): number => {
  const validCategories: Record<string, string> = {
    'Obst': 'Obst',
    'Gemüse': 'Gemüse',
    'Fleisch': 'Fleisch',
    'Milchprodukte': 'Milchprodukte',
    'Sonstiges': 'Sonstiges'
  }

  if (category in validCategories) {
    return categoryStats.value[category as keyof typeof categoryStats.value] || 0
  }
  return 0
}

// Weekly stats for chart
const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

/**
 * Alle verfügbaren Kategorien (nicht nur die, die in Produkten vorkommen)
 */
const chartCategories = computed(() => {
  return ['Obst', 'Gemüse', 'Fleisch', 'Milchprodukte', 'Sonstiges']
})

/**
 * Hilfsfunktion für das SVG-Liniendiagramm - berechnet Punkte für eine Kategorie
 * Y-Achse: 0 bis 20 (in 5er-Schritten)
 */
const getChartPointsForCategory = (category: string): string => {
  const points: string[] = []
  const stats = weeklyStats.value

  weekDays.forEach((day, index) => {
    const dayStats = stats[day]
    const value = (dayStats && dayStats[category]) || 0
    const x = index * 50 + 25
    // Y-Achse: 0-20, 180px height, also 9px pro Einheit
    const y = 180 - (value * 9)
    points.push(`${x},${y}`)
  })

  const pointsString = points.join(' ')
  console.log(`Chart Points für ${category}:`, pointsString)
  return pointsString
}

const logout = () => {
  props.onLogout()
}

// Scroll zu einer bestimmten Section
const scrollToSection = (sectionClass: string) => {
  const scrollContainer = document.querySelector('.scroll-container') as HTMLElement
  const section = document.querySelector(`.${sectionClass}`) as HTMLElement

  if (scrollContainer && section) {
    const sectionTop = section.offsetTop
    scrollContainer.scrollTo({
      top: sectionTop - 50,
      behavior: 'smooth'
    })
  }
}

// Handle products update from PantryInterfaceModal
const onProductsUpdate = (updatedProducts: Product[]) => {
  products.value = updatedProducts
}

// Animate Counter Numbers on Mount
const animateCounter = (targetValue: number, displayRef: Ref<number>, duration: number = 1500) => {
  const startTime = Date.now()

  const updateCount = () => {
    const elapsed = Date.now() - startTime
    // Correct clamp: max progress value should be 1 (100%)
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (ease-out)
    const easeProgress = 1 - Math.pow(1 - progress, 3)

    displayRef.value = Math.floor(targetValue * easeProgress)

    if (progress < 1) {
      requestAnimationFrame(updateCount)
    } else {
      displayRef.value = targetValue
    }
  }

  updateCount()
}

// Generiere Alerts basierend auf Produktablaufdaten
const generateAlertsFromProducts = () => {
  const generatedAlerts: Alert[] = []
  let alertId = 1

  // Hilfsfunktion zum Berechnen der Tage bis zum Ablaufdatum
  const getDaysUntilExpiry = (expiryDate: string): number => {
    const today = new Date()
    const todayString = today.getFullYear() + '-' +
                        String(today.getMonth() + 1).padStart(2, '0') + '-' +
                        String(today.getDate()).padStart(2, '0')
    const timeDiff = new Date(expiryDate).getTime() - new Date(todayString).getTime()
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  }

  // Hilfsfunktion zum Formatieren des Datums
  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-')
    return `${day}.${month}.${year}`
  }

  // Finde Produkte die in 2 Tagen oder weniger ablaufen (KRITISCH)
  const expiringIn2Days = products.value.filter(p => {
    const daysUntil = getDaysUntilExpiry(p.expiryDate)
    return daysUntil >= 0 && daysUntil <= 2 && p.status !== 'saved' && p.status !== 'expired'
  })

  if (expiringIn2Days.length > 0) {
    const firstProduct = expiringIn2Days[0]
    if (firstProduct) {
      generatedAlerts.push({
        id: alertId++,
        type: 'warning',
        icon: '⏰',
        title: `${firstProduct.name} läuft in ${getDaysUntilExpiry(firstProduct.expiryDate)} Tag(en) ab`,
        message: `Ablaufdatum: ${formatDate(firstProduct.expiryDate)} - bitte schnell verwenden!`,
        date: getDaysUntilExpiry(firstProduct.expiryDate) === 0 ? 'Heute' : 'In ' + getDaysUntilExpiry(firstProduct.expiryDate) + ' Tagen'
      })
    }
  }

  // Finde Produkte die in 3-7 Tagen ablaufen (INFO)
  const expiringIn3to7Days = products.value.filter(p => {
    const daysUntil = getDaysUntilExpiry(p.expiryDate)
    return daysUntil > 2 && daysUntil <= 7 && p.status !== 'saved' && p.status !== 'expired'
  })

  if (expiringIn3to7Days.length > 0) {
    generatedAlerts.push({
      id: alertId++,
      type: 'info',
      icon: '📌',
      title: `${expiringIn3to7Days.length} Produkt(e) laufen in 3-7 Tagen ab`,
      message: `Planen Sie den Verbrauch dieser Produkte`,
      date: 'In 3-7 Tagen'
    })
  }

  // Wenn keine Warnungen, zeige Success Message
  if (generatedAlerts.length === 0) {
    generatedAlerts.push({
      id: alertId++,
      type: 'success',
      icon: '✅',
      title: 'Alles im grünen Bereich!',
      message: 'Keine Produkte laufen bald ab',
      date: 'Heute'
    })
  }

  alerts.value = generatedAlerts
}


// Watcher für Produktänderungen um Counter zu aktualisieren
watch(products, () => {
  animateCounter(getActiveProductsCount(), displayCount1, 800)
  animateCounter(getSavedProductsCount(), displayCount2, 800)
  animateCounter(getExpiringProductsCount(), displayCount3, 800)
  animateCounter(getTotalProductsCount(), displayCount4, 800)
  generateAlertsFromProducts() // ← Generiere Alerts basierend auf aktuellen Produkten
}, { deep: true })

onMounted(async () => {
  // Lade Produkte vom Backend
  try {
    await loadProducts()
    products.value = backendProducts.value
  } catch (error) {
    console.error('Fehler beim Laden der Produkte:', productError.value || error)
  }

  // Lade Statistiken vom Backend
  try {
    await loadStatistics()
  } catch (error) {
    console.error('Fehler beim Laden der Statistiken:', statsError.value || error)
  }

  // Start counter animations with staggered delay
  // 1. Gesamte Produkte (aktive)
  setTimeout(() => animateCounter(getActiveProductsCount(), displayCount1), 300)
  // 2. Gerettete Produkte (status = verbraucht, nicht abgelaufen)
  setTimeout(() => animateCounter(getSavedProductsCount(), displayCount2), 500)
  // 3. Bald ablaufend (aktive, nächste 7 Tage)
  setTimeout(() => animateCounter(getExpiringProductsCount(), displayCount3), 700)
  // 4. Total aller Produkte (unabhängig von Status)
  setTimeout(() => animateCounter(getTotalProductsCount(), displayCount4), 900)

  // Erstelle animierte Lichtstrahlen und Glow-Effekte wie in TheWelcome
  createGradientEffects()

  // Generiere initiale Alerts basierend auf bestehenden Produkten
  generateAlertsFromProducts()
})

// Gradient-Effekte für HomeView.vue
const createGradientEffects = () => {
  const container = document.querySelector('.home-page') as HTMLElement
  if (!container) return

  // Erstelle Intersection Observer für Scroll-Reveal Animationen
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-hidden')
        entry.target.classList.add('reveal-visible')
        // Für Stat Widgets: Nur einmal animieren, dann Observer entfernen (festbleiben)
        if (entry.target.classList.contains('stat-widget')) {
          observer.unobserve(entry.target)
        }
      } else {
        // Andere Elemente (nicht Widgets) faden weg beim Hochscrollen
        if (!entry.target.classList.contains('stat-widget')) {
          entry.target.classList.remove('reveal-visible')
          entry.target.classList.add('reveal-hidden')
        }
      }
    })
  }, observerOptions)

  // Beobachte alle Sections
  const sections = document.querySelectorAll('.section')
  sections.forEach((section) => {
    section.classList.add('reveal-hidden')
    observer.observe(section)
  })

  // Beobachte alle Stat Widgets
  const widgets = document.querySelectorAll('.stat-widget')
  widgets.forEach((widget) => {
    widget.classList.add('reveal-hidden')
    observer.observe(widget)
  })

  // Beobachte alle Alert Cards
  const alerts = document.querySelectorAll('.alert-card')
  alerts.forEach((alert) => {
    alert.classList.add('reveal-hidden')
    observer.observe(alert)
  })


  // Erstelle 3 große radiale Gradients (Glow-Effekte) - statisch
  const gradientConfigs = [
    {
      name: 'bottom-left',
      startX: 0.2,
      startY: 0.8,
      offsetX: 0.15,
      offsetY: 0.15,
      colors: ['rgba(255,96,60,0.8)', 'rgba(255, 110, 60, 0.6)', 'rgba(255, 110, 60, 0.2)', 'transparent'],
      size: 700
    },
    {
      name: 'bottom-center',
      startX: 0.5,
      startY: 0.7,
      offsetX: 0.12,
      offsetY: 0.12,
      colors: ['rgba(255, 64, 64, 0.9)', 'rgba(255, 48, 48, 0.6)', 'rgba(255, 48, 48, 0.2)', 'transparent'],
      size: 750
    },
    {
      name: 'bottom-right',
      startX: 0.8,
      startY: 0.8,
      offsetX: 0.15,
      offsetY: 0.15,
      colors: ['rgba(220,80,143,0.8)', 'rgba(220, 80, 160, 0.6)', 'rgba(220, 80, 160, 0.2)', 'transparent'],
      size: 700
    }
  ]

  gradientConfigs.forEach((config) => {
    const glowField = document.createElement('div')

    const startX = window.innerWidth * config.startX
    const startY = window.innerHeight * config.startY

    // Erstelle Gradient-String
    const gradientStops = config.colors.map((color) => {
      const percent = (config.colors.indexOf(color) / (config.colors.length - 1)) * 100
      return `${color} ${percent}%`
    }).join(', ')

    glowField.style.cssText = `
      position: fixed;
      width: ${config.size}px;
      height: ${config.size}px;
      left: ${startX}px;
      top: ${startY}px;
      background: radial-gradient(circle, ${gradientStops});
      pointer-events: none;
      z-index: 1;
      filter: blur(60px);
      opacity: 0.95;
      margin-left: -${config.size / 2}px;
      margin-top: -${config.size / 2}px;
    `
    container.appendChild(glowField)
  })

}
</script>

<style scoped>
/* Home Page Styling */
.home-page {
  background: #000000;
  width: 100%;
  height: auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow-x: hidden;
  color: #ffffff;
}

/* Home Page Background Pseudo-Element für schwarzen Hintergrund */
.home-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(90deg, transparent 15%, rgba(255, 215, 0, 0.015) 50%, transparent 85%),
    linear-gradient(180deg, transparent 25%, rgba(255, 215, 0, 0.01) 50%, transparent 75%);
  pointer-events: none;
  z-index: 1;
}

/* Global CSS variable defaults to satisfy PostCSS resolver (prevents "Cannot resolve '--value'" errors) */
:root {
  --value: 0;
  --width: 50%;
  --percentage: 1;
  --color: #64C8FF;
  --progress: 0;
}

/* Content Wrapper - Main Content + Right Sidebar */
.content-wrapper {
  display: flex;
  flex: 1;
  gap: 0;
  padding: 2rem;
  position: relative;
  z-index: 2;
  height: calc(100vh - 100px);
  padding-top: calc(2rem + 80px);
  margin-top: 0;
  margin-right: 0;
  padding-right: 340px;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  background: transparent;
  min-height: 0;
}


/* Top Bar */
.top-bar {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.1);
  padding: 1.2rem 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
  width: 100%;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo:hover {
  transform: translateY(-2px);
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-button {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button:hover {
  color: #ffffff;
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.1);
}

/* Profile Section - Glass Morphism */
.profile-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.profile-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #ffffff;
}

.profile-icon:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
}

.profile-email {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  background: rgba(255, 100, 100, 0.1);
  border: 1px solid rgba(255, 100, 100, 0.3);
  color: rgba(255, 150, 150, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  letter-spacing: 0.3px;
}

.logout-btn:hover {
  background: rgba(255, 100, 100, 0.2);
  border-color: rgba(255, 100, 100, 0.5);
  color: #ff8888;
}

  /* Section Styles */

  .section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    position: relative;
    margin-top: 0;
  }

  .hero-section {
    background: transparent;
    padding: 3rem 2rem;
    text-align: center;
    position: relative;
    z-index: 2;
  }

  .hero-section::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    height: 80%;
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border: none;
    border-radius: 30px;
    z-index: -1;
    pointer-events: none;
  }

  .hero-section h1 {
    font-size: 4.5rem;
    color: #FF4040;
    font-weight: 900;
    letter-spacing: 2px;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
    text-shadow: 0 2px 10px rgba(255, 64, 64, 0.3);
  }

  .home-subtitle {
    font-size: 1.3rem;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
    position: relative;
    z-index: 1;
  }

  .home-tagline {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.6);
  }

  /* MyPantry Section - Main Feature */

  .my-pantry-section {
    background: transparent;
    padding: 4rem 2rem;
    width: 100%;
    display: flex;
    justify-content: center;
  }


  /* Quick Stats Section */

  .quick-stats-section {
    background: transparent;
    padding: 4rem 2rem;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .section-content {
    max-width: 1400px;
    width: 100%;
  }

  .section-content h2 {
    font-size: 2rem;
    font-weight: 900;
    color: #ffffff;
    text-align: center;
    margin-bottom: 2rem;
    letter-spacing: 1px;
  }

  /* Stats Widgets Grid - Modern Layout */

  .stats-widgets-grid {
    display: grid;
    grid-template-columns: 1fr 2fr 1.2fr 0.8fr;
    grid-template-rows: auto auto;
    gap: 2rem;
    margin-top: 2rem;
  }

  /* Base Widget Style */

  .stat-widget {
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    padding: 1.2rem;
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  }

  .stat-widget:hover {
    background: rgba(255, 255, 255, 0.10);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.25);
  }

  .stat-widget h3 {
    font-size: 0.8rem;
    color: #ffffff;
    font-weight: 800;
    margin-bottom: 0.8rem;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .stat-widget::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1.5px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    border-radius: 24px 24px 0 0;
  }

  .stat-widget::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.08), transparent);
    pointer-events: none;
    border-radius: 24px;
  }

  /* Categories Widget */

  .widget-categories {
    grid-column: 1;
    grid-row: 1;
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .categories-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0.8rem;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    font-size: 0.75rem;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }

  .category-item:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateX(2px);
  }

  /* Kategorie mit Produkten - aufleuchten */
  .category-item.has-products {
    border-width: 2px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .category-item.has-products:hover {
    transform: translateX(2px);
    border-width: 2px;
    background: rgba(255, 255, 255, 0.1);
  }

  .cat-name {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 600;
    transition: color 0.3s ease;
  }

  .category-item.has-products .cat-name {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 700;
  }

  .cat-count {
    color: rgba(255, 255, 255, 0.85);
    font-weight: 800;
    font-size: 0.9rem;
    min-width: 25px;
    text-align: right;
    transition: color 0.3s ease;
  }

  .category-item.has-products .cat-count {
    color: rgba(255, 255, 255, 1);
    font-weight: 900;
  }

  /* Total Products Widget - Large */

  .widget-large {
    grid-column: 2;
    grid-row: 1;
  }

  .widget-total {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .widget-total:hover {
    background: rgba(255, 255, 255, 0.10);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .widget-main-content {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .big-number {
    font-size: 2.4rem;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    line-height: 1;
  }

  .medium-number {
    font-size: 2rem;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .small-number {
    font-size: 1.6rem;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .progress-bar-container {
    width: 100%;
    margin: 0.5rem 0;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    gap: 0;
  }

  .progress-segment {
    height: 100%;
    min-width: 2px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .progress-segment:first-child {
    border-radius: 12px 0 0 12px;
  }

  .progress-segment:last-child {
    border-radius: 0 12px 12px 0;
  }

  .progress-segment.progress-empty {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .progress-fill {
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    transition: width 0.5s ease;
    border-radius: 8px;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
  }

  .widget-subtitle {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  .progress-indicator {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 800;
    text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  }

  /* Saved Products Widget */

  .widget-saved {
    grid-column: 3;
    grid-row: 1;
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .widget-saved:hover {
    background: rgba(255, 255, 255, 0.10);
    border-color: rgba(255, 255, 255, 0.25);
  }

  /* Expiring Widget - Small */

  .widget-small {
    grid-column: 4;
    grid-row: 1;
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .widget-small:hover {
    background: rgba(255, 255, 255, 0.10);
    border-color: rgba(255, 255, 255, 0.25);
  }

  /* Expiring Dual Display */
  .expiring-dual-display {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .expiring-time-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    width: 100%;
  }

  .expiring-divider {
    width: 60%;
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 1px;
  }

  /* Storage Widget */

  .widget-storage {
    grid-column: 1 / 3;
    grid-row: 2;
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.12);
  }


  .storage-chart-wrapper {
    display: flex;
    flex-direction: row;
    gap: 0.8rem;
    align-items: stretch;
  }

  .y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
    height: 180px;
    width: 40px;
    padding-right: 0.8rem;
    border-right: 1px solid rgba(255, 255, 255, 0.15);
    flex-shrink: 0;
  }

  .y-label {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
    line-height: 1;
  }

  .chart-container {
    flex: 1;
    position: relative;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: stretch;
    gap: 0;
    height: 180px;
    margin-left: 0;
  }

  .chart-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      repeating-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.03) 0px,
        rgba(255, 255, 255, 0.03) 1px,
        transparent 1px,
        transparent 36px
      ),
      repeating-linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.04) 0px,
        rgba(255, 255, 255, 0.04) 1px,
        transparent 1px,
        transparent calc(100% / 7)
      );
    pointer-events: none;
  }

  .line-chart {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 2;
  }

  .chart-line {
    fill: none;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.85;
    transition: all 0.3s ease;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
  }

  .chart-line:hover {
    stroke-width: 3.5;
    opacity: 1;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
  }

  .chart-dot {
    transition: all 0.3s ease;
    cursor: pointer;
    stroke: rgba(0, 0, 0, 0.8);
    stroke-width: 1.5;
  }

  .chart-dot:hover {
    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.6));
  }

  .x-axis {
    display: flex;
    justify-content: space-around;
    gap: 0;
    margin-top: 0.8rem;
    width: 100%;
    padding-right: 0;
  }

  .x-label {
    flex: 1;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    padding-top: 0.4rem;
  }

  .chart-legend-storage {
    display: flex;
    gap: 1.2rem;
    flex-wrap: wrap;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .legend-item-small {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.65);
    font-weight: 700;
  }

  .legend-dot-small {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  }

  .x-label {
    flex: 1;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.65);
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }

  .chart-legend-storage {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 0.8rem;
    padding-top: 0.8rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin-left: 35px;
  }

  .legend-item-small {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.65);
    font-weight: 700;
  }

  .legend-dot-small {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }


  /* Product Status Widget - Large */

  .widget-product-status {
    grid-column: 3 / 5;
    grid-row: 2;
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.12);
    display: flex;
    flex-direction: column;
  }

  .widget-product-status h3 {
    margin-bottom: 1.2rem;
  }

  .pie-chart-container {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex: 1;
  }

  .pie-chart-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 150px;
  }

  .pie-chart {
    width: 150px;
    height: 150px;
    transform: rotate(-90deg);
  }

  .pie-segment {
    fill: none;
    stroke-width: 20;
    stroke-linecap: round;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .pie-segment.available {
    stroke: #00D966;
    filter: drop-shadow(0 0 8px rgba(0, 217, 102, 0.4));
  }

  .pie-segment.expired {
    stroke: #FF2E4B;
    filter: drop-shadow(0 0 8px rgba(255, 46, 75, 0.4));
  }

  .pie-segment:hover {
    filter: brightness(1.2) drop-shadow(0 0 12px rgba(255, 255, 255, 0.3));
    stroke-width: 22;
  }

  .pie-center {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .pie-center-value {
    font-size: 2rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1;
  }

  .pie-center-label {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-top: 0.3rem;
  }

  .pie-legend {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
  }

  .legend-item {
    display: flex;
    gap: 0.8rem;
    align-items: center;
    padding: 0.8rem;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease;
  }

  .legend-item:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .legend-item.available {
    border-color: rgba(0, 217, 102, 0.3);
  }

  .legend-item.expired {
    border-color: rgba(255, 46, 75, 0.3);
  }

  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .legend-item.available .legend-dot {
    background: #00D966;
    box-shadow: 0 0 8px rgba(0, 217, 102, 0.5);
  }

  .legend-item.expired .legend-dot {
    background: #FF2E4B;
    box-shadow: 0 0 8px rgba(255, 46, 75, 0.5);
  }

  .legend-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .legend-name {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }

  .legend-count {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.95);
    font-weight: 800;
  }

  .pie-segment-empty {
    fill: none;
    stroke: rgba(255, 255, 255, 0.15);
    stroke-width: 20;
    stroke-linecap: round;
    opacity: 0.5;
  }

  .legend-item-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.2rem 0.8rem;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    text-align: center;
  }

  .legend-label-empty {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }


  /* Responsive Design */
  @media (max-width: 1200px) {
    .stats-widgets-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto auto;
    }

    .widget-large {
      grid-column: 1 / 3;
    }

    .widget-storage {
      grid-column: 1 / 3;
    }

    .widget-product-status {
      grid-column: 1 / 3;
    }
  }


  .stat-card h3 {
    color: #ffffff;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 1.8rem 0;
    letter-spacing: 0.8px;
    position: relative;
    z-index: 1;
  }

  /* Alerts Section */

  .alerts-section {
    background: transparent;
    padding: 4rem 2rem;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .alerts-container {
    margin-top: 2rem;
  }

  .no-alerts {
    background: rgba(144, 238, 144, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(144, 238, 144, 0.3);
    border-radius: 20px;
    padding: 3rem 2rem;
    text-align: center;
  }

  .no-alerts-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  .no-alerts p {
    color: rgba(144, 238, 144, 0.8);
    font-size: 1.1rem;
  }

  .alert-card {
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    display: flex;
    gap: 1.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
  }

  .alert-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    border-radius: 20px 20px 0 0;
  }

  .alert-card:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateX(8px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
  }


  .alert-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .alert-content {
    text-align: left;
    flex: 1;
  }

  .alert-title {
    color: #ffffff;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }

  .alert-message {
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 0.8rem 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .alert-date {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    margin: 0;
  }

  /* Footer Button Bar */
  .footer-bar {
    background: transparent;
    padding: 2rem;
    width: 100%;
    display: flex;
    justify-content: center;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    position: relative;
    z-index: 2;
  }

  .footer-bar-content {
    max-width: 1400px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .footer-btn {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 0.7rem 1.5rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    letter-spacing: 0.3px;
  }

  .footer-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.95);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }

  .footer-btn.copyright {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.8rem;
    cursor: default;
    padding: 0.5rem 0;
  }

  .footer-btn.copyright:hover {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.45);
    transform: none;
    box-shadow: none;
  }
  @media (max-width: 768px) {
    .hero-section h1 {
      font-size: 2rem;
    }


    .profile-email {
      display: none;
    }

    .logo-text {
      font-size: 1.2rem;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Scroll-Reveal Animations */
  .reveal-hidden {
    opacity: 0;
    transform: translateY(40px);
    transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .reveal-visible {
    opacity: 1;
    transform: translateY(0);
    transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .section.reveal-visible {
    transition-delay: 0.1s;
  }

  .stat-widget.reveal-visible {
    transition-delay: 0.2s;
  }

  .alert-card.reveal-visible {
    transition-delay: 0.15s;
  }

  /* ============ RIGHT SIDEBAR STYLES ============ */

  .right-sidebar {
    width: 320px;
    height: calc(100vh - 100px);
    overflow-y: auto;
    overflow-x: hidden;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0.6rem;
    position: fixed;
    right: 0;
    top: 80px;
    z-index: -100000;
  }

  /* Scrollbar styling for sidebar */
  .right-sidebar::-webkit-scrollbar {
    width: 6px;
  }

  .right-sidebar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  .right-sidebar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    transition: all 0.3s ease;
  }

  .right-sidebar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0);
  }

  /* Sidebar Cards Base Style */
  .sidebar-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 0.9rem;
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15),
                inset 0 1px 1px rgba(255, 255, 255, 0.2);
    margin: 0 0.2rem;
    flex-shrink: 0;
  }

  .sidebar-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2),
                inset 0 1px 1px rgba(255, 255, 255, 0.25);
  }

  .sidebar-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    border-radius: 12px 12px 0 0;
  }

  .sidebar-card h3 {
    font-size: 0.65rem;
    color: #ffffff;
    font-weight: 800;
    margin: 0 0 0.7rem 0;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    word-break: break-word;
  }

  /* Quick Actions Card */
  .quick-actions-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 100, 100, 0.05));
    border-color: rgba(255, 100, 100, 0.2);
  }

  .quick-actions-card:hover {
    border-color: rgba(255, 100, 100, 0.4);
  }

  .actions-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.7rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: left;
    overflow: hidden;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
    color: #ffffff;
    transform: translateX(3px);
  }

  .action-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .action-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Summary Card */
  .summary-card {
    background: linear-gradient(135deg, rgba(100, 200, 255, 0.08), rgba(157, 78, 221, 0.05));
    border-color: rgba(157, 78, 221, 0.2);
  }

  .summary-card:hover {
    border-color: rgba(157, 78, 221, 0.4);
  }

  .summary-items {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .summary-item {
    display: flex;
    gap: 0.6rem;
    padding: 0.65rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease;
  }

  .summary-item:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateX(2px);
  }

  .summary-icon {
    font-size: 1.3rem;
    flex-shrink: 0;
  }

  .summary-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .summary-label {
    font-size: 0.6rem;
    color: rgba(255, 255, 255, 0.55);
    font-weight: 700;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .summary-value {
    font-size: 1.3rem;
    color: rgba(255, 255, 255, 0.95);
    font-weight: 900;
    margin: 0;
    line-height: 1;
  }

  /* Categories Mini Card */
  .categories-card {
    background: linear-gradient(135deg, rgba(6, 214, 160, 0.08), rgba(78, 205, 196, 0.05));
    border-color: rgba(78, 205, 196, 0.2);
  }

  .categories-card:hover {
    border-color: rgba(78, 205, 196, 0.4);
  }

  .categories-mini-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .category-mini {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.65rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease;
    cursor: pointer;
    min-height: 26px;
  }

  .category-mini:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateX(2px);
  }

  .category-mini-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
  }

  .category-mini-name {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 700;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .category-mini-count {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 900;
    min-width: 18px;
    text-align: right;
    flex-shrink: 0;
  }

  /* Alerts Mini Card */
  .alerts-mini-card {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.08), rgba(255, 100, 100, 0.05));
    border-color: rgba(255, 100, 100, 0.2);
  }

  .alerts-mini-card:hover {
    border-color: rgba(255, 100, 100, 0.4);
  }

  .alerts-mini-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 250px;
    overflow-y: auto;
  }

  .alerts-mini-list::-webkit-scrollbar {
    width: 4px;
  }

  .alerts-mini-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .alerts-mini-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }

  .alert-mini {
    display: flex;
    gap: 0.6rem;
    padding: 0.65rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .alert-mini:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateX(2px);
  }

  .alert-mini.warning {
    border-left: 3px solid rgba(255, 100, 100, 0.6);
  }

  .alert-mini.info {
    border-left: 3px solid rgba(100, 200, 255, 0.6);
  }

  .alert-mini.success {
    border-left: 3px solid rgba(144, 238, 144, 0.6);
  }

  .alert-mini-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .alert-mini-content {
    flex: 1;
    min-width: 0;
  }

  .alert-mini-title {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 700;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.2;
  }

  .alert-mini-date {
    font-size: 0.6rem;
    color: rgba(255, 255, 255, 0.5);
    margin: 0.3rem 0 0 0;
  }

  .no-alerts-mini {
    text-align: center;
    padding: 0.8rem 0;
  }

  .no-alerts-mini p {
    font-size: 0.7rem;
    color: rgba(144, 238, 144, 0.8);
    margin: 0;
  }

  /* Responsive - Hide sidebar on small screens */
  @media (max-width: 1400px) {
    .right-sidebar {
      width: 280px;
    }

    .content-wrapper {
      padding-right: 300px;
    }
  }

  @media (max-width: 1200px) {
    .right-sidebar {
      display: none;
    }

    .content-wrapper {
      padding-right: 2rem;
      gap: 1rem;
    }
  }

</style>



