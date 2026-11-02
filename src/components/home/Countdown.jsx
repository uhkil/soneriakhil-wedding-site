// A countdown to the wedding: days, hours, minutes, and seconds, ticking
// every second, with a few small flowers on either side.
// Once the day arrives, it shows zeros.
import { useEffect, useState } from 'react'

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
        <Flowers side="left" />
        <Flowers side="right" />
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

// The flower drawings (public/assets/art/flower-*.svg), each with its width ÷ height.
const FLOWERS = {
  foxglove: 346 / 1059,
  sunflower: 523 / 1118,
  tulip: 498 / 1040,
}

// Three flowers on each side, the right side a mirror image of the left.
// Each group sits centered in the space between the numbers and the edge of
// the screen. [flower, height]: height 1 = 120% of a number plus its label
// (the shortest is within 20% of the tallest). Listed left to right for the
// left side; the right side is the same, flipped.
const BED = [
  ['tulip', 0.9],
  ['foxglove', 1],
  ['sunflower', 0.86],
]

function Flowers({ side }) {
  const bed = side === 'left' ? BED : [...BED].reverse()
  return (
    <div className={`countdown-flowers countdown-flowers-${side}`}>
      {bed.map(([name, height]) => {
        const src = `url(${import.meta.env.BASE_URL}assets/art/flower-${name}.svg)`
        return (
          <span
            key={name}
            className={side === 'right' ? 'countdown-flower mirrored' : 'countdown-flower'}
            style={{ height: `${height * 100}%`, aspectRatio: FLOWERS[name], WebkitMaskImage: src, maskImage: src }}
          />
        )
      })}
    </div>
  )
}
