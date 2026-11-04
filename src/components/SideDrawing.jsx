// One of the side drawings of the two of us (hiking, pottery, museum,
// coffee date, basketball), just above a section's title, on the left or
// right of the page.
//
// It sits in a strip that runs across the whole screen. When the drawing is
// scrolled to the middle of the screen, the strip turns dark blue, the
// drawing turns light blue, and its little extra about us (the "nugget" in
// src/data/art.js: a heading, text, a list of links, or photos) fades in on
// the other side, in light blue. Once the strip has scrolled away, it goes
// back to the plain page. Tabbing to one of its links turns it on too.
//
// Usage: <SideDrawing name="hikingDate" side="right" />
import { useEffect, useRef, useState } from 'react'
import art from '../data/art.js'
import { useNearScreen } from './useNearScreen.js'
import { NuggetContent } from './IllustrationSlot.jsx'

export default function SideDrawing({ name, side = 'right' }) {
  const item = art[name]
  const ref = useRef(null)
  const near = useNearScreen(ref)
  const lit = useLit(ref)
  const url = (src) => (near && src ? import.meta.env.BASE_URL + src : undefined)

  return (
    <div
      ref={ref}
      className={`side-drawing side-${side}${lit ? ' lit' : ''}`}
      // The drawing's own width and shape, and "peopleSize" from art.js (so
      // the two of us come out the same size in every drawing).
      style={{
        '--art-width': parseFloat(item.ratio),
        '--art-ratio': ratioValue(item.ratio),
        '--art-adjust': item.peopleSize ?? 1,
      }}
    >
      <div className="side-drawing-inner">
        {/* The drawing: the dark-blue one, with the light-blue copy on top
            that fades in when the strip turns dark. */}
        <div className="side-drawing-art" role="img" aria-label={item.note} style={{ aspectRatio: item.ratio }}>
          {url(item.src) && <img className="side-art-dark" src={url(item.src)} alt="" draggable="false" decoding="async" />}
          {url(item.lightSrc) && <img className="side-art-light" src={url(item.lightSrc)} alt="" draggable="false" decoding="async" />}
        </div>
        {item.nugget && (
          <div className="side-drawing-text">
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

// On once the middle of the strip reaches the middle part of the screen
// (between 20% and 80% of the way down); off again once almost all of it
// has scrolled off the screen. (On and off at different points, so it
// doesn't flicker while a guest reads it.)
function useLit(ref) {
  const [lit, setLit] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    let frame = 0
    const check = () => {
      frame = 0
      const r = element.getBoundingClientRect()
      const screen = window.innerHeight
      const middle = (r.top + r.bottom) / 2
      const showing = Math.min(r.bottom, screen) - Math.max(r.top, 0)
      setLit((on) => {
        if (!on) return middle > screen * 0.2 && middle < screen * 0.8
        return showing > Math.min(r.height, screen) * 0.15
      })
    }
    const soon = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }
    const onFocus = () => setLit(true)
    check()
    window.addEventListener('scroll', soon, { passive: true })
    window.addEventListener('resize', soon)
    element.addEventListener('focusin', onFocus)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', soon)
      window.removeEventListener('resize', soon)
      element.removeEventListener('focusin', onFocus)
    }
  }, [ref])
  return lit
}
