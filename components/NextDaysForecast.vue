<template>
  <div class="pt-4 px-4">
    <h3 class="text-sm font-bold mb-4 text-white">Next 3 Days</h3>
    <div class="bg-white/30 text-white rounded-lg divide-y divide-gray-300">
      <!-- Render each day's forecast as a row -->
      <div
        v-for="(day, index) in nextDays"
        :key="index"
        class="flex items-center justify-between p-4"
      >
        <!-- Day and Date -->
        <div class="flex flex-col text-center min-w-[20%]">
          <span class="font-bold text-lg">{{ day.weekday }}</span>
          <span class="text-sm text-white">{{ day.dateString }}</span>
        </div>
        <!-- Weather Icon -->
        <div class="flex flex-col text-center items-center min-w-[20%]">
          <img :src="day.iconPath" alt="Weather icon" class="h-8 w-8" />
        </div>
        <!-- Temperature: Minimum / Maximum -->
        <div class="flex flex-col text-center min-w-[20%]">
          <span class="text-sm text-white">Low: {{ day.minTemp }}°</span>
          <span class="text-sm text-white">High: {{ day.maxTemp }}°</span>
        </div>
        <!-- Rain Probability and Wind -->
        <div class="flex flex-col text-center min-w-[20%]">
          <span class="text-sm text-white">{{ day.rainProb }}%</span>
          <span class="text-sm text-white">Rain</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useWeatherStore } from "@/stores/weather";

// Helper function: Map weather condition to icon path based on day time.
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

const weatherStore = useWeatherStore();

// Computed: Use the daily forecast from the store
const nextDays = computed(() => {
  // If dailyForecast is not available, return an empty array
  if (!weatherStore.dailyForecast || weatherStore.dailyForecast.length === 0)
    return [];

  // Skip the first element if it represents today and take the next 3 days.
  return weatherStore.dailyForecast.slice(1, 4).map((day) => {
    const realDate = new Date(day.dt * 1000);
    const weekday = realDate.toLocaleDateString([], { weekday: "short" });
    const dateString = realDate.toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
    });
    // Use the weather condition from the day's forecast; assume daytime for the icon.
    const isDay = true;
    const iconPath = mapConditionToIcon(day.weather[0].main, isDay);
    return {
      weekday,
      dateString,
      minTemp: Math.round(day.temp.min),
      maxTemp: Math.round(day.temp.max),
      wind: day.wind_speed.toFixed(1),
      rainProb: Math.round(day.pop * 100),
      iconPath,
      realDate,
    };
  });
});
</script>

<style></style>
