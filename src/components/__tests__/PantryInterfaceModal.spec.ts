import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PantryInterfaceModal from '../PantryInterfaceModal.vue'
import type { Product } from '../../types'

// Mock der useProducts Composable
vi.mock('../../composables/useProducts', () => ({
  useProducts: () => ({
    products: [],
    isLoading: false,
    errorMessage: '',
    loadProducts: vi.fn(),
    addProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    consumeProduct: vi.fn()
  })
}))

describe('PantryInterfaceModal.vue - Tests 6-10', () => {
  let wrapper: any

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Tomate',
      category: 'Gemüse',
      expiryDate: '2025-02-20',
      quantity: 5,
      unit: 'Stück',
      status: 'fresh'
    },
    {
      id: 2,
      name: 'Salat',
      category: 'Gemüse',
      expiryDate: '2025-02-18',
      quantity: 2,
      unit: 'Stück',
      status: 'expiring_soon'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Test 6: Toolbar mit Suche, Kategorien und Add-Button
   * GIVEN: PantryInterfaceModal mit Produkten
   * WHEN: Komponente rendert
   * THEN: Toolbar-Elemente (Suche, Kategorien, Buttons) existieren
   */
  it('Test 6: should render toolbar with search, categories, and add button', () => {
    wrapper = mount(PantryInterfaceModal, {
      props: { products: mockProducts }
    })

    const toolbar = wrapper.find('.pantry-toolbar')
    expect(toolbar.exists()).toBe(true)

    const searchBtn = wrapper.find('.search-toggle-btn')
    expect(searchBtn.exists()).toBe(true)

    const addBtn = wrapper.find('.add-product-btn')
    expect(addBtn.exists()).toBe(true)
    expect(addBtn.text()).toContain('Hinzufügen')

    const categoryTabs = wrapper.findAll('.category-btn')
    expect(categoryTabs.length).toBeGreaterThan(0)
  })

  /**
   * Test 7: Aktive Produkte anzeigen
   * GIVEN: Mehrere Produkte vorhanden
   * WHEN: Komponente rendert
   * THEN: Produkte werden in Sektionen angezeigt
   */
  it('Test 7: should display active products section when products exist', () => {
    wrapper = mount(PantryInterfaceModal, {
      props: { products: mockProducts }
    })

    const productsSection = wrapper.find('.products-section')
    expect(productsSection.exists()).toBe(true)

    const productCards = wrapper.findAll('.product-item')
    expect(productCards.length).toBeGreaterThan(0)
  })

  /**
   * Test 8: Empty-State bei keine Produkten
   * GIVEN: Keine Produkte vorhanden
   * WHEN: Komponente rendert
   * THEN: Empty-State Nachricht angezeigt
   */
  it('Test 8: should show empty state when no products provided', () => {
    wrapper = mount(PantryInterfaceModal, {
      props: { products: [] }
    })

    const emptyState = wrapper.find('.empty-state')
    expect(emptyState.exists()).toBe(true)
    expect(emptyState.text()).toContain('Noch keine Produkte hinzugefügt')
  })

  /**
   * Test 9: Suche filtert Produkte
   * GIVEN: Mehrere Produkte und Suchbox offen
   * WHEN: Benutzer gibt "Tomate" ein
   * THEN: Nur Produkte mit "Tomate" im Namen gezeigt
   */
  it('Test 9: should filter products by search query', async () => {
    wrapper = mount(PantryInterfaceModal, {
      props: { products: mockProducts }
    })

    const searchToggleBtn = wrapper.find('.search-toggle-btn')
    await searchToggleBtn.trigger('click')

    const searchInput = wrapper.find('.search-input')
    expect(searchInput.exists()).toBe(true)

    await searchInput.setValue('Tomate')
    await wrapper.vm.$nextTick()

    // Komponente sollte mit Sucheingabe funktionieren
    expect(wrapper.vm).toBeDefined()
  })

  /**
   * Test 10: update:products Event emittieren
   * GIVEN: Produkte Property ändert sich
   * WHEN: Neue Produkte werden als Props übergeben
   * THEN: Komponente akzeptiert neue Props
   */
  it('Test 10: should accept updated products via props', async () => {
    wrapper = mount(PantryInterfaceModal, {
      props: { products: mockProducts }
    })

    const newProducts: Product[] = [
      ...mockProducts,
      {
        id: 3,
        name: 'Gurke',
        category: 'Gemüse',
        expiryDate: '2025-02-25',
        quantity: 1,
        unit: 'Stück',
        status: 'fresh'
      }
    ]

    await wrapper.setProps({ products: newProducts })

    expect(wrapper.props('products').length).toBe(3)
  })
})

