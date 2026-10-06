import { useEffect, useState } from 'react'

// Open-Meteo: free, no API key, and sends Access-Control-Allow-Origin: *,
// so it works from CasparCG's file:// origin too. Needs internet access on
// the rendering machine — without it the graphic simply never appears.
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const REFRESH_INTERVAL = 15 * 60 * 1000
const HOURLY_SLOTS = 6
const HOURLY_STEP = 3
const DAILY_SLOTS = 5

export type Condition = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm'

export interface HourForecast {
  time: string
  condition: Condition
  isDay: boolean
  temperature: number
  precipitationProbability: number
}

export interface DayForecast {
  date: string
  condition: Condition
  min: number
  max: number
  precipitationProbability: number
}

export interface Forecast {
  location: string
  region: string
  localTime: string
  current: {
    condition: Condition
    description: string
    isDay: boolean
    temperature: number
    feelsLike: number
    humidity: number
    pressure: number
    precipitation: number
    windSpeed: number
    windDirection: number
    sunrise: string
    sunset: string
  }
  hourly: HourForecast[]
  daily: DayForecast[]
}

// WMO weather interpretation codes, as used by Open-Meteo.
const DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  56: 'Freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Violent showers',
  85: 'Snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with hail',
}

const toCondition = (code: number): Condition => {
  if (code <= 1) return 'clear'
  if (code === 2) return 'partly'
  if (code === 3) return 'cloudy'
  if (code <= 48) return 'fog'
  if (code <= 57) return 'drizzle'
  if (code <= 67 || (code >= 80 && code <= 82)) return 'rain'
  if (code <= 77 || code === 85 || code === 86) return 'snow'
  return 'storm'
}

// Open-Meteo returns times already in the location's own timezone
// (timezone=auto), as "YYYY-MM-DDTHH:MM" with no offset — so the clock
// part is just sliced out rather than parsed through Date, which would
// reinterpret it in the rendering machine's timezone.
const timeOf = (isoLocal: string) => isoLocal.slice(11, 16)

const fetchForecast = async (query: string, signal: AbortSignal): Promise<Forecast> => {
  const geoParams = new URLSearchParams({ name: query, count: '1', format: 'json' })
  const geoResponse = await fetch(`${GEOCODING_URL}?${geoParams}`, { signal })
  if (!geoResponse.ok) throw new Error(`Geocoding failed: ${geoResponse.status}`)
  const place = (await geoResponse.json()).results?.[0]
  if (!place) throw new Error(`Location not found: ${query}`)

  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: [
      'temperature_2m', 'apparent_temperature', 'weather_code', 'is_day',
      'relative_humidity_2m', 'pressure_msl', 'precipitation',
      'wind_speed_10m', 'wind_direction_10m',
    ].join(','),
    hourly: 'temperature_2m,weather_code,is_day,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    timezone: 'auto',
    // +1: today is included in the daily series, and we skip it.
    forecast_days: String(DAILY_SLOTS + 1),
  })
  const response = await fetch(`${FORECAST_URL}?${params}`, { signal })
  if (!response.ok) throw new Error(`Forecast failed: ${response.status}`)
  const { current, hourly, daily } = await response.json()

  // Same "YYYY-MM-DDTHH:MM" format on both sides, so string comparison
  // orders them correctly.
  const firstHour = (hourly.time as string[]).findIndex((time) => time > current.time)
  const hourIndices = Array.from({ length: HOURLY_SLOTS }, (_, i) => firstHour + i * HOURLY_STEP)
    .filter((i) => i < hourly.time.length)

  return {
    location: place.name,
    region: [place.admin1, place.country].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', '),
    localTime: current.time,
    current: {
      condition: toCondition(current.weather_code),
      description: DESCRIPTIONS[current.weather_code] ?? '',
      isDay: !!current.is_day,
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: Math.round(current.relative_humidity_2m),
      pressure: Math.round(current.pressure_msl),
      precipitation: current.precipitation,
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: current.wind_direction_10m,
      sunrise: timeOf(daily.sunrise[0]),
      sunset: timeOf(daily.sunset[0]),
    },
    hourly: hourIndices.map((i) => ({
      time: timeOf(hourly.time[i]),
      condition: toCondition(hourly.weather_code[i]),
      isDay: !!hourly.is_day[i],
      temperature: Math.round(hourly.temperature_2m[i]),
      precipitationProbability: hourly.precipitation_probability[i] ?? 0,
    })),
    daily: (daily.time as string[]).slice(1).map((date, i) => ({
      date,
      condition: toCondition(daily.weather_code[i + 1]),
      min: Math.round(daily.temperature_2m_min[i + 1]),
      max: Math.round(daily.temperature_2m_max[i + 1]),
      precipitationProbability: daily.precipitation_probability_max[i + 1] ?? 0,
    })),
  }
}

export const useForecast = (location: string) => {
  // Tagged with the location it was fetched for, so a stale forecast for a
  // previous location is never shown while the new one is loading.
  const [result, setResult] = useState<{ query: string, forecast: Forecast } | null>(null)

  useEffect(() => {
    if (!location.trim()) return

    const controller = new AbortController()
    const load = () => {
      fetchForecast(location, controller.signal)
        .then((forecast) => setResult({ query: location, forecast }))
        .catch((err) => {
          if (err.name !== 'AbortError') console.error('[nxtv weather]', err)
        })
    }

    load()
    const intervalId = setInterval(load, REFRESH_INTERVAL)
    return () => {
      controller.abort()
      clearInterval(intervalId)
    }
  }, [location])

  return result?.query === location ? result.forecast : null
}
