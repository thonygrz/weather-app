import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import SearchForm from '~/components/SearchForm.vue'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useWeatherStore } from '@/stores/weather'

vi.stubGlobal('$fetch', vi.fn(async (url) => {
  if (url.includes('oneCallUrl')) {
    return { hourly: [], daily: [] }
  }
  return {}
}))

describe('SearchForm.vue - City Search', () => {
  // Test to ensure navigation to the first suggestion when pressing Enter
  it('navigates to the first suggestion when Enter is pressed', async () => {
    // Setup a mock router
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', name: 'NotFound', component: { template: '<div>Not Found</div>' } }]
    })
    router.push = vi.fn()

    // Mount the component with a fake store and router
    const wrapper = mount(SearchForm, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              weather: {
                suggestions: [{ name: 'London', country: 'UK' }]
              }
            },
            stubActions: true,
          }),
          router
        ],
      },
    })

    // Simulate typing and pressing Enter
    const input = wrapper.find('input')
    await input.setValue('London')
    await input.trigger('keyup.enter')

    // Verify redirection to the first suggestion
    expect(router.push).toHaveBeenCalledWith('/city/London')
  })

  // Test to display an alert when no suggestions exist and Enter is pressed
  it('shows alert when no suggestions are available and Enter is pressed', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', name: 'NotFound', component: { template: '<div>Not Found</div>' } }]
    })
    router.push = vi.fn()

    // Mock window.alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

    const wrapper = mount(SearchForm, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              weather: {
                suggestions: [] // No suggestions to simulate invalid city
              }
            },
            stubActions: true,
          }),
          router
        ],
      },
    })

    // Simulate typing invalid city and pressing Enter
    const input = wrapper.find('input')
    await input.setValue('asdfgh')
    await input.trigger('keyup.enter')

    // Verify alert was shown and no navigation happened
    expect(alertMock).toHaveBeenCalledWith('No results found for your search.')
    expect(router.push).not.toHaveBeenCalled()

    alertMock.mockRestore()
  })

  // Test for geolocation button to navigate to the detected city
  it('redirects to the detected city when clicking the location button', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', name: 'NotFound', component: { template: '<div>Not Found</div>' } }]
    })
    router.push = vi.fn()

    const wrapper = mount(SearchForm, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            createSpy: vi.fn,
          }),
          router
        ],
      },
    })

    const weatherStore = useWeatherStore()
    // Mock geolocation returning "New York"
    vi.spyOn(weatherStore, 'getUserLocation').mockResolvedValue({
      lat: 40.7128,
      lon: -74.0060,
      name: 'New York'
    })

    // Click the location button
    const button = wrapper.find('button[title="Use current location"]')
    await button.trigger('click')

    // Verify redirection to the detected city
    expect(router.push).toHaveBeenCalledWith('/city/New York')
  })
})
