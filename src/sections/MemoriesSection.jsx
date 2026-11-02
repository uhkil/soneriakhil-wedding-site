// A collection of photos, viewable three ways:
//   - "Film strip": all photos in a row on a drawn film strip across the whole
//     page, scrolling sideways
//   - "Camera" (shown first): one photo at a time on the screen of a drawn
//     camera; its left and right arrows step through them
//   - "Grid": pages of photos in rows; dots underneath show how many pages
//     there are and switch between them (phones can also swipe)
// Clicking any photo opens it full screen (Lightbox.jsx).
import Section from '../components/Section.jsx'
import { useEffect, useRef, useState } from 'react'
import PhotoSlot from '../components/PhotoSlot.jsx'
import Doodle from '../components/Doodle.jsx'
import IllustrationSlot from '../components/IllustrationSlot.jsx'
import Lightbox from '../components/Lightbox.jsx'

// The photos, in order. For now these are placeholder pictures (in
// public/assets/memories/) in a mix of shapes, to test how photos fit each
// view. Swap in the real ones the same way, e.g.
//   { label: 'First date', src: 'assets/memories/first-date.jpg', alt: 'Us at ...' },
const photos = Array.from({ length: 8 }, (_, i) => ({
  label: `Memory ${i + 1}`,
  src: `assets/memories/placeholder-${i + 1}.jpg`,
  alt: `Placeholder photo ${i + 1}`,
}))

const VIEWS = [
  { id: 'filmstrip', label: 'Film strip' },
  { id: 'camera', label: 'Camera' },
  { id: 'grid', label: 'Grid' },
]

export default function MemoriesSection() {
  // "useState" lets a component remember something that can change.
  // view = which view is showing; setView = the function that changes it.
  const [view, setView] = useState('camera')
  const viewIndex = VIEWS.findIndex((v) => v.id === view)
  // Which photo is open full screen (null = none).
  const [open, setOpen] = useState(null)

  return (
    <Section id="memories">
      {/* Corner art just above the title (see "corner-art" in index.css). */}
      <IllustrationSlot name="storyVignette" size="small" className="corner-art corner-art-right" />
      <h2>
        Memories <Doodle type="heart" size={28} />
      </h2>

      {/* The toggle: one pill with a highlight that slides to the chosen view. */}
      <div className="view-toggle" role="group" aria-label="How to view the photos" style={{ '--index': viewIndex }}>
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={view === v.id ? 'selected' : ''}
            aria-pressed={view === v.id}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* All three views are stacked in the same spot, with only the chosen
          one visible. The box is as tall as the tallest view, so switching
          views never moves the title, the toggle, or anything else. */}
      <div className="memories-viewer">
        <View id="filmstrip" view={view}>
          <FilmStrip onOpen={setOpen} />
        </View>
        <View id="camera" view={view}>
          <Camera onOpen={setOpen} />
        </View>
        <View id="grid" view={view}>
          <Grid onOpen={setOpen} />
        </View>
      </div>

      {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </Section>
  )
}

// A photo that opens full screen when clicked.
function OpenablePhoto({ index, onOpen, className = '' }) {
  const photo = photos[index]
  return (
    <button
      type="button"
      className={`photo-button ${className}`}
      aria-label={`${photo.label}: view full screen`}
      onClick={() => onOpen(index)}
    >
      <PhotoSlot {...photo} />
    </button>
  )
}

// How many photos fit on one page of the grid: 3 across and 2 down, or on
// phones 2 by 2. Updates if the screen is resized past that point.
const PHONE = '(max-width: 640px)'
function usePerPage() {
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE).matches)
  useEffect(() => {
    const query = window.matchMedia(PHONE)
    const onChange = () => setPhone(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return phone ? 4 : 6
}

// The grid: pages side by side in a row that scrolls sideways a whole page at
// a time (a swipe on phones). The dots underneath show which page is showing;
// clicking one goes to that page.
function Grid({ onOpen }) {
  const perPage = usePerPage()
  const pages = Array.from({ length: Math.ceil(photos.length / perPage) }, (_, p) =>
    photos.slice(p * perPage, (p + 1) * perPage).map((_, i) => p * perPage + i)
  )
  const ref = useRef(null)
  const [page, setPage] = useState(0)

  // Keep the dots in step with swiping.
  const onScroll = () => {
    const pager = ref.current
    setPage(Math.round(pager.scrollLeft / pager.clientWidth))
  }
  const goTo = (p) => {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ref.current.scrollTo({ left: p * ref.current.clientWidth, behavior: smooth ? 'smooth' : 'auto' })
  }

  return (
    <div className="memory-grid-wrap">
      <div ref={ref} className="memory-pages" onScroll={onScroll}>
        {pages.map((indexes, p) => (
          <div key={p} className="memory-grid" inert={p !== page} aria-hidden={p !== page}>
            {indexes.map((i) => (
              <OpenablePhoto key={i} index={i} onOpen={onOpen} className="memory-photo" />
            ))}
          </div>
        ))}
      </div>
      {pages.length > 1 && (
        <div className="memory-dots" role="group" aria-label="Pages of photos">
          {pages.map((_, p) => (
            <button
              key={p}
              type="button"
              className={p === page ? 'active' : ''}
              aria-label={`Page ${p + 1} of ${pages.length}`}
              aria-current={p === page}
              onClick={() => goTo(p)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// One of the views. The hidden ones still take up room (so the box stays the
// same height) but can't be seen, clicked, or reached with the keyboard.
function View({ id, view, children }) {
  const shown = id === view
  return (
    <div className={`memories-view memories-view-${id}${shown ? ' shown' : ''}`} inert={!shown} aria-hidden={!shown}>
      {children}
    </div>
  )
}

// The film strip: the drawn film frame (public/assets/art/film-frame.svg)
// repeated side by side, one frame per photo, starting at the left edge of
// the screen. Every frame holds a photo; only if there are too few photos to
// reach across the screen do empty frames fill the rest. Each photo sits in a
// box behind its frame's opening, so it scrolls along with the film.
// Ways to move along it: a mouse wheel or trackpad (up/down scrolls it
// sideways until either end, then the page carries on), clicking and dragging
// the film, the thin scroll bar, or the arrow keys once it's been clicked.
function FilmStrip({ onOpen }) {
  const ref = useRef(null)

  // The wheel: turn up/down scrolling into sideways scrolling.
  useEffect(() => {
    const strip = ref.current
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return // already sideways
      const by = e.deltaY * (e.deltaMode === 1 ? 16 : 1)
      const end = strip.scrollWidth - strip.clientWidth
      const atEnd = by < 0 ? strip.scrollLeft <= 0 : strip.scrollLeft >= end - 1
      if (atEnd) return // let the page scroll on
      e.preventDefault()
      strip.scrollLeft += by
    }
    strip.addEventListener('wheel', onWheel, { passive: false })
    return () => strip.removeEventListener('wheel', onWheel)
  }, [])

  // Click and drag (with a mouse; fingers already swipe it). It only counts
  // as a drag once the mouse has moved a few pixels, so a plain click still
  // opens the photo; the click that ends a drag is ignored.
  const drag = useRef(null)
  const dragged = useRef(false)
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, id: e.pointerId }
    dragged.current = false
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    if (!dragged.current && Math.abs(dx) > 5) {
      dragged.current = true
      ref.current.setPointerCapture(drag.current.id)
      ref.current.classList.add('dragging')
    }
    if (dragged.current) ref.current.scrollLeft = drag.current.left - dx
  }
  const onPointerUp = () => {
    drag.current = null
    ref.current.classList.remove('dragging')
  }

  const empty = (count) => Array.from({ length: count }, (_, i) => <div key={i} className="film-frame" />)

  return (
    <div
      ref={ref}
      className="filmstrip"
      tabIndex={0}
      role="region"
      aria-label="Photos on a film strip (scrolls sideways)"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDragStart={(e) => e.preventDefault()}
      onClickCapture={(e) => {
        if (dragged.current) {
          e.stopPropagation()
          dragged.current = false
        }
      }}
    >
      <div className="film-track">
        {photos.map((photo, i) => (
          <div key={photo.label} className="film-frame">
            <OpenablePhoto index={i} onOpen={onOpen} className="film-photo" />
          </div>
        ))}
        <div className="film-trail">{empty(6)}</div>
      </div>
    </div>
  )
}

// The drawn camera (public/assets/art/camera.svg, in the text color). The
// photo sits in the drawing's screen, and two invisible buttons sit over the
// arrows on its dial. The arrows pulse gently until the pointer is over the dial.
function Camera({ onOpen }) {
  // Which photo is showing (0 = the first one).
  const [current, setCurrent] = useState(0)

  // Step back or forward, wrapping around at either end.
  const step = (by) => setCurrent((current + by + photos.length) % photos.length)

  return (
    <div className="camera">
      <div className="camera-body">
        {/* The photo, in the camera's screen. */}
        <div className="camera-screen" aria-live="polite">
          <OpenablePhoto index={current} onOpen={onOpen} className="camera-photo" />
        </div>

        {/* The camera itself, drawn in the text color. */}
        <div
          className="camera-drawing"
          aria-hidden="true"
          style={{
            WebkitMaskImage: `url(${import.meta.env.BASE_URL}assets/art/camera.svg)`,
            maskImage: `url(${import.meta.env.BASE_URL}assets/art/camera.svg)`,
          }}
        />

        <div
          className="camera-dial"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') step(-1)
            if (e.key === 'ArrowRight') step(1)
          }}
        >
          <button type="button" className="camera-arrow camera-arrow-left" aria-label="Previous photo" onClick={() => step(-1)}>
            <svg viewBox="0 0 10 12" aria-hidden="true">
              <path d="M9 1 1 6l8 5z" />
            </svg>
          </button>
          <button type="button" className="camera-arrow camera-arrow-right" aria-label="Next photo" onClick={() => step(1)}>
            <svg viewBox="0 0 10 12" aria-hidden="true">
              <path d="M1 1l8 5-8 5z" />
            </svg>
          </button>
        </div>
      </div>

      <p className="camera-count">
        {current + 1} / {photos.length}
      </p>
    </div>
  )
}
