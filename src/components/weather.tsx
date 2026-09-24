import { useRef, type CSSProperties, type ReactNode } from 'react'
import { CSSTransition } from 'react-transition-group'

import { useForecast, type Forecast } from './weatherData'
import WeatherIcon from './weatherIcons'

// Must match the transition durations in weather.css.
const FADE_DURATION = 500
const FADE_OFFSET = 250

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

// Open-Meteo's local times carry no offset, so Date parses them as the
// rendering machine's local time — harmless here, since only the calendar
// date (not the instant) is formatted back out.
const formatDate = (isoLocal: string, options: Intl.DateTimeFormatOptions) =>
  new Date(isoLocal).toLocaleDateString('en-GB', options)

// Staggered like Info: each piece enters `index` steps after the first,
// and exits in reverse so the last one in is the first one out.
const delayStyle = (index: number, count: number, visible: boolean) => ({
  '--delay': `${(visible ? index : count - index - 1) * FADE_OFFSET}ms`,
} as CSSProperties)

interface PanelProps {
  title: string
  className?: string
  style: CSSProperties
  children: ReactNode
}

const Panel = ({ title, className = '', style, children }: PanelProps) => (
  <section className={`nxtv-weather-item nxtv-weather-panel ${className}`} style={style}>
    <h2 className="nxtv-weather-panel-title">{title}</h2>
    {children}
  </section>
)

const WeatherBody = ({ forecast, visible }: { forecast: Forecast, visible: boolean }) => {
  const { current, hourly, daily } = forecast
  // Header + 4 panels.
  const count = 5
  const delay = (index: number) => delayStyle(index, count, visible)

  return (
    <div className="nxtv-weather-content">
      <header className="nxtv-weather-item nxtv-weather-header" style={delay(0)}>
        <h1 className="nxtv-weather-location">{forecast.location}</h1>
        <div className="nxtv-weather-subtitle">
          {forecast.region && <span>{forecast.region}</span>}
          <span>{formatDate(forecast.localTime, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </header>

      <div className="nxtv-weather-panels">
        <Panel title="Now" className="nxtv-weather-now" style={delay(1)}>
          <div className="nxtv-weather-now-main">
            <WeatherIcon condition={current.condition} isDay={current.isDay} size={112} />
            <div className="nxtv-weather-now-temperature">{current.temperature}°</div>
          </div>
          <div className="nxtv-weather-now-description">{current.description}</div>
          <div className="nxtv-weather-muted">Feels like {current.feelsLike}°</div>
        </Panel>

        <Panel title="Details" className="nxtv-weather-details" style={delay(2)}>
          <dl>
            <dt>Wind</dt>
            <dd>
              {current.windSpeed} km/h {COMPASS[Math.round(current.windDirection / 45) % 8]}
            </dd>
            <dt>Humidity</dt>
            <dd>{current.humidity} %</dd>
            <dt>Pressure</dt>
            <dd>{current.pressure} hPa</dd>
            <dt>Precipitation</dt>
            <dd>{current.precipitation} mm</dd>
            <dt>Sun</dt>
            <dd>{current.sunrise} – {current.sunset}</dd>
          </dl>
        </Panel>

        <Panel title="Next hours" className="nxtv-weather-hourly" style={delay(3)}>
          <div className="nxtv-weather-hourly-grid">
            {hourly.map((hour) => (
              <div key={hour.time} className="nxtv-weather-hour">
                <div className="nxtv-weather-muted">{hour.time}</div>
                <WeatherIcon condition={hour.condition} isDay={hour.isDay} size={52} />
                <div className="nxtv-weather-value">{hour.temperature}°</div>
                <div className="nxtv-weather-rain">{hour.precipitationProbability} %</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Next days" className="nxtv-weather-daily" style={delay(4)}>
          <div className="nxtv-weather-daily-list">
            {daily.map((day) => (
              <div key={day.date} className="nxtv-weather-day">
                <span className="nxtv-weather-day-name">{formatDate(day.date, { weekday: 'short' })}</span>
                <WeatherIcon condition={day.condition} size={36} />
                <span className="nxtv-weather-value">{day.max}°</span>
                <span className="nxtv-weather-muted">{day.min}°</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

interface WeatherProps {
  visible: boolean
  location: string
}

const Weather = ({ visible, location }: WeatherProps) => {
  // nodeRef, not CSSTransition's default findDOMNode: React 19 removed
  // findDOMNode entirely.
  const nodeRef = useRef<HTMLDivElement>(null)
  // Fetched regardless of visibility, so the data is ready (and the
  // graphic can animate in immediately) the moment it's toggled on.
  const forecast = useForecast(location)
  const shown = visible && !!forecast

  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={shown}
      // The last staggered piece finishes 4 offsets after the first.
      timeout={FADE_DURATION + 4 * FADE_OFFSET}
      classNames="fade"
      unmountOnExit
    >
      <div ref={nodeRef} className="nxtv-weather">
        <div className="nxtv-weather-backdrop" style={delayStyle(0, 5, shown)} />
        {forecast && <WeatherBody forecast={forecast} visible={shown} />}
      </div>
    </CSSTransition>
  )
}

export default Weather
