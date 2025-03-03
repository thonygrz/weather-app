<template>
  <div
    class="flex flex-col items-center gap-6"
    style="min-height: calc(100vh - 56px)"
  >
    <WeatherViewer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useWeatherStore } from "@/stores/weather";
import WeatherViewer from "@/components/WeatherViewer.vue";

const route = useRoute();
const weatherStore = useWeatherStore();

weatherStore.initSavedCities();

onMounted(async () => {
  const cityName = route.params.slug as string | undefined;
  if (cityName) {
    try {
      await weatherStore.fetchWeather(cityName);
    } catch (error) {
      console.error("Error fetching weather for city:", error);
    }
  }
});
</script>
