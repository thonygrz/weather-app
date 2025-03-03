<template>
  <button
    @click="handleGetLocation"
    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none"
  >
    Use My Location
  </button>
</template>

<script setup lang="ts">
import { useWeatherStore } from "@/stores/weather";

const weatherStore = useWeatherStore();

async function handleGetLocation(): Promise<void> {
  try {
    const loc = await weatherStore.getUserLocation();
    if (!loc) {
      window.alert("Location not available.");
    }
  } catch (error) {
    window.alert("Error obtaining location: " + error);
  }
}
</script>
