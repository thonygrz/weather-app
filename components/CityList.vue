<template>
  <div class="flex flex-wrap gap-2 px-4 justify-center">
    <div
      v-for="city in savedCities"
      :key="city"
      @click="goToCity(city)"
      class="cursor-pointer text-white py-1 px-3 rounded-full hover:bg-gray-200 hover:text-gray-700 transition-colors opacity-50"
    >
      {{ city }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useWeatherStore } from "@/stores/weather";
import { useRouter } from "vue-router";

const weatherStore = useWeatherStore();
const router = useRouter();

// Use computed property to retrieve savedCities from the store
const savedCities = computed(() => weatherStore.savedCities);

// Navigate to the city's page
function goToCity(cityName: string): void {
  router.push(`/city/${cityName}`);
}
</script>

<style scoped></style>
