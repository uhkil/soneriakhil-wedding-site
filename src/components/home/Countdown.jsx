// A countdown to the guest's first event (passed in as "to"; e.g. the
// ceremony at 9 AM on April 9, or for guests invited only on April 10, the
// wedding at 10 AM that day): days, hours, minutes, and seconds, ticking
// every second.
// Once it arrives, it shows zeros.
import { useEffect, useState } from 'react'

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

// How many times the line repeats in each half of the ticker (enough to
// reach across the widest screens).
const TICKER_REPEATS = 12

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
      {/* Behind the numbers: "get ready to dance in" repeated, drifting left to
          right, showing in the gaps between the numbers (see .countdown-ticker). */}
      <div className="countdown-ticker" aria-hidden="true">
        <div className="countdown-ticker-track">
          {/* Two identical halves, so the loop is seamless. Between each
              sentence: a small round dot (drawn, so it's a true circle). */}
          {Array.from({ length: 2 }, (_, half) => (
            <span key={half} className="ticker-half">
              {Array.from({ length: TICKER_REPEATS }, (_, i) => (
                <span key={i} className="ticker-phrase">
                  get ready to dance in
                  <span className="ticker-dot" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <div className="countdown-units" aria-hidden="true">
        {units.map(([value, label]) => (
          <div key={label} className="countdown-unit">
            <span className="countdown-value">{value}</span>
            <span className="countdown-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
