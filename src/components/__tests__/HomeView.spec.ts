import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../HomeView.vue'

// Mock der useProducts Composable mit ref
vi.mock('../../composables/useProducts', () => {
  const { ref } = require('vue')
  return {
    useProducts: () => ({
      products: ref([]),
      isLoading: ref(false),
      errorMessage: ref(''),
      loadProducts: vi.fn(),
      addProduct: vi.fn(),
      updateProduct: vi.fn(),
      deleteProduct: vi.fn(),
      consumeProduct: vi.fn()
    })
  }
})

// Mock der useStatistics Composable mit ref
vi.mock('../../composables/useStatistics', () => {
  const { ref } = require('vue')
  return {
    useStatistics: () => ({
      statistics: ref({
        totalProducts: 0,
        savedProducts: 0,
        expiredProducts: 0,
        capacity: 100,
        capacityPercentage: 0,
        lastUpdated: new Date().toISOString()
      }),
      isLoading: ref(false),
      errorMessage: ref(''),
      loadStatistics: vi.fn()
    })
  }
})

// Mock des authService
vi.mock('../../services/authService', () => ({
  default: {
    logout: vi.fn(),
    getToken: () => 'mock-token',
    getUserId: () => 1
  }
}))

describe('HomeView.vue - Tests 1-5', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Test 1: Header mit Logo rendert
   * GIVEN: HomeView wird gemountet
   * WHEN: Komponente wird gerendert
   * THEN: Header mit Logo "PanTrix" und Logout-Button sichtbar
   */
  it('Test 1: should render header with logo and logout button', () => {
    wrapper = mount(HomeView, {
      props: {
        currentUser: 'test@example.com',
        onLogout: vi.fn()
      },
      global: {
        stubs: { PantryInterfaceModal: true }
      }
    })

    const logo = wrapper.find('.logo-text')
    expect(logo.exists()).toBe(true)
    expect(logo.text()).toBe('PanTrix')

    const logoutBtn = wrapper.find('.logout-btn')
    expect(logoutBtn.exists()).toBe(true)
  })

  /**
   * Test 2: Logout-Button ruft Callback auf
   * GIVEN: Logout-Button existiert
   * WHEN: Benutzer klickt Button
   * THEN: onLogout wird aufgerufen
   */
  it('Test 2: should call onLogout when logout button clicked', async () => {
    const logoutFn = vi.fn()
    wrapper = mount(HomeView, {
      props: {
        currentUser: 'test@example.com',
        onLogout: logoutFn
      },
      global: {
        stubs: { PantryInterfaceModal: true }
      }
    })

    await wrapper.find('.logout-btn').trigger('click')
    expect(logoutFn).toHaveBeenCalled()
  })

  /**
   * Test 3: E-Mail wird im Profil angezeigt
   * GIVEN: currentUser Prop mit E-Mail
   * WHEN: HomeView rendert
   * THEN: E-Mail im Profile-Bereich sichtbar
   */
  it('Test 3: should display user email in profile', () => {
    const email = 'user@test.com'
    wrapper = mount(HomeView, {
      props: { currentUser: email, onLogout: vi.fn() },
      global: { stubs: { PantryInterfaceModal: true } }
    })

    expect(wrapper.find('.profile-email').text()).toBe(email)
  })

  /**
   * Test 4: Grußformel mit Name
   * GIVEN: HomeView gemountet
   * WHEN: Komponente rendert
   * THEN: Grußformel zeigt Benutzernamen
   */
  it('Test 4: should display greeting with username', () => {
    wrapper = mount(HomeView, {
      props: { currentUser: 'max@example.com', onLogout: vi.fn() },
      global: { stubs: { PantryInterfaceModal: true } }
    })

    const greeting = wrapper.find('.greeting-main').text()
    expect(greeting).toContain('max')
  })

  /**
   * Test 5: My-Pantry Section
   * GIVEN: HomeView gemountet
   * WHEN: Komponente rendert
   * THEN: My-Pantry Section mit Heading existiert
   */
  it('Test 5: should render my-pantry section', () => {
    wrapper = mount(HomeView, {
      props: { currentUser: 'test@example.com', onLogout: vi.fn() },
      global: { stubs: { PantryInterfaceModal: true } }
    })

    const section = wrapper.find('#my-pantry-section')
    expect(section.exists()).toBe(true)
    expect(section.find('h2').text()).toBe('Meine Vorratskammer')
  })
})
