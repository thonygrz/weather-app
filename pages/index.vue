<template>
  <div
    class="flex flex-col items-center justify-center gap-6"
    style="min-height: calc(100vh - 56px)"
  >
    <SearchForm />
    <CityList />
  </div>
</template>

<script setup>
import { useWeatherStore } from "@/stores/weather";

const weatherStore = useWeatherStore();
weatherStore.initSavedCities();
</script>
