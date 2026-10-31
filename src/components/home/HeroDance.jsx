// The Home picture for the "Cream" design: Soneri and Akhil, drawn as a short
// frame-by-frame animation.
//   1. They dance: swaying through frames 1–3, then leaning in (frame 4).
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

// The order the frames play in: [frame, how long it stays up (ms), how long
// it takes to fade in over the last one (ms)]. Edit these to change the pacing.
//   - The dance sways back and forth through frames 1, 3, 2, 3 (the three
//     closest poses), so it never jumps.
//   - Frame 4 (leaning in) is redrawn more than the others, so it's used once,
//     held a little longer and faded in slowly, as a quiet moment.
const SWAY = [
  [1, 420, 160],
  [3, 420, 160],
  [2, 420, 160],
  [3, 420, 160],
]
const SEQUENCE = [
  ...SWAY,
  ...SWAY,
  [1, 420, 160],
  [4, 1100, 420], // leaning in
  [5, 380, 360], // turning toward you
  [6, 340, 160],
  [7, 380, 200],
  [8, 380, 240], // the wave (the bubbles appear here)
  [9, 360, 160],
  [8, 360, 160],
  [9, 0, 160], // stop here
]
const WAVE_FRAME = 8
const LAST_FRAME = 9

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function HeroDance() {
  const stillOnly = prefersReducedMotion()
  const [frame, setFrame] = useState(stillOnly ? LAST_FRAME : 1)
  const [previous, setPrevious] = useState(null) // the frame fading out underneath
  const [fade, setFade] = useState(160) // how long the current frame takes to fade in
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
      SEQUENCE.forEach(([n, duration, fadeMs], i) => {
        if (i > 0) {
          timers.push(
            setTimeout(() => {
              if (cancelled) return
              setPrevious(shown)
              setFade(fadeMs)
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
    const t = setTimeout(() => setPrevious(null), fade + 20)
    return () => clearTimeout(t)
  }, [previous, frame, fade])

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
              style={{ '--fade': `${fade}ms` }}
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
