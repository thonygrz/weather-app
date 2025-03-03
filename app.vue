<template>
  <div
    class="relative min-h-screen flex flex-col justify-between transition-all duration-500"
  >
    <!-- Background Video -->
    <video
      v-if="backgroundVideo"
      :key="backgroundVideo"
      autoplay
      loop
      muted
      playsinline
      class="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
    >
      <source :src="backgroundVideo" type="video/mp4" />
      Your browser does not support the video tag.
    </video>

    <!-- Main Content -->
    <main class="container mx-auto">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="text-white text-center p-4">
      <p>&copy; 2025 Weather App | Built for 77 Diamonds Test</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useWeatherStore } from "@/stores/weather";
import { useRuntimeConfig } from "#app";

const weatherStore = useWeatherStore();
const config = useRuntimeConfig().public;

/**
 * Computed: Determine if it's daytime using current time vs sunrise and sunset.
 */
const isDayTime = computed(() => {
  if (!weatherStore.weatherData?.sys) return true;
  const now = Date.now();
  const sunrise = weatherStore.weatherData.sys.sunrise * 1000;
  const sunset = weatherStore.weatherData.sys.sunset * 1000;
  return now >= sunrise && now < sunset;
});

/**
 * Computed: Determine if we are in the sunset window (e.g., within 30 minutes before sunset).
 */
const isSunset = computed(() => {
  if (!weatherStore.weatherData?.sys) return false;
  const now = Date.now();
  const sunset = weatherStore.weatherData.sys.sunset * 1000;
  return sunset - now <= 30 * 60 * 1000 && now < sunset;
});

/**
 * Computed: Get the background video URL based on weather condition,
 * time of day, and sunset window. All URLs come from runtime config.
 */
const backgroundVideo = computed(() => {
  if (!weatherStore.weatherData) return config.clearDayVideo;
  // Use the weather description (lowercase)
  const description =
    weatherStore.weatherData.weather[0].description.toLowerCase();
  const day = isDayTime.value;
  const sunsetWindow = isSunset.value;

  // If within the sunset window, use sunset videos
  if (sunsetWindow) {
    if (description.includes("clear")) {
      return config.clearSunsetVideo;
    } else if (description.includes("cloud")) {
      return config.cloudSunsetVideo;
    } else if (description.includes("rain")) {
      return config.rainySunsetVideo;
    } else if (description.includes("snow")) {
      return config.snowSunsetVideo;
    }
  }

  // Otherwise, use the normal logic based on condition and day/night.
  if (description.includes("cloud")) {
    return day ? config.cloudDayVideo : config.cloudNightVideo;
  } else if (description.includes("rain")) {
    return day ? config.rainyDayVideo : config.rainyNightVideo;
  } else if (description.includes("thunder")) {
    return day ? config.thunderstormDayVideo : config.thunderstormNightVideo;
  } else if (description.includes("snow")) {
    return day ? config.snowDayVideo : config.snowNightVideo;
  } else if (description.includes("fog") || description.includes("mist")) {
    return day ? config.fogDayVideo : config.fogDayVideo;
  } else if (description.includes("sunny")) {
    return day ? config.sunnyCloudDayVideo : config.sunnyCloudNightVideo;
  } else if (description.includes("clear")) {
    return day ? config.clearDayVideo : config.clearNightVideo;
  } else {
    // Fallback
    return day ? config.clearDayVideo : config.clearNightVideo;
  }
});
</script>

<style scoped>
/* No additional styles needed for the background video */
</style>
