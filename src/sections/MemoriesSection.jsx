// A collection of photos, viewable three ways:
//   - "Film strip" (shown first): all photos in a row on a drawn film strip
//     across the whole page, scrolling sideways
//   - "Camera": one photo at a time on the screen of a drawn
//     camera; its left and right arrows step through them
//   - "Grid": pages of photos in rows; dots underneath show how many pages
//     there are and switch between them (phones can also swipe)
// Clicking any photo opens it full screen (Lightbox.jsx).
import Section from '../components/Section.jsx'
import { useEffect, useRef, useState } from 'react'
import PhotoSlot from '../components/PhotoSlot.jsx'
import IllustrationSlot from '../components/IllustrationSlot.jsx'
import Lightbox from '../components/Lightbox.jsx'
import Art from '../components/Art.jsx'
import sizes from '../assets/memories/sizes.json'
import SideDrawing from '../components/SideDrawing.jsx'

// The photos: every picture in src/assets/memories/, found automatically, so
// adding or deleting a file there is all it takes (no list to edit). File
// names don't matter. They're shuffled into a new random order each time
// the page is opened or refreshed, the same order in all three views.
// The pictures there are web-sized copies of the originals, and sizes.json
// has each one's width and height (both made by scripts/sync-memories.sh).
// Each photo also has a smaller copy in memories/small/ (1000px on its long
// side: still sharp on every screen, including iPhones, at the size the
// film strip and grid show them, and about half the download). The
// full-size copy is only loaded when a photo is opened full screen.
const files = import.meta.glob('../assets/memories/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
})
const smallFiles = import.meta.glob('../assets/memories/small/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
})
const smallByName = Object.fromEntries(Object.entries(smallFiles).map(([path, src]) => [path.split('/').pop(), src]))

// Portrait photos get a tall tile in the grid (two rows high).
const isTall = ({ width, height }) => height > width * 1.1

const shuffled = shuffle(
  Object.entries(files).map(([path, src]) => {
    const name = path.split('/').pop()
    const [width, height] = sizes[name] ?? [4, 3]
    // src: what the film strip and grid show; full: the full-screen view.
    return { src: smallByName[name] ?? src, full: src, width, height, alt: 'A photo of Soneri and Akhil' }
  })
)

// The grid is made of columns, each holding either one portrait photo or two
// landscape ones (one above the other). Pairing up the landscape photos
// changes the shuffled order a little, so every view uses this order, and
// the full-screen view steps through them in the same order as the grid.
const columns = []
let waiting = null // a column with one landscape photo, waiting for a second
for (const photo of shuffled) {
  if (isTall(photo)) columns.push([photo])
  else if (waiting) {
    waiting.push(photo)
    waiting = null
  } else {
    waiting = [photo]
    columns.push(waiting)
  }
}
const photos = columns.flat().map((photo, i) => ({ ...photo, label: `Memory ${i + 1}` }))
const columnIndexes = []
{
  let i = 0
  for (const column of columns) columnIndexes.push(column.map(() => i++))
}

// Fisher–Yates: every order is equally likely.
function shuffle(list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// The shape (width ÷ height) of the opening each view puts photos in. A
// photo much narrower or wider than its opening is shown whole, on a blurred
// copy of itself (see PhotoSlot.jsx), instead of being cropped to fit.
const FRAME = {
  filmstrip: 3 / 2, // the drawn film frame's opening
  camera: 1.55, // the drawn camera's screen
  gridWide: 4 / 3, // a landscape tile in the grid
  gridTall: 0.65, // a portrait tile (two rows high)
}

const VIEWS = [
  { id: 'filmstrip', label: 'Film strip' },
  { id: 'camera', label: 'Camera' },
  { id: 'grid', label: 'Grid' },
]

export default function MemoriesSection() {
  // "useState" lets a component remember something that can change.
  // view = which view is showing; setView = the function that changes it.
  const [view, setView] = useState('filmstrip') // the film strip shows first
  const viewIndex = VIEWS.findIndex((v) => v.id === view)
  // Which photo is open full screen (null = none).
  const [open, setOpen] = useState(null)

  return (
    <Section id="memories">
      {/* A side drawing just above the title, in its dark strip (see SideDrawing.jsx). */}
      <SideDrawing name="hikingDate" side="right" />
      <h2>
        {/* The word stays centered on the page, between the two of us: Akhil on
            the left taking a photo of Soneri on the right. */}
        <span className="title-word">
          <Art file="photoshoot-boy.webp" className="title-side title-left title-photographer" />
          Memories
          <Art file="photoshoot-girl.webp" className="title-side title-right title-subject" />
        </span>
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
          one visible. The box is as tall as the chosen view (so the space
          below it is always even); switching never moves the title or toggle. */}
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
function OpenablePhoto({ index, onOpen, frame, className = '', style }) {
  const photo = photos[index]
  return (
    <button
      type="button"
      className={`photo-button ${className}`}
      aria-label={`${photo.label}: view full screen`}
      onClick={() => onOpen(index)}
      style={style}
    >
      <PhotoSlot {...photo} frame={frame} />
    </button>
  )
}

// How many columns fit on one page of the grid: 3, or 2 on phones (under
// 700px; see "Screen sizes" at the top of index.css). Each column is one
// portrait photo or two landscape ones. Updates if the screen is resized
// past that point.
const PHONE = '(max-width: 699px)'
// Past this many pages, the grid shows a page count instead of dots.
const MAX_DOTS = 8
function useColumnsPerPage() {
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE).matches)
  useEffect(() => {
    const query = window.matchMedia(PHONE)
    const onChange = () => setPhone(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return phone ? 2 : 3
}

// The grid: pages side by side in a row that scrolls sideways a whole page at
// a time (a swipe on phones). The dots underneath show which page is showing;
// clicking one goes to that page.
function Grid({ onOpen }) {
  const perPage = useColumnsPerPage()
  const pages = Array.from({ length: Math.ceil(columnIndexes.length / perPage) }, (_, p) =>
    columnIndexes.slice(p * perPage, (p + 1) * perPage)
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
            {/* Each column: one tall photo filling both rows, or two wide ones. */}
            {indexes.flatMap((column, c) =>
              column.map((i, row) => {
                const tall = column.length === 1 && isTall(photos[i])
                return (
                  <OpenablePhoto
                    key={i}
                    index={i}
                    onOpen={onOpen}
                    frame={tall ? FRAME.gridTall : FRAME.gridWide}
                    className={tall ? 'memory-photo tall' : 'memory-photo'}
                    style={{ gridColumn: c + 1, gridRow: tall ? '1 / span 2' : row + 1 }}
                  />
                )
              })
            )}
          </div>
        ))}
      </div>
      {/* A few pages: a dot for each. Lots of pages (too many dots to fit):
          "3 / 34" with arrows either side, like the camera's count. */}
      {pages.length > 1 && pages.length <= MAX_DOTS && (
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
      {pages.length > MAX_DOTS && (
        <div className="camera-count memory-count">
          <button type="button" className="count-arrow" aria-label="Previous page" disabled={page === 0} onClick={() => goTo(page - 1)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <span>
            {page + 1} / {pages.length}
          </span>
          <button
            type="button"
            className="count-arrow"
            aria-label="Next page"
            disabled={page === pages.length - 1}
            onClick={() => goTo(page + 1)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
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

// The film strip: the drawn film frame (public/assets/art/film-frame.webp)
// repeated side by side, one frame per photo, starting at the left edge of
// the screen. Every frame holds a photo; only if there are too few photos to
// reach across the screen do empty frames fill the rest. Each photo sits in a
// box behind its frame's opening, so it scrolls along with the film.
// Ways to move along it: a sideways trackpad swipe (or shift + mouse wheel),
// clicking and dragging the film, the thin scroll bar, the arrow keys once
// it's been clicked, or a finger swipe on phones and tablets. Scrolling up
// and down always scrolls the page (with 78 photos, turning it into sideways
// scrolling made the page feel stuck).
function FilmStrip({ onOpen }) {
  const ref = useRef(null)

  // The frames are sized so the photo at the right edge is always cut off
  // (about 40% of its frame showing): an obvious sign there's more to see.
  // Of the sizes that do that, it picks the one closest to the usual frame
  // size (--film-w in index.css), and redoes it when the screen changes size.
  useEffect(() => {
    const strip = ref.current
    const PEEK = 0.4
    const fit = () => {
      strip.style.removeProperty('--film-w') // back to the usual size, to measure it
      const usual = strip.querySelector('.film-frame')?.getBoundingClientRect().width
      const across = strip.clientWidth
      if (!usual || !across) return
      const fits = across / usual
      const sizes = [Math.floor(fits - PEEK), Math.ceil(fits - PEEK)]
        .filter((whole) => whole >= 1)
        .map((whole) => across / (whole + PEEK))
        .sort((a, b) => Math.abs(a - usual) - Math.abs(b - usual))
      if (sizes.length) strip.style.setProperty('--film-w', `${Math.floor(sizes[0])}px`)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(strip)
    return () => observer.disconnect()
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

  // The drawn frame, on top of each frame's photo box.
  const frameArt = <Art file="film-frame.webp" className="film-frame-art" />
  const empty = (count) =>
    Array.from({ length: count }, (_, i) => (
      <div key={i} className="film-frame">
        {frameArt}
      </div>
    ))

  // The scroll bar under the strip: where the thumb sits and how long it is
  // (shares of the bar), and whether it's showing (for a moment after each
  // scroll; CSS also shows it while the pointer is over the strip).
  const barRef = useRef(null)
  const [bar, setBar] = useState({ left: 0, width: 1 })
  const [showBar, setShowBar] = useState(false)
  const hideTimer = useRef(null)
  const measure = () => {
    const strip = ref.current
    if (!strip) return
    setBar({ left: strip.scrollLeft / strip.scrollWidth, width: strip.clientWidth / strip.scrollWidth })
  }
  useEffect(() => {
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(ref.current)
    return () => {
      observer.disconnect()
      clearTimeout(hideTimer.current)
    }
  }, [])
  const onScroll = () => {
    measure()
    setShowBar(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowBar(false), 1200)
  }
  // Dragging the bar (or clicking a spot on it) moves the strip to match.
  const barDrag = useRef(null)
  const scrollToBar = (clientX, grabAt) => {
    const strip = ref.current
    const box = barRef.current.getBoundingClientRect()
    const share = (clientX - box.left) / box.width - grabAt
    strip.scrollLeft = share * strip.scrollWidth
  }
  const onBarDown = (e) => {
    const box = barRef.current.getBoundingClientRect()
    const at = (e.clientX - box.left) / box.width
    // Grabbing the thumb keeps it under the pointer; clicking elsewhere centers it there.
    const onThumb = at >= bar.left && at <= bar.left + bar.width
    barDrag.current = { grabAt: onThumb ? at - bar.left : bar.width / 2 }
    barRef.current.setPointerCapture(e.pointerId)
    scrollToBar(e.clientX, barDrag.current.grabAt)
  }
  const onBarMove = (e) => barDrag.current && scrollToBar(e.clientX, barDrag.current.grabAt)
  const onBarUp = () => {
    barDrag.current = null
  }

  return (
    <div className={showBar ? 'filmstrip-wrap show-bar' : 'filmstrip-wrap'}>
    <div
      ref={ref}
      className="filmstrip"
      onScroll={onScroll}
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
            <OpenablePhoto index={i} onOpen={onOpen} frame={FRAME.filmstrip} className="film-photo" />
            {frameArt}
          </div>
        ))}
        <div className="film-trail">{empty(6)}</div>
      </div>
    </div>
    {/* The scroll bar (drawn by the site, so it looks the same in every
        browser): shows while the pointer is over the strip or it's scrolling. */}
    <div className="film-scrollbar" ref={barRef} onPointerDown={onBarDown} onPointerMove={onBarMove} onPointerUp={onBarUp} onPointerCancel={onBarUp} aria-hidden="true">
      <div className="film-scrollbar-thumb" style={{
          // (kept inside the bar at the far end, even when its minimum size makes it longer)
          left: `min(${bar.left * 100}%, calc(100% - max(${bar.width * 100}%, 32px)))`,
          width: `${bar.width * 100}%`,
        }} />
    </div>
    </div>
  )
}

// The drawn camera (public/assets/art/camera.webp, in the dark blue). The
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
          <OpenablePhoto index={current} onOpen={onOpen} frame={FRAME.camera} className="camera-photo" />
        </div>

        {/* The camera itself, drawn in the text color. */}
        <Art file="camera.webp" className="camera-drawing" />

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

      {/* The count, with arrows on either side that show while the pointer
          is over the camera (always on touch screens). */}
      <div className="camera-count">
        <button type="button" className="count-arrow" aria-label="Previous photo" onClick={() => step(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <span>
          {current + 1} / {photos.length}
        </span>
        <button type="button" className="count-arrow" aria-label="Next photo" onClick={() => step(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
