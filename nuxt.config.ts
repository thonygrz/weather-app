import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  ssr: true,
  
  nitro: {
    preset: "netlify"
  },
  modules: ['@pinia/nuxt'],

  runtimeConfig: {
    public: {
      // Weather API
      weatherApiKey: process.env.WEATHER_API_KEY,
      weatherUrl: process.env.WEATHER_URL || 'https://api.openweathermap.org/data/2.5/weather',
      geocodingUrl: process.env.GEOCODING_URL || 'https://api.openweathermap.org/geo/1.0/direct',
      oneCallUrl: process.env.ONE_CALL_URL || 'https://api.openweathermap.org/data/3.0/onecall',
      // Video URLs
      clearDayVideo: '/videos/clear-day.mp4',
      clearNightVideo: '/videos/clear-night.mp4',
      clearSunsetVideo: '/videos/clear-sunset.mp4',
      cloudDayVideo: '/videos/cloud-day.mp4',
      cloudNightVideo: '/videos/cloud-night.mp4',
      cloudSunsetVideo: '/videos/cloud-sunset.mp4',
      rainyDayVideo: '/videos/rainy-day.mp4',
      rainyNightVideo: '/videos/rainy-night.mp4',
      rainySunsetVideo: '/videos/rainy-sunset.mp4',
      thunderstormDayVideo: '/videos/thunderstorm-day.mp4',
      thunderstormNightVideo: '/videos/thunderstorm-night.mp4',
      snowDayVideo: '/videos/snow-day.mp4',
      snowNightVideo: '/videos/snow-night.mp4',
      snowSunsetVideo: '/videos/snow-sunset.mp4',
      fogDayVideo: '/videos/fog-day.mp4',
      fogNightVideo: '/videos/fog-night.mp4',
      sunnyCloudDayVideo: '/videos/sunny-cloud-day.mp4',
      sunnyCloudNightVideo: '/videos/sunny-cloud-night.mp4',
      // Heart icon
      heartOutlinePath: "/icons/heart-outline.svg",
      heartSolidPath: "/icons/heart-solid.svg",
    }
  },

  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  compatibilityDate: '2025-03-01',
})