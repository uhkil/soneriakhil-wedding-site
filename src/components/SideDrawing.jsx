// One of the side drawings of the two of us (hiking, pottery, museum,
// coffee date, basketball), just above a section's title, on the left or
// right of the page.
//
// It sits in a strip that runs across the whole screen. The strip turns dark
// blue to break up the page, with the drawing's little extra about us (the
// "nugget" in src/data/art.js: a heading, text, a list of links, or photos)
// in light blue on the other side. The drawing keeps its own colors, on a
// soft, wavy light-blue shape (the page's color, so it's only noticeable
// once the strip is dark around it).
// On every screen size, it opens as the drawing is scrolled up to the middle
// of the screen, a little more with every bit of scrolling (and closes again
// scrolling back down the page).
//
// Usage: <SideDrawing name="hikingDate" side="right" />
import { useEffect, useMemo, useRef } from 'react'
import art from '../data/art.js'
import { useNearScreen } from './useNearScreen.js'
import { NuggetContent } from './IllustrationSlot.jsx'

export default function SideDrawing({ name, side = 'right' }) {
  const item = art[name]
  const ref = useRef(null)
  const near = useNearScreen(ref)
  useScrollReveal(ref)
  const blob = useMemo(() => blobPath(name), [name])

  return (
    <div
      ref={ref}
      className={`side-drawing side-${side}`}
      // The drawing's own width and shape, and "peopleSize" from art.js (so
      // the two of us come out the same size in every drawing).
      style={{
        '--art-width': parseFloat(item.ratio),
        '--art-ratio': ratioValue(item.ratio),
        '--art-adjust': item.peopleSize ?? 1,
      }}
    >
      {/* The dark-blue strip itself, behind everything (see .side-strip). */}
      <div className="side-strip" aria-hidden="true" />
      <div className="side-drawing-inner">
        <div className="side-drawing-art" role="img" aria-label={item.note} style={{ aspectRatio: item.ratio }}>
          {/* The soft light-blue shape around the drawing. */}
          <svg className="side-blob" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d={blob} />
          </svg>
          {near && item.src && (
            <img src={import.meta.env.BASE_URL + item.src} alt="" draggable="false" decoding="async" />
          )}
        </div>
        {item.nugget && (
          <div className={`side-drawing-text${item.nugget.gallery ? ' has-gallery' : ''}`}>
            <NuggetContent nugget={item.nugget} />
          </div>
        )}
      </div>
    </div>
  )
}

// "963 / 754" → 1.277...
function ratioValue(ratio) {
  const [w, h] = ratio.split('/').map(parseFloat)
  return w / h
}

// How far open the strip is (--reveal, 0 to 1), from where the drawing is on
// the screen: closed while its middle is in the bottom 15% of the screen,
// opening as it's scrolled up, fully open once it reaches the middle. "open"
// lets its links be clicked or tapped once it's mostly open.
function useScrollReveal(ref) {
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const art = element.querySelector('.side-drawing-art')
    let frame = 0
    const update = () => {
      frame = 0
      const r = art.getBoundingClientRect()
      const middle = (r.top + r.bottom) / 2 / window.innerHeight // 0 = top of screen, 1 = bottom
      const reveal = Math.min(1, Math.max(0, (0.85 - middle) / (0.85 - 0.5)))
      element.style.setProperty('--reveal', reveal.toFixed(3))
      element.classList.toggle('open', reveal > 0.6)
    }
    const soon = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', soon, { passive: true })
    window.addEventListener('resize', soon)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', soon)
      window.removeEventListener('resize', soon)
    }
  }, [ref])
}

// A soft, wavy outline (in a 100 × 100 box), a little different for each
// drawing: 12 points around a rounded square (a "squircle", so even the
// drawing's corners stay inside it), each pushed in a little, joined with
// smooth curves.
function blobPath(seedText) {
  let seed = [...seedText].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7)
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 2 ** 32
  }
  const count = 12
  const points = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (random() - 0.5) * 0.2
    const squish = (v) => Math.sign(v) * Math.sqrt(Math.abs(v)) // rounded-square shape
    const radius = 50 * (0.95 + random() * 0.05) // gently wavy
    return [50 + squish(Math.cos(angle)) * radius, 50 + squish(Math.sin(angle)) * radius]
  })
  // Smooth curves through the points (Catmull-Rom, as Bézier curves).
  const at = (i) => points[(i + count) % count]
  let d = `M${at(0)[0].toFixed(2)},${at(0)[1].toFixed(2)}`
  for (let i = 0; i < count; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1.map((v) => v.toFixed(2)).join(',')} ${c2.map((v) => v.toFixed(2)).join(',')} ${p2.map((v) => v.toFixed(2)).join(',')}`
  }
  return d + 'Z'
}
