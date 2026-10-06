import type { Condition } from './weatherData'

const Sun = () => (
  <g stroke="var(--color-aurora-03)" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="16" cy="16" r="6" fill="var(--color-aurora-03)" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <line key={angle} x1="16" y1="3" x2="16" y2="6" transform={`rotate(${angle} 16 16)`} />
    ))}
  </g>
)

const Moon = () => (
  <path
    d="M20 5 a11 11 0 1 0 8 17 a9 9 0 0 1 -8 -17 z"
    fill="var(--color-snow-02)"
  />
)

const Cloud = ({ color = 'var(--color-snow-01)' }: { color?: string }) => (
  <path
    d="M9 26 a6 6 0 0 1 0-12 a8 8 0 0 1 15 2 a5 5 0 0 1 0 10 z"
    fill={color}
  />
)

const Drops = ({ count }: { count: 2 | 3 }) => (
  <g stroke="var(--color-frost-02)" strokeWidth="2.5" strokeLinecap="round">
    {(count === 3 ? [11, 17, 23] : [13, 21]).map((x) => (
      <line key={x} x1={x} y1="24" x2={x - 2} y2="29" />
    ))}
  </g>
)

interface WeatherIconProps {
  condition: Condition
  isDay?: boolean
  size?: number
}

const WeatherIcon = ({ condition, isDay = true, size = 48 }: WeatherIconProps) => {
  const Sky = isDay ? Sun : Moon

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className="nxtv-weather-icon">
      {condition === 'clear' && <Sky />}
      {condition === 'partly' && (
        <>
          <g transform="translate(5 -4) scale(0.8)"><Sky /></g>
          <Cloud />
        </>
      )}
      {condition === 'cloudy' && <Cloud />}
      {condition === 'fog' && (
        <g stroke="var(--color-snow-01)" strokeWidth="2.5" strokeLinecap="round">
          <line x1="5" y1="11" x2="27" y2="11" />
          <line x1="3" y1="17" x2="25" y2="17" />
          <line x1="7" y1="23" x2="29" y2="23" />
        </g>
      )}
      {condition === 'drizzle' && (
        <>
          <g transform="translate(0 -5)"><Cloud /></g>
          <Drops count={2} />
        </>
      )}
      {condition === 'rain' && (
        <>
          <g transform="translate(0 -5)"><Cloud color="var(--color-night-04)" /></g>
          <Drops count={3} />
        </>
      )}
      {condition === 'snow' && (
        <>
          <g transform="translate(0 -5)"><Cloud /></g>
          <g fill="var(--color-snow-03)">
            <circle cx="10" cy="26" r="1.8" />
            <circle cx="16" cy="29" r="1.8" />
            <circle cx="22" cy="26" r="1.8" />
          </g>
        </>
      )}
      {condition === 'storm' && (
        <>
          <g transform="translate(0 -5)"><Cloud color="var(--color-night-04)" /></g>
          <path d="M17 19 l-5 7 h4 l-2 6 l7-9 h-4 l2-4 z" fill="var(--color-aurora-03)" />
        </>
      )}
    </svg>
  )
}

export default WeatherIcon
