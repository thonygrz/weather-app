import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import WeatherViewer from '~/components/WeatherViewer.vue'
import { createTestingPinia } from '@pinia/testing'
import { useWeatherStore } from '@/stores/weather'

describe('WeatherViewer.vue - Saved Cities', () => {
  // Test to save the city, update the heart icon, and add to savedCities list
  it('saves the city and updates heart icon and savedCities list', async () => {
    const pinia = createTestingPinia({
      initialState: {
        weather: {
          weatherData: {
            name: 'Paris',
            main: { temp: 20, feels_like: 18, temp_min: 16, temp_max: 22, pressure: 1012, humidity: 70 },
            sys: { sunrise: 1618308000, sunset: 1618358400 },
            wind: { speed: 5 },
            popPercentage: 10,
            weather: [{ main: 'Clear' }]
          },
          savedCities: []
        }
      },
      stubActions: false,
      createSpy: vi.fn
    })

    const wrapper = mount(WeatherViewer, {
      global: {
        plugins: [pinia]
      }
    })

    const weatherStore = useWeatherStore()

    // Verify the city is not saved initially
    expect(weatherStore.savedCities).not.toContain('Paris')
    expect(wrapper.find('[alt="Save city"]').exists()).toBe(true)

    // Click on the heart button to save the city
    const heartButton = wrapper.find('button')
    await heartButton.trigger('click')

    // Verify the city is now saved and the icon updated
    expect(weatherStore.savedCities).toContain('Paris')
    expect(wrapper.find('[alt="City saved"]').exists()).toBe(true)
  })

  // Test to ensure the city remains saved and icon remains filled after reload
  it('keeps the city saved and heart filled after reload', async () => {
    const pinia = createTestingPinia({
      initialState: {
        weather: {
          weatherData: {
            name: 'Paris',
            main: { temp: 20, feels_like: 18, temp_min: 16, temp_max: 22, pressure: 1012, humidity: 70 },
            sys: { sunrise: 1618308000, sunset: 1618358400 },
            wind: { speed: 5 },
            popPercentage: 10,
            weather: [{ main: 'Clear' }]
          },
          savedCities: ['Paris']
        }
      },
      stubActions: false,
      createSpy: vi.fn
    })

    const wrapper = mount(WeatherViewer, {
      global: {
        plugins: [pinia]
      }
    })

    const weatherStore = useWeatherStore()

    // Verify the city is still saved after "reload" and heart icon is filled
    expect(weatherStore.savedCities).toContain('Paris')
    expect(wrapper.find('[alt="City saved"]').exists()).toBe(true)
    expect(wrapper.find('[alt="Save city"]').exists()).toBe(false)
  })
})
