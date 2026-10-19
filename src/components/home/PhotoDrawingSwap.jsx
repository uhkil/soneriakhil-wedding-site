// The main picture after login: the Central Park photo and the line drawing
// of the same moment, dissolving back and forth.
//
// How it moves ("sketch over the photo"): the drawing's rust lines fade in on
// top of the photo while a paper-colored wash lightens the photo so the lines
// read; the photo keeps fading into the paper until only the drawing remains,
// then the same in reverse. Every step overlaps the next, so it's one smooth
// dissolve. The timing lives in index.css (look for "sketch-over").
//
// The drawing (central-park-drawing.webp) was scaled and positioned to match
// the photo exactly (both are 2000 × 1333), so the lines sit right on top of
// the couple, the lamps, and the trees.
// The bottom of the picture fades softly into the page's paper color.
// A small button pauses it. With "reduce motion" on, guests see the photo only.
import { useState } from 'react'

const base = import.meta.env.BASE_URL + 'assets/photos/'
const photo = base + 'central-park.jpg'
const photoSmall = base + 'central-park-1000.jpg'
const drawing = base + 'central-park-drawing.webp'
const drawingSmall = base + 'central-park-drawing-1000.webp'

export default function PhotoDrawingSwap() {
  const [paused, setPaused] = useState(false)

  return (
    <div className={paused ? 'photo-swap paused' : 'photo-swap'}>
      {/* Three layers, bottom to top: the photo, a paper-colored wash, the drawing's lines.
          They're grouped so the bottom of the whole picture can fade into the page. */}
      <div className="photo-swap-layers">
        <img
          className="photo-swap-photo"
          src={photo}
          // Phones download the smaller copy; big screens get the full one.
          srcSet={`${photoSmall} 1000w, ${photo} 2000w`}
          sizes="100vw"
          alt="Soneri and Akhil walking under an umbrella down a tree-lined path in Central Park"
        />
        <div className="photo-swap-wash" aria-hidden="true" />
        <img
          className="photo-swap-lines"
          src={drawing}
          srcSet={`${drawingSmall} 1000w, ${drawing} 2000w`}
          sizes="100vw"
          alt=""
          aria-hidden="true"
        />
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
