import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';
import type {
  CitySuggestion,
  OneCallForecastItem,
  OneCallResponse3,
  CurrentWeatherResponse,
  OneCallDailyForecastItem
} from '~/interfaces/weather';
import type { FetchError } from 'ofetch';

// Helper function: Map weather condition + day/night to icon path
function mapConditionToIcon(mainCondition: string, isDay: boolean): string {
  const cond = mainCondition.toLowerCase();
  if (cond.includes("cloud")) {
    return isDay ? "/icons/cloudy-day-1.svg" : "/icons/cloudy-night-1.svg";
  } else if (cond.includes("rain")) {
    return "/icons/rainy-1.svg";
  } else if (cond.includes("thunder")) {
    return "/icons/thunder.svg";
  } else if (cond.includes("snow")) {
    return "/icons/snowy-1.svg";
  } else if (cond.includes("clear")) {
    return isDay ? "/icons/day.svg" : "/icons/night.svg";
  } else {
    return isDay ? "/icons/day.svg" : "/icons/night.svg";
  }
}

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    // Current weather data from /weather endpoint
    weatherData: null as CurrentWeatherResponse | null,
    // User location
    userLocation: null as { lat: number; lon: number; name?: string } | null,
    savedCities: [] as string[],
    suggestions: [] as Array<{ name: string; country?: string }>,
    // Hourly forecast using One Call API 3.0
    hourlyForecast: [] as OneCallForecastItem[],
    // Daily forecast using One Call API 3.0
    dailyForecast: [] as OneCallDailyForecastItem[],
  }),

  actions: {
    // Load saved cities from localStorage
    initSavedCities() {
      if (process.client) {
        const stored = localStorage.getItem('savedCities');
        if (stored) {
          this.savedCities = JSON.parse(stored);
        }
      }
    },

    // Fetch city suggestions using the geocoding API
    async fetchCitySuggestions(query: string) {
      if (!query) {
        this.suggestions = [];
        return;
      }
      try {
        const config = useRuntimeConfig().public;
        const apiKey = config.weatherApiKey;
        const geocodingUrl = config.geocodingUrl;
        const data = await $fetch<CitySuggestion[]>(
          `${geocodingUrl}?q=${query}&limit=5&appid=${apiKey}`
        );
        this.suggestions = data.map(item => ({
          name: item.name,
          country: item.country
        }));
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
        this.suggestions = [];
      }
    },

    // Fetch current weather by city
    async fetchWeather(city: string) {
      try {
        const config = useRuntimeConfig().public;
        const apiKey = config.weatherApiKey;
        const weatherUrl = config.weatherUrl;
        this.weatherData = await $fetch<CurrentWeatherResponse>(
          `${weatherUrl}?q=${city}&appid=${apiKey}&units=metric`
        );
        await this.fetchHourlyForecast();
        await this.fetchDailyForecast();
      } catch (error: FetchError | unknown) {
        if ((error as FetchError)?.response?.status === 404) {
          window.alert('City not found');
        } else {
          console.error('Error fetching weather:', error);
          window.alert('An unexpected error occurred while fetching the weather.');
        }
      }
    },

    // Fetch current weather by geolocation
    async fetchWeatherByLocation() {
      if (!this.userLocation) return;
      try {
        const config = useRuntimeConfig().public;
        const apiKey = config.weatherApiKey;
        const weatherUrl = config.weatherUrl;
        this.weatherData = await $fetch<CurrentWeatherResponse>(
          `${weatherUrl}?lat=${this.userLocation.lat}&lon=${this.userLocation.lon}&appid=${apiKey}&units=metric`
        );
        if (!this.userLocation.name && this.weatherData) {
          this.userLocation.name = this.weatherData.name;
        }
      } catch (error) {
        console.error('Error fetching weather by location:', error);
      }
    },

    // Get user's location (client-only) and fetch weather by location
  getUserLocation(): Promise<{ lat: number; lon: number; name?: string } | null> {
    if (!process.client) return Promise.resolve(null);
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return Promise.resolve(null);
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          try {
            await this.fetchWeatherByLocation();
            resolve(this.userLocation);
          } catch (error: unknown) {
            window.alert('Error fetching weather by location: ' + error);
            reject(error);
          }
        },
        (error) => {
          window.alert('Error obtaining location: ' + error.message);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  },


    // Save a city in localStorage
    saveCity(city: string) {
      if (!this.savedCities.includes(city)) {
        this.savedCities.push(city);
        if (process.client) {
          localStorage.setItem('savedCities', JSON.stringify(this.savedCities));
        }
      }
    },

    // Remove a saved city
    removeCity(city: string) {
      this.savedCities = this.savedCities.filter(c => c !== city);
      if (process.client) {
        localStorage.setItem('savedCities', JSON.stringify(this.savedCities));
      }
    },

    // Fetch hourly forecast using One Call API 3.0 and transform the response
    async fetchHourlyForecast() {
      let lat: number, lon: number;
      if (this.weatherData && this.weatherData.coord) {
        lat = this.weatherData.coord.lat;
        lon = this.weatherData.coord.lon;
      } else if (this.userLocation && this.userLocation.lat && this.userLocation.lon) {
        lat = this.userLocation.lat;
        lon = this.userLocation.lon;
      } else {
        lat = 51.5074; // Default: London
        lon = -0.1278;
      }
      const config = useRuntimeConfig().public;
      const apiKey = config.weatherApiKey;
      try {
        const data = await $fetch<OneCallResponse3>(
          `${config.oneCallUrl}?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&appid=${apiKey}&units=metric`
        );
        this.hourlyForecast = data.hourly.map(item => {
          return {
            dt: item.dt,
            temp: item.temp,
            feels_like: item.feels_like,
            humidity: item.humidity,
            pop: item.pop,
            wind_speed: item.wind_speed,
            weather: item.weather,
            popPercentage: item.pop ? Math.round(item.pop * 100) : 0,
            iconPath: mapConditionToIcon(item.weather[0].main, true)
          };
        });
        if (this.hourlyForecast.length > 0 && this.weatherData) {
          this.weatherData.popPercentage = this.hourlyForecast[0].popPercentage;
        }
      } catch (error) {
        console.error("Error fetching hourly forecast:", error);
      }
    },

    // Fetch daily forecast using One Call API 3.0 and transform the response
    async fetchDailyForecast() {
      let lat: number, lon: number;
      if (this.weatherData && this.weatherData.coord) {
        lat = this.weatherData.coord.lat;
        lon = this.weatherData.coord.lon;
      } else if (this.userLocation && this.userLocation.lat && this.userLocation.lon) {
        lat = this.userLocation.lat;
        lon = this.userLocation.lon;
      } else {
        lat = 51.5074; // Default: London
        lon = -0.1278;
      }
      const config = useRuntimeConfig().public;
      const apiKey = config.weatherApiKey;
      try {
        const data = await $fetch<{ daily: OneCallDailyForecastItem[] }>(
          `${config.oneCallUrl}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=metric`
        );
        this.dailyForecast = data.daily;
      } catch (error: FetchError | unknown) {
        if ((error as FetchError)?.response?.status === 429) {
          window.alert('Anthony has ran out of API calls for today. Information won\'t be displayed correctly. Please try again tomorrow.');
        } else {
          console.error('Error fetching weather:', error);
          window.alert('An unexpected error occurred while fetching the weather.');
        }
      }
    },
  },
});
