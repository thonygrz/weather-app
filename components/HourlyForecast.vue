<template>
  <div class="px-4 pt-8">
    <div class="overflow-x-auto snap-x snap-mandatory no-scrollbar">
      <div class="flex gap-4">
        <div
          v-for="(hour, index) in hours"
          :key="index"
          class="flex flex-col items-center bg-white/30 text-white p-4 rounded-lg w-24 min-w-[6rem] snap-center"
        >
          <!-- Display the time ("Now" for the first item, formatted for others) -->
          <span class="text-sm font-semibold">{{ hour.time }}</span>
          <!-- Weather Icon -->
          <img :src="hour.iconPath" alt="Weather icon" class="h-8 w-8 my-2" />
          <!-- Temperature -->
          <span class="text-lg font-bold">{{ hour.temp }}°</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useWeatherStore } from "@/stores/weather";
import type { OneCallForecastItem } from "~/interfaces/weather";

// Get the weather store
const weatherStore = useWeatherStore();

// Fetch the hourly forecast on client mount (SSR: onMounted is client-only)
onMounted(async () => {
  try {
    await weatherStore.fetchHourlyForecast();
  } catch (error) {
    console.error("Error fetching hourly forecast:", error);
  }
});

// Define a computed property for the hours data with proper typing
const hours = computed(
  (): Array<{ time: string; iconPath: string; temp: number }> => {
    if (
      !weatherStore.hourlyForecast ||
      weatherStore.hourlyForecast.length === 0
    ) {
      return [];
    }
    // Map the first 8 hourly forecast items into a simplified format
    return weatherStore.hourlyForecast.slice(0, 8).map((item, index) => {
      const castedItem = item as OneCallForecastItem & { iconPath: string };
      const date = new Date(item.dt * 1000);
      // If the first item, display "Now", else format the hour (e.g., "7pm")
      const timeStr =
        index === 0
          ? "Now"
          : date
              .toLocaleTimeString([], { hour: "numeric", hour12: true })
              .replace(/\s/g, "")
              .replace(/\./g, "")
              .toLowerCase();
      return {
        time: timeStr,
        iconPath: castedItem.iconPath,
        temp: Math.round(castedItem.temp),
      };
    });
  }
);
</script>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.no-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
