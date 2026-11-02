// A countdown to the wedding: days, hours, minutes, and seconds, ticking
// every second, with a few small flowers on either side.
// (The butterfly that used to flutter beside it is still in Butterfly.jsx.)
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

// Each side's row of flowers, starting next to the numbers and heading out
// toward the edge of the page: [flower, height, space before it, mirrored?].
// Height 1 = 120% of a number plus its label; the shortest (0.84) is within
// 20% of the tallest. Spaces are in "em" (about the height of a number).
// The rows run as far as there's room: any flower that wouldn't fit before
// the edge of the page is left out (so on smaller screens there are fewer).
// The two sides are deliberately different, so it looks hand-planted.
const BEDS = {
  left: [
    ['tulip', 0.92, 0],
    ['foxglove', 1, 0.55],
    ['sunflower', 0.86, 0.45],
    ['tulip', 0.95, 0.6, true],
    ['foxglove', 0.88, 0.5],
    ['sunflower', 0.97, 0.62],
    ['tulip', 0.84, 0.42],
    ['foxglove', 0.94, 0.58],
    ['sunflower', 0.9, 0.5, true],
    ['tulip', 0.98, 0.6],
  ],
  right: [
    ['foxglove', 0.9, 0],
    ['sunflower', 1, 0.5],
    ['tulip', 0.87, 0.6, true],
    ['foxglove', 0.96, 0.44],
    ['tulip', 0.85, 0.58],
    ['sunflower', 0.93, 0.52],
    ['foxglove', 0.99, 0.62],
    ['tulip', 0.9, 0.46, true],
    ['sunflower', 0.86, 0.56],
    ['foxglove', 0.95, 0.5],
  ],
}

function Flowers({ side }) {
  return (
    <div className={`countdown-flowers countdown-flowers-${side}`}>
      {BEDS[side].map(([name, height, space, mirrored], i) => {
        const src = `url(${import.meta.env.BASE_URL}assets/art/flower-${name}.svg)`
        return (
          <span key={i} className="countdown-flower-spot" style={{ [side === 'left' ? 'marginRight' : 'marginLeft']: `${space}em` }}>
            <span
              className={mirrored ? 'countdown-flower mirrored' : 'countdown-flower'}
              style={{ height: `${height * 100}%`, aspectRatio: FLOWERS[name], WebkitMaskImage: src, maskImage: src }}
            />
          </span>
        )
      })}
    </div>
  )
}
