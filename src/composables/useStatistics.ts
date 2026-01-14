import { ref, computed } from 'vue'
import type { Statistics } from '../types'
import statisticsService from '../services/statisticsService'

export function useStatistics() {
  const statistics = ref<Statistics | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  /**
   * Lade Statistiken
   * Hinweis: Der Statistics-Endpoint ist optional und nicht erforderlich
   */
  const loadStatistics = async (forceRefresh: boolean = false) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      statistics.value = await statisticsService.getStatistics(forceRefresh)
    } catch (error: unknown) {
      // Statistiken sind optional - fehlende Endpoints sind nicht kritisch
      console.warn('Statistiken können nicht geladen werden (Optional):', error)
      // Nicht setzen von errorMessage, da dies optional ist
      statistics.value = null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Aktualisiere Statistiken neu
   */
  const refreshStatistics = async () => {
    return await loadStatistics(true)
  }

  /**
   * Computed: Rettungsquote in Prozent
   */
  const savingPercentage = computed(() => {
    if (!statistics.value || statistics.value.totalProducts === 0) {
      return 0
    }
    return Math.round((statistics.value.savedProducts / statistics.value.totalProducts) * 100)
  })

  /**
   * Computed: Kapazitätsnutzung in Prozent
   */
  const capacityUsage = computed(() => {
    if (!statistics.value) return 0
    return Math.min(100, Math.round(statistics.value.capacityPercentage))
  })

  /**
   * Computed: Status-Message
   */
  const statusMessage = computed(() => {
    if (!statistics.value) return 'Keine Daten'
    return `${statistics.value.totalProducts} Produkte | ${statistics.value.savedProducts} gerettet`
  })

  return {
    // State
    statistics,
    isLoading,
    errorMessage,

    // Methods
    loadStatistics,
    refreshStatistics,

    // Computed
    savingPercentage,
    capacityUsage,
    statusMessage
  }
}

