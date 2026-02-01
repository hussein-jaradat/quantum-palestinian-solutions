import { WeatherData, HourlyForecast, DailyForecast, WeatherCondition } from '@/types/weather';
import { GOVERNORATES } from '@/data/weatherData';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
    precipitation: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
    relative_humidity_2m_max: number[];
    sunrise: string[];
    sunset: string[];
  };
}

// WMO Weather codes to our condition mapping
const weatherCodeToCondition = (code: number): WeatherCondition => {
  if (code === 0) return 'sunny';
  if (code <= 3) return 'partly_cloudy';
  if (code <= 48) return 'foggy';
  if (code <= 55) return 'rainy';
  if (code <= 65) return 'heavy_rain';
  if (code <= 77) return 'snowy';
  if (code <= 82) return 'heavy_rain';
  if (code <= 99) return 'stormy';
  return 'cloudy';
};

const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

export const fetchWeatherForGovernorate = async (
  governorateId: string
): Promise<{ weather: WeatherData; hourly: HourlyForecast[]; daily: DailyForecast[] }> => {
  const governorate = GOVERNORATES.find((g) => g.id === governorateId);
  if (!governorate) {
    throw new Error(`Governorate ${governorateId} not found`);
  }

  const { lat, lng } = governorate.coordinates;

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,precipitation',
    hourly: 'temperature_2m,weather_code,precipitation_probability',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,relative_humidity_2m_max,sunrise,sunset',
    timezone: 'Asia/Jerusalem',
    forecast_days: '7',
  });

  const response = await fetch(`${OPEN_METEO_BASE}?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch weather data: ${response.statusText}`);
  }

  const data: OpenMeteoResponse = await response.json();

  // Parse current weather
  const weather: WeatherData = {
    governorateId,
    temperature: Math.round(data.current.temperature_2m),
    temperatureMax: Math.round(data.daily.temperature_2m_max[0]),
    temperatureMin: Math.round(data.daily.temperature_2m_min[0]),
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    windDirection: getWindDirection(data.current.wind_direction_10m),
    precipitation: data.current.precipitation,
    condition: weatherCodeToCondition(data.current.weather_code),
    airQuality: 50, // Open-Meteo free tier doesn't include AQI
    sunrise: new Date(data.daily.sunrise[0]).toLocaleTimeString('ar-PS', { hour: '2-digit', minute: '2-digit' }),
    sunset: new Date(data.daily.sunset[0]).toLocaleTimeString('ar-PS', { hour: '2-digit', minute: '2-digit' }),
    updatedAt: new Date().toISOString(),
  };

  // Parse hourly forecast (next 24 hours)
  const hourly: HourlyForecast[] = data.hourly.time.slice(0, 24).map((time, i) => ({
    time,
    temperature: Math.round(data.hourly.temperature_2m[i]),
    condition: weatherCodeToCondition(data.hourly.weather_code[i]),
    precipitation: data.hourly.precipitation_probability[i],
  }));

  // Parse daily forecast
  const daily: DailyForecast[] = data.daily.time.map((date, i) => ({
    date,
    temperatureMax: Math.round(data.daily.temperature_2m_max[i]),
    temperatureMin: Math.round(data.daily.temperature_2m_min[i]),
    condition: weatherCodeToCondition(data.daily.weather_code[i]),
    precipitation: data.daily.precipitation_probability_max[i],
    humidity: data.daily.relative_humidity_2m_max[i],
  }));

  return { weather, hourly, daily };
};

export const fetchAllGovernoratesWeather = async (): Promise<Record<string, WeatherData>> => {
  const weatherData: Record<string, WeatherData> = {};
  
  // Fetch in batches to avoid rate limiting
  const batchSize = 4;
  for (let i = 0; i < GOVERNORATES.length; i += batchSize) {
    const batch = GOVERNORATES.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (gov) => {
        try {
          const { weather } = await fetchWeatherForGovernorate(gov.id);
          return { id: gov.id, weather };
        } catch (error) {
          console.error(`Failed to fetch weather for ${gov.id}:`, error);
          return null;
        }
      })
    );
    
    results.forEach((result) => {
      if (result) {
        weatherData[result.id] = result.weather;
      }
    });
    
    // Small delay between batches
    if (i + batchSize < GOVERNORATES.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  
  return weatherData;
};
