// Words in a sentence that open a photo: the photo, whole, over the same
// light overlay as the full-screen view of the other photos (Lightbox.jsx),
// just that one photo (no arrows to others). The ×, the Escape key, or a
// tap around the photo closes it. Without a photo yet, it shows a
// placeholder.
//
// Usage: <PhotoLink photo="assets/story/links/blueberry-farm.jpg" alt="…">blueberry farm</PhotoLink>
// (Leave "photo" out for the placeholder.)
import { useState } from 'react'
import Lightbox from './Lightbox.jsx'

export default function PhotoLink({ children, photo, alt }) {
  const [open, setOpen] = useState(false)
  const label = alt || (typeof children === 'string' ? children : 'Photo')

  return (
    <>
      {/* Plain inline text that acts as a button (not a <button>: Safari keeps
          a <button> in one piece, so a line could break between it and the
          "(" before it or the "," after it). Tap, click, Enter or Space opens it. */}
      <span
        role="button"
        tabIndex={0}
        className="photo-link"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(true)
          }
        }}
      >
        {children}
      </span>
      {open && <Lightbox photos={[{ src: photo, alt: label, label: `${label} — photo coming soon` }]} index={0} onIndex={() => {}} onClose={() => setOpen(false)} />}
    </>
  )
}
