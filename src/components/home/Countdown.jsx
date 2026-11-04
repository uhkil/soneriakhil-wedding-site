// A countdown to the guest's first event (passed in as "to"; e.g. the
// ceremony at 9 AM on April 9, or for guests invited only on April 10, the
// wedding at 10 AM that day): days, hours, minutes, and seconds, ticking
// every second.
// Once it arrives, it shows zeros.
import { useEffect, useState } from 'react'
import art from '../../data/art.js'

// If there's no event to go by: the start of the weekend, Arlington time.
const WEEKEND = new Date('2027-04-09T00:00:00-05:00')

function timeLeft(to) {
  const ms = Math.max(0, to - Date.now())
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor(s / 3600) % 24,
    minutes: Math.floor(s / 60) % 60,
    seconds: s % 60,
  }
}

const two = (n) => String(n).padStart(2, '0')

export default function Countdown({ to = WEEKEND }) {
  const [left, setLeft] = useState(() => timeLeft(to))

  useEffect(() => {
    const timer = setInterval(() => setLeft(timeLeft(to)), 1000)
    return () => clearInterval(timer)
  }, [to])

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
      {/* A single flower at each end (the right one mirrored). */}
      <div className="countdown-row">
        <CountdownFlower />
      <div className="countdown-units" aria-hidden="true">
        {units.map(([value, label]) => (
          <div key={label} className="countdown-unit">
            <span className="countdown-value">{value}</span>
            <span className="countdown-label">{label}</span>
          </div>
        ))}
      </div>
        <CountdownFlower mirrored />
      </div>
    </div>
  )
}

// A single flower beside the countdown: the drawing if it's in art.js
// ("countdownFlower"), otherwise a small placeholder in its shape.
function CountdownFlower({ mirrored = false }) {
  const flower = art.countdownFlower
  return (
    <div className={`countdown-flower${mirrored ? ' mirrored' : ''}`} style={{ aspectRatio: flower.ratio }} aria-hidden="true">
      {flower.src ? <img src={import.meta.env.BASE_URL + flower.src} alt="" draggable="false" /> : <span>flower</span>}
    </div>
  )
}
