// The Home picture for the "Cream" design: Soneri and Akhil, drawn as a short
// frame-by-frame animation.
//   1. They dance: frames 1–4, looped a couple of times.
//   2. They turn toward you: frames 5, 6, 7.
//   3. They wave: frames 8 and 9 (back and forth), stopping on frame 9.
// As the wave starts, two speech bubbles fade in, one from each of them.
//
// All nine frames are the same size with the couple in the same spot, so
// they're simply stacked on top of each other and shown one at a time.
// The frames are see-through around the couple, so any background works.
// With "reduce motion" on, guests see only frame 9, with both bubbles.
import { useEffect, useState } from 'react'

const base = import.meta.env.BASE_URL + 'assets/hero-dance/'
const FRAMES = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${base}frame-${n}.webp`)

// The order the frames play in, and how long each stays up (milliseconds).
// Edit these to change the pacing.
const DANCE_LOOPS = 2
const SEQUENCE = [
  ...Array.from({ length: DANCE_LOOPS }, () => [
    [1, 450],
    [2, 450],
    [3, 450],
    [4, 450],
  ]).flat(),
  [5, 380], // turning toward you
  [6, 380],
  [7, 380],
  [8, 360], // the wave (the bubbles appear here)
  [9, 360],
  [8, 360],
  [9, 0], // stop here
]
const WAVE_FRAME = 8
const LAST_FRAME = 9

// How long a new frame takes to fade in over the last one.
// A short fade makes the movement feel gentler than a hard cut.
const FADE_MS = 140

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function HeroDance() {
  const stillOnly = prefersReducedMotion()
  const [frame, setFrame] = useState(stillOnly ? LAST_FRAME : 1)
  const [previous, setPrevious] = useState(null) // the frame fading out underneath
  const [talking, setTalking] = useState(stillOnly) // are the bubbles showing?

  useEffect(() => {
    if (stillOnly) return

    let cancelled = false
    const timers = []

    // Load every frame before starting, so nothing flickers mid-dance.
    const loads = FRAMES.map((src) => {
      const img = new Image()
      img.src = src
      return img.decode().catch(() => {}) // if one fails, play anyway
    })

    Promise.all(loads).then(() => {
      let elapsed = 0
      let shown = SEQUENCE[0][0]
      SEQUENCE.forEach(([n, duration], i) => {
        if (i > 0) {
          timers.push(
            setTimeout(() => {
              if (cancelled) return
              setPrevious(shown)
              setFrame(n)
              shown = n
              if (n === WAVE_FRAME) setTalking(true)
            }, elapsed)
          )
        }
        elapsed += duration
      })
    })

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [stillOnly])

  // Once the new frame has faded in, hide the old one underneath.
  useEffect(() => {
    if (previous === null) return
    const t = setTimeout(() => setPrevious(null), FADE_MS + 20)
    return () => clearTimeout(t)
  }, [previous, frame])

  return (
    <div className={talking ? 'hero-dance talking' : 'hero-dance'}>
      <div
        className="hero-dance-frames"
        role="img"
        aria-label="An illustration of Soneri and Akhil dancing, then turning to wave hello"
      >
        {FRAMES.map((src, i) => {
          const n = i + 1
          const state = n === frame ? 'current' : n === previous ? 'previous' : ''
          return (
            <img
              key={src}
              src={src}
              alt=""
              className={state}
              style={{ '--fade': `${FADE_MS}ms` }}
              draggable="false"
            />
          )
        })}
      </div>

      {/* Real text, so it's crisp, translatable, and read by screen readers. */}
      <p className="hero-bubble hero-bubble-him">Welcome to our wedding website</p>
      <p className="hero-bubble hero-bubble-her">We’re excited to celebrate with you</p>
    </div>
  )
}
