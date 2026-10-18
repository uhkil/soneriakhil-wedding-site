// The main picture after login: the Central Park photo, which every few
// seconds wipes into a line drawing of the same moment (left to right),
// then wipes back to the photo (right to left).
//
// The drawing (central-park-drawing.webp) was scaled and positioned to match
// the photo exactly (both are 2000 × 1333), so the couple stays in the same
// place while the picture changes around them.
// The timing lives in index.css (look for "photo-swap").
// A small button pauses the swapping. People who have "reduce motion" turned
// on see the photo without any swapping.
import { useState } from 'react'

const photo = import.meta.env.BASE_URL + 'assets/photos/central-park.jpg'
const photoSmall = import.meta.env.BASE_URL + 'assets/photos/central-park-1000.jpg'
const drawing = import.meta.env.BASE_URL + 'assets/photos/central-park-drawing.webp'
const drawingSmall = import.meta.env.BASE_URL + 'assets/photos/central-park-drawing-1000.webp'

export default function PhotoDrawingSwap() {
  const [paused, setPaused] = useState(false)

  return (
    <div className={paused ? 'photo-swap paused' : 'photo-swap'}>
      <img
        className="photo-swap-photo"
        src={photo}
        // Phones download the smaller copy; big screens get the full one.
        srcSet={`${photoSmall} 1000w, ${photo} 2000w`}
        sizes="100vw"
        alt="Soneri and Akhil walking under an umbrella down a tree-lined path in Central Park"
      />

      {/* The drawing layer sits on top (paper background + rust lines); the
          animation reveals and hides it. It's cropped exactly like the photo. */}
      <div className="photo-swap-drawing" aria-hidden="true">
        <img src={drawing} srcSet={`${drawingSmall} 1000w, ${drawing} 2000w`} sizes="100vw" alt="" />
      </div>

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
