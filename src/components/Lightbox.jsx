// A photo shown full screen over a dark-blue overlay, with arrows to step
// through the others and an × to close.
//   Close: the ×, the Escape key, or clicking the dark area around the photo.
//   Step: the arrows on either side, the left/right arrow keys, or a swipe.
// While it's open, the page behind it can't scroll, and the keyboard stays
// inside it. Closing it puts the keyboard focus back where it was.
// Usage: <Lightbox photos={photos} index={2} onIndex={setIndex} onClose={...} />
import { photoUrl } from './photoUrl.js'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function Lightbox({ photos, index, onIndex, onClose }) {
  const closeRef = useRef(null)
  const touch = useRef(null)
  const photo = photos[index]
  const step = (by) => onIndex((index + by + photos.length) % photos.length)

  // On open: focus the ×, stop the page from scrolling. On close: undo both.
  useEffect(() => {
    const before = document.activeElement
    const root = document.documentElement
    const overflow = root.style.overflow
    root.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      root.style.overflow = overflow
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
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${photos.length}`}
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
          <img key={photo.src} src={photoUrl(photo.src)} alt={photo.alt || photo.label} />
        ) : (
          <div key={photo.label} className="lightbox-placeholder">
            {photo.label}
          </div>
        )}
        <figcaption>
          {index + 1} / {photos.length}
        </figcaption>
      </figure>

      <button ref={closeRef} type="button" className="lightbox-close" aria-label="Close" onClick={onClose}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
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
    </div>,
    document.body
  )
}
