// A photo shown full screen over a dark-blue overlay, with arrows to step
// through the others and an × to close.
//   Close: the ×, the Escape key, or clicking the dark area around the photo.
//   Step: the arrows on either side, the left/right arrow keys, or a swipe.
// While it's open, the page behind it can't scroll, and the keyboard stays
// inside it. Closing it puts the keyboard focus back where it was.
// With just one photo: no arrows, no count, no swiping (only that photo).
// Usage: <Lightbox photos={photos} index={2} onIndex={setIndex} onClose={...} />
import { photoUrl } from './photoUrl.js'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function Lightbox({ photos, index, onIndex, onClose }) {
  const closeRef = useRef(null)
  const touch = useRef(null)
  const photo = photos[index]
  const several = photos.length > 1
  const step = (by) => several && onIndex((index + by + photos.length) % photos.length)

  // Once this photo has loaded in full, the next one's full-size copy starts
  // downloading, so stepping forward shows it sharp right away (just the
  // next one, to go easy on phone data).
  const preloadNext = () => {
    const next = several && photos[(index + 1) % photos.length]
    if (next?.full) new Image().src = photoUrl(next.full)
  }

  // iPhones ignore the "no scrolling" below for a finger dragging on the
  // overlay, so a one-finger drag there is stopped by hand (left/right swipes
  // between photos still work: they're read when the finger lifts). Two
  // fingers still pinch to zoom.
  const overlay = useRef(null)
  useEffect(() => {
    const el = overlay.current
    const stop = (e) => e.touches.length === 1 && e.cancelable && e.preventDefault()
    el.addEventListener('touchmove', stop, { passive: false })
    return () => el.removeEventListener('touchmove', stop)
  }, [])

  // On open: focus the ×, stop the page from scrolling. On close: undo both.
  useEffect(() => {
    const before = document.activeElement
    const root = document.documentElement
    const overflow = root.style.overflow
    const padding = root.style.paddingRight
    // Older browsers without "scrollbar-gutter" (see index.css): make up
    // for the scrollbar disappearing, so the page doesn't shift sideways.
    const bar = window.innerWidth - root.clientWidth
    if (bar > 0 && !CSS.supports?.('scrollbar-gutter', 'stable')) root.style.paddingRight = `${bar}px`
    root.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      root.style.overflow = overflow
      root.style.paddingRight = padding
      before?.focus?.({ preventScroll: true })
    }
  }, [])

  function onKeyDown(e) {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') step(-1)
    if (e.key === 'ArrowRight') step(1)
    // Keep Tab moving between the three buttons.
    if (e.key === 'Tab') {
      const buttons = [...e.currentTarget.querySelectorAll('button')]
      const at = buttons.indexOf(document.activeElement)
      const next = (at + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length
      buttons[next].focus()
      e.preventDefault()
    }
  }

  return createPortal(
    <div
      ref={overlay}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={several ? `Photo ${index + 1} of ${photos.length}` : photo.alt || 'Photo'}
      onKeyDown={onKeyDown}
      // A click on the dark area (not the photo or a button) closes it.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (touch.current ?? 0)
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
      }}
    >
      <figure className="lightbox-figure" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {photo.src ? (
          // The full-size copy if there is one (e.g. Memories photos), shown
          // over a small copy (quick to load, or already loaded) while it
          // downloads, so it's never blank.
          <img
            key={photo.src}
            src={photoUrl(photo.full ?? photo.src)}
            alt={photo.alt || photo.label}
            onLoad={preloadNext}
            style={photo.full ? { backgroundImage: `url(${photoUrl(photo.thumb ?? photo.src)})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' } : undefined}
          />
        ) : (
          <div key={photo.label} className="lightbox-placeholder">
            {photo.label}
          </div>
        )}
        {several && (
          <figcaption>
            {index + 1} / {photos.length}
          </figcaption>
        )}
      </figure>

      <button ref={closeRef} type="button" className="lightbox-close" aria-label="Close" onClick={onClose}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
      {several && (
        <>
      <button type="button" className="lightbox-arrow lightbox-prev" aria-label="Previous photo" onClick={() => step(-1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <button type="button" className="lightbox-arrow lightbox-next" aria-label="Next photo" onClick={() => step(1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
        </>
      )}
    </div>,
    document.body
  )
}
