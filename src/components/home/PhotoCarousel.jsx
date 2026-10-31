// A full-width carousel of photos (House of Honey design).
// Swipe on phones, or use the arrows / dots. It moves on by itself every few
// seconds, pausing while you hover over it or interact with it, and not at all
// for people who have "reduce motion" turned on.
//
// To add a photo: put it in public/assets/photos/ and add it to SLIDES below.
// Slides with no "src" show a placeholder.
// The carousel fills the screen below the names, so wide screens crop the top
// and bottom of each photo. "focus" says which part to keep in view
// (left-right %, top-bottom %): '50% 50%' is the middle, '50% 100%' the bottom.
import { useEffect, useRef, useState } from 'react'

const base = import.meta.env.BASE_URL + 'assets/photos/'

const SLIDES = [
  {
    src: base + 'central-park.jpg',
    srcSet: `${base}central-park-1000.jpg 1000w, ${base}central-park.jpg 2000w`,
    alt: 'Soneri and Akhil walking under an umbrella down a tree-lined path in Central Park',
    focus: '50% 78%', // keep the two of us (lower middle) in view
  },
  { label: 'Photo 2' },
  { label: 'Photo 3' },
  { label: 'Photo 4' },
]

const AUTO_ADVANCE_MS = 5000

export default function PhotoCarousel() {
  const track = useRef(null)
  const [current, setCurrent] = useState(0)
  const [holding, setHolding] = useState(false) // true while hovered or focused

  // Scrolls to a slide (wrapping around at the ends).
  function goTo(index) {
    const n = (index + SLIDES.length) % SLIDES.length
    const el = track.current
    el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' })
  }

  // Keep the dots in step when the guest swipes.
  function onScroll() {
    const el = track.current
    setCurrent(Math.round(el.scrollLeft / el.clientWidth))
  }

  // Move on by itself every few seconds.
  useEffect(() => {
    if (holding || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setTimeout(() => goTo(current + 1), AUTO_ADVANCE_MS)
    return () => clearTimeout(timer)
  }, [current, holding])

  return (
    <div
      className="carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Photos of Soneri and Akhil"
      onMouseEnter={() => setHolding(true)}
      onMouseLeave={() => setHolding(false)}
      onFocus={() => setHolding(true)}
      onBlur={() => setHolding(false)}
    >
      {/* Each slide snaps into place when scrolled or swiped. */}
      <div className="carousel-track" ref={track} onScroll={onScroll}>
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className="carousel-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${SLIDES.length}`}
          >
            {slide.src ? (
              <img
                src={slide.src}
                srcSet={slide.srcSet}
                sizes="100vw"
                alt={slide.alt}
                loading={i ? 'lazy' : 'eager'}
                style={{ objectPosition: slide.focus }}
              />
            ) : (
              <div className="carousel-placeholder">{slide.label}</div>
            )}
          </div>
        ))}
      </div>

      <button type="button" className="carousel-arrow prev" onClick={() => goTo(current - 1)} aria-label="Previous photo">
        ←
      </button>
      <button type="button" className="carousel-arrow next" onClick={() => goTo(current + 1)} aria-label="Next photo">
        →
      </button>

      <div className="carousel-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            className={i === current ? 'active' : ''}
            onClick={() => goTo(i)}
            aria-label={`Show photo ${i + 1}`}
            aria-current={i === current}
          />
        ))}
      </div>
    </div>
  )
}
