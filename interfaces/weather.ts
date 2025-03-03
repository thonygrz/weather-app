// interfaces/weather.ts

// Current weather response (from the /weather endpoint)
export interface CurrentWeatherResponse {
    coord: {
        lat: number;
        lon: number;
    };
    weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
    }>;
    main: {
        temp: number;
        temp_min: number;
        temp_max: number;
        feels_like: number;
        humidity: number;
        pressure: number;
    };
    wind: {
        speed: number;
    };
    sys: {
        sunrise: number;
        sunset: number;
    };
    name: string;
    popPercentage?: number;
}

// City suggestion interface (from the geocoding endpoint)
export interface CitySuggestion {
    name: string;
    country?: string;
    lat: number;
    lon: number;
}

// Forecast interfaces
export interface ForecastItem {
    dt: number;
    main: {
        temp: number;
        temp_min: number;
        temp_max: number;
        feels_like: number;
        humidity: number;
    };
    weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
    }>;
    wind: {
        speed: number;
    };
}

// One Call API 3.0 interfaces
export interface OneCallForecastItem {
    dt: number;
    temp: number;
    feels_like: number;
    humidity: number;
    pop: number;
    wind_speed: number;
    weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
    }>;
    popPercentage: number;
}

export interface OneCallResponse3 {
    current: CurrentWeatherResponse;
    hourly: OneCallForecastItem[];
}

export interface OneCallDailyForecastItem {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: {
        day: number;
        min: number;
        max: number;
        night: number;
        eve: number;
        morn: number;
    };
    feels_like: {
        day: number;
        night: number;
        eve: number;
        morn: number;
    };
    humidity: number;
    wind_speed: number;
    pop: number;
    weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
    }>;
}
  