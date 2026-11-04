// Words in a sentence that open a photo in a pop-up window: the photo (with
// an optional caption) centered over a light overlay. The ×, the Escape key,
// or a tap on the overlay closes it. Without a photo yet, it shows a
// placeholder.
//
// Usage: <PhotoLink photo="assets/story/blueberry-farm.jpg" alt="…">blueberry farm</PhotoLink>
// (Leave "photo" out for the placeholder.)
import { useRef } from 'react'

export default function PhotoLink({ children, photo, alt, caption }) {
  const dialog = useRef(null)
  const close = () => dialog.current?.close()
  const label = alt || (typeof children === 'string' ? children : 'Photo')

  return (
    <>
      <button type="button" className="photo-link" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
        {children}
      </button>
      <dialog
        ref={dialog}
        className="photo-modal"
        aria-label={label}
        // A tap on the overlay lands on the dialog itself, outside the card.
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        {/* The card takes focus when it opens (rather than the ×, which would
            show a focus ring on every tap). */}
        <figure className="photo-modal-card" tabIndex={-1} autoFocus>
          <button type="button" className="nugget-modal-close" aria-label="Close" onClick={close}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
          {photo ? (
            <img src={import.meta.env.BASE_URL + photo} alt={label} />
          ) : (
            <span className="photo-modal-placeholder">{label} — photo coming soon</span>
          )}
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      </dialog>
    </>
  )
}
