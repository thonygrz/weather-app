<template>
  <div v-if="weatherData" class="w-full max-w-xl text-white pt-4 px-4">
    <!-- Row 1: Weather Icon and Heart Button -->
    <div class="flex items-center justify-between">
      <img :src="weatherIcon" class="h-12 w-12" alt="Weather icon" />
      <button @click="toggleSaveCity" class="focus:outline-none">
        <img
          v-if="!isSaved"
          :src="heartOutlinePath"
          class="heart-icon h-4 w-4"
          alt="Save city"
        />
        <img
          v-else
          :src="heartSolidPath"
          class="heart-icon h-4 w-4"
          alt="City saved"
        />
      </button>
    </div>

    <!-- Row 2: Container for weather details -->
    <div class="flex flex-col md:flex-row justify-center items-center">
      <!-- Left Column: City name, temperature and details -->
      <div
        class="flex flex-col justify-center text-center w-full md:w-auto md:mr-8 mb-4 md:mb-0"
      >
        <h2 class="text-2xl font-bold drop-shadow-lg">
          {{ weatherData.name }}
        </h2>
        <p class="text-6xl font-light drop-shadow-lg">{{ currentTemp }}°</p>
        <p class="text-sm text-gray-500 font-bold drop-shadow-md">
          Feels like: {{ feelsLike }}°
        </p>
        <p class="text-sm drop-shadow-md">
          H: {{ tempMax }}° L: {{ tempMin }}°
        </p>
      </div>

      <!-- Vertical Divider (visible on md and above) -->
      <div class="hidden md:block w-px bg-white h-32 mx-4"></div>

      <!-- Right Column: Sunrise, Rain, Wind / Sunset, Humidity, Pressure -->
      <div class="flex flex-col space-y-1 text-lg w-full md:w-auto text-center">
        <div class="flex flex-row justify-center">
          <div class="flex flex-col min-w-[4rem]">
            <span class="text-xl drop-shadow-md">{{ sunriseTime }}</span>
            <span class="text-xs drop-shadow-md">Sunrise</span>
          </div>
          <div class="flex flex-col min-w-[4rem]">
            <span class="text-xl drop-shadow-md">{{ chanceOfRain }}%</span>
            <span class="text-xs drop-shadow-md">Rain</span>
          </div>
          <div class="flex flex-col min-w-[4rem]">
            <span class="text-xl drop-shadow-md">{{ windSpeed }} m/s</span>
            <span class="text-xs drop-shadow-md">Wind</span>
          </div>
        </div>
        <div class="flex flex-row justify-center">
          <div class="flex flex-col min-w-[4rem]">
            <span class="text-xl drop-shadow-md">{{ sunsetTime }}</span>
            <span class="text-xs drop-shadow-md">Sunset</span>
          </div>
          <div class="flex flex-col min-w-[4rem]">
            <span class="text-xl drop-shadow-md"
              >{{ weatherData.main.humidity }}%</span
            >
            <span class="text-xs drop-shadow-md">Humidity</span>
          </div>
          <div class="flex flex-col min-w-[4rem]">
            <span class="text-xl drop-shadow-md">{{ pressure }} hPa</span>
            <span class="text-xs drop-shadow-md">Pressure</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Child components for hourly and next days forecasts -->
    <HourlyForecast />
    <NextDaysForecast />
  </div>

  <!-- Fallback when no weather data is available -->
  <div v-else class="text-gray-200 text-center p-6">
    Loading or no data available...
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useWeatherStore } from "@/stores/weather";
import HourlyForecast from "@/components/HourlyForecast.vue";
import NextDaysForecast from "@/components/NextDaysForecast.vue";
import { useRuntimeConfig } from "#app";

const weatherStore = useWeatherStore();
const weatherData = computed(() => weatherStore.weatherData);
const config = useRuntimeConfig().public;

// Use runtime configuration for heart icons
const heartOutlinePath = config.heartOutlinePath || "/icons/heart-outline.svg";
const heartSolidPath = config.heartSolidPath || "/icons/heart-solid.svg";

// Computed: Check if the current city is saved
const isSaved = computed((): boolean => {
  return weatherData.value?.name
    ? weatherStore.savedCities.includes(weatherData.value.name)
    : false;
});

// Function: Toggle saving the city
function toggleSaveCity(): void {
  if (!weatherData.value?.name) return;
  const city = weatherData.value.name;
  if (isSaved.value) {
    weatherStore.removeCity(city);
  } else {
    weatherStore.saveCity(city);
  }
}

// Computed: Determine if it's day time using sunrise and sunset from weatherData
const isDayTime = computed(() => {
  if (!weatherData.value?.sys) return true;
  const now = Date.now();
  const sunrise = (weatherData.value.sys.sunrise ?? 0) * 1000;
  const sunset = (weatherData.value.sys.sunset ?? 0) * 1000;
  return now >= sunrise && now < sunset;
});

// Computed: Current temperature, min, max, and feels like with fallback values
const currentTemp = computed(() =>
  weatherData.value?.main?.temp ? Math.round(weatherData.value.main.temp) : "-"
);
const tempMin = computed(() =>
  weatherData.value?.main?.temp_min
    ? Math.round(weatherData.value.main.temp_min)
    : "-"
);
const tempMax = computed(() =>
  weatherData.value?.main?.temp_max
    ? Math.round(weatherData.value.main.temp_max)
    : "-"
);
const feelsLike = computed(() =>
  weatherData.value?.main?.feels_like
    ? Math.round(weatherData.value.main.feels_like)
    : "-"
);

// Computed: Format sunrise and sunset times as HH:MM
const sunriseTime = computed(() => {
  if (!weatherData.value?.sys?.sunrise) return "-";
  return new Date(weatherData.value.sys.sunrise * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
});
const sunsetTime = computed(() => {
  if (!weatherData.value?.sys?.sunset) return "-";
  return new Date(weatherData.value.sys.sunset * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Computed: Wind speed and pressure with fallbacks
const windSpeed = computed(() =>
  weatherData.value?.wind?.speed ? weatherData.value.wind.speed.toFixed(0) : "-"
);
const pressure = computed(() =>
  weatherData.value?.main?.pressure ? weatherData.value.main.pressure : "-"
);

// Computed: Chance of rain from popPercentage stored in weatherData
const chanceOfRain = computed(() =>
  weatherData.value?.popPercentage ? weatherData.value.popPercentage : 0
);

// Computed: Determine weather icon based on current weather condition and day/night
const weatherIcon = computed(() => {
  if (!weatherData.value?.weather) {
    return isDayTime.value ? "/icons/day.svg" : "/icons/night.svg";
  }
  const condition = weatherData.value.weather[0].main.toLowerCase();
  if (condition.includes("cloud")) {
    return isDayTime.value
      ? "/icons/cloudy-day-1.svg"
      : "/icons/cloudy-night-1.svg";
  } else if (condition.includes("rain")) {
    return "/icons/rainy-1.svg";
  } else if (condition.includes("thunder")) {
    return "/icons/thunder.svg";
  } else if (condition.includes("snow")) {
    return "/icons/snowy-1.svg";
  } else if (condition.includes("clear")) {
    return isDayTime.value ? "/icons/day.svg" : "/icons/night.svg";
  } else {
    return isDayTime.value ? "/icons/day.svg" : "/icons/night.svg";
  }
});
</script>

<style scoped>
.heart-icon {
  filter: brightness(0) invert(1);
  transition: transform 0.3s ease, opacity 0.3s ease;
}
button:active .heart-icon {
  transform: scale(1.2);
}
button:hover .heart-icon {
  opacity: 0.4;
}
</style>
