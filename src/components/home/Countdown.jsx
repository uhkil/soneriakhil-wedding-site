// A countdown to the wedding: days, hours, minutes, and seconds, ticking
// every second. A small butterfly flutters beside it.
// Once the day arrives, it shows zeros.
import { useEffect, useState } from 'react'
import Butterfly from './Butterfly.jsx'

// Midnight at the start of April 9, 2027, Arlington time (Central, UTC−5 in April).
const WEDDING = new Date('2027-04-09T00:00:00-05:00').getTime()

function timeLeft() {
  const ms = Math.max(0, WEDDING - Date.now())
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor(s / 3600) % 24,
    minutes: Math.floor(s / 60) % 60,
    seconds: s % 60,
  }
}

const two = (n) => String(n).padStart(2, '0')

export default function Countdown() {
  const [left, setLeft] = useState(timeLeft)

  useEffect(() => {
    const timer = setInterval(() => setLeft(timeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  const units = [
    [left.days, 'days'],
    [two(left.hours), 'hours'],
    [two(left.minutes), 'minutes'],
    [two(left.seconds), 'seconds'],
  ]

  return (
    <div className="countdown">
      {/* Screen readers get one short sentence instead of numbers changing every second. */}
      <p className="visually-hidden">{left.days} days until the wedding</p>
      <div className="countdown-units" aria-hidden="true">
        {units.map(([value, label]) => (
          <div key={label} className="countdown-unit">
            <span className="countdown-value">{value}</span>
            <span className="countdown-label">{label}</span>
          </div>
        ))}
      </div>
      <Butterfly />
    </div>
  )
}
