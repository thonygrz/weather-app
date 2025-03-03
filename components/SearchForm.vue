<template>
  <div class="flex items-center gap-4">
    <!-- Input container with suggestions dropdown -->
    <div class="relative w-72">
      <!-- Magnifying glass icon (absolute positioned) -->
      <span
        class="absolute left-0 top-1/2 transform -translate-y-1/2 pl-2 text-gray-400 pointer-events-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle
            cx="10"
            cy="10"
            r="7"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <line
            x1="15"
            y1="15"
            x2="20"
            y2="20"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>

      <!-- Search input with bottom border only -->
      <input
        v-model="city"
        type="text"
        placeholder="Search city..."
        class="border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none w-full pl-8 py-2 text-white"
        @keyup.enter="goToCity"
        @input="onInputChange"
      />

      <!-- Suggestions Dropdown -->
      <ul
        v-if="suggestions.length > 0 && showSuggestions"
        class="absolute top-12 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50"
      >
        <li
          v-for="(suggest, index) in suggestions"
          :key="index"
          class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          @click="selectSuggestion(suggest)"
        >
          {{ suggest.name }}
          <span v-if="suggest.country" class="text-sm text-gray-500">
            ({{ suggest.country }})
          </span>
        </li>
      </ul>
    </div>

    <!-- Geolocation button -->
    <button
      @click="useLocation"
      class="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 focus:outline-none"
      title="Use current location"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 2C8.13 2 5 5.13 5 9c0 3.87 7 13 7 13s7-9.13 7-13c0-3.87-3.13-7-7-7z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useWeatherStore } from "@/stores/weather";

// Local state for the search input and suggestions visibility
const city = ref<string>("");
const showSuggestions = ref<boolean>(false);

// Access the weather store and router
const weatherStore = useWeatherStore();
const router = useRouter();

// Computed: Get suggestions from the store
const suggestions = computed(() => weatherStore.suggestions);

/**
 * onInputChange:
 * If the input has content, fetch suggestions from the API.
 * Otherwise, clear the suggestions and hide the dropdown.
 */
function onInputChange(): void {
  if (city.value.trim().length > 0) {
    weatherStore.fetchCitySuggestions(city.value.trim());
    showSuggestions.value = true;
  } else {
    // Clear suggestions when input is empty
    weatherStore.suggestions = [];
    showSuggestions.value = false;
  }
}

/**
 * selectSuggestion:
 * When a suggestion is selected, update the input and navigate to the city's page.
 */
function selectSuggestion(suggest: { name: string; country?: string }): void {
  city.value = suggest.name;
  showSuggestions.value = false;
  router.push(`/city/${suggest.name}`);
}

/**
 * goToCity:
 * Navigate to the city page when the user presses Enter.
 */
function goToCity(): void {
  if (suggestions.value.length > 0) {
    const firstSuggestion = suggestions.value[0];
    city.value = firstSuggestion.name;
    showSuggestions.value = false;
    router.push(`/city/${firstSuggestion.name}`);
  } else {
    window.alert("No results found for your search.");
  }
}

/**
 * useLocation:
 * Calls the store action to get the user's location.
 * If successful, navigates to the corresponding city page.
 */
async function useLocation(): Promise<void> {
  try {
    const loc = await weatherStore.getUserLocation();
    if (loc?.name) {
      router.push(`/city/${loc.name}`);
    } else {
      console.warn("No city name found after geolocation.");
    }
  } catch (error) {
    console.error("Error in geolocation:", error);
  }
}
</script>

<style scoped>
/* No changes in styling needed */
</style>
