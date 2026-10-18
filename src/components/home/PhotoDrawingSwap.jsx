// The main picture after login: the Central Park line drawing and the photo
// of the same moment, swapping back and forth.
//
// The swap is a "bloom": the photo spreads outward from the couple through
// the drawing until it fills the frame, holds, then gathers back into the
// couple as the drawing returns. It starts on the drawing and blooms within
// about a second, so guests see the change right away.
//
// The drawing (central-park-drawing.webp) was scaled and positioned to match
// the photo exactly (both are 2000 × 1333), so the couple stays in the same
// place throughout. The timing lives in index.css (look for "photo-bloom").
// A small button pauses it. With "reduce motion" on, guests see the photo only.
import { useEffect, useRef, useState } from 'react'

const base = import.meta.env.BASE_URL + 'assets/photos/'
const photo = base + 'central-park.jpg'
const photoSmall = base + 'central-park-1000.jpg'
const drawing = base + 'central-park-drawing.webp'
const drawingSmall = base + 'central-park-drawing-1000.webp'

// Where the couple stands in the 2000 × 1333 artwork: the bloom's center.
const COUPLE = { x: 1012, y: 880 }
const ART = { w: 2000, h: 1333 }

export default function PhotoDrawingSwap() {
  const [paused, setPaused] = useState(false)
  const frame = useRef(null)

  // The frame crops the artwork to fit the screen ("object-fit: cover"), so the
  // couple's on-screen position changes with the screen size. This works it out
  // and hands it to the CSS as --cx / --cy, plus --rmax (how big the bloom must
  // grow to reach the farthest corner).
  useEffect(() => {
    const el = frame.current
    const measure = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      const k = Math.max(w / ART.w, h / ART.h)
      const cx = w / 2 + (COUPLE.x - ART.w / 2) * k
      const cy = h / 2 + (COUPLE.y - ART.h / 2) * k
      const rmax = Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy))
      el.style.setProperty('--cx', `${cx}px`)
      el.style.setProperty('--cy', `${cy}px`)
      el.style.setProperty('--rmax', `${rmax + 200}px`) // + room for the soft edge
    }
    measure()
    // Re-measure whenever the frame changes size (window resized, phone rotated).
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={paused ? 'photo-swap paused' : 'photo-swap'} ref={frame}>
      {/* Bottom layer: the line drawing on paper. */}
      <div className="photo-swap-drawing" aria-hidden="true">
        <img src={drawing} srcSet={`${drawingSmall} 1000w, ${drawing} 2000w`} sizes="100vw" alt="" />
      </div>

      {/* Top layer: the photo, revealed through a growing soft-edged circle. */}
      <img
        className="photo-swap-photo"
        src={photo}
        // Phones download the smaller copy; big screens get the full one.
        srcSet={`${photoSmall} 1000w, ${photo} 2000w`}
        sizes="100vw"
        alt="Soneri and Akhil walking under an umbrella down a tree-lined path in Central Park"
      />

      <button
        type="button"
        className="photo-swap-toggle"
        onClick={() => setPaused(!paused)}
        aria-label={paused ? 'Resume switching between the photo and the drawing' : 'Pause switching between the photo and the drawing'}
      >
        {/* Small drawn icons: a triangle (play) or two bars (pause). */}
        <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
          {paused ? <path d="M2 1 L9 5 L2 9 Z" /> : <path d="M2 1 H4 V9 H2 Z M6 1 H8 V9 H6 Z" />}
        </svg>
      </button>
    </div>
  )
}
