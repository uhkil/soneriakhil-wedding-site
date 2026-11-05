// A spot for an illustration. Looks up the art by name in src/data/art.js.
//   - If that art has a file ("src"), it shows the image (with "tint", the
//     dark-blue drawing, sized to fit).
//   - If not, it shows a labeled placeholder in the right shape, so we can
//     judge size and placement before the real art exists.
// The side drawings with a little extra about us (a "nugget") use
// SideDrawing.jsx instead, which shows it in a dark strip beside them;
// NuggetContent below is what that strip says.
// Usage: <IllustrationSlot name="event-ceremony" size="large" />
// size: "small", "medium", or "large" (sets the maximum width).
// Drawings only download once the guest scrolls near them, so the top of the
// page loads first.
import { useRef, useState } from 'react'
import art from '../data/art.js'
import { useNearScreen } from './useNearScreen.js'
import { createPortal } from 'react-dom'
import Lightbox from './Lightbox.jsx'
import { srcSetFor } from './photoUrl.js'

export default function IllustrationSlot({ name, size = 'medium', className = '' }) {
  const item = art[name]
  const ref = useRef(null)
  const near = useNearScreen(ref)
  const image = near && item.src ? import.meta.env.BASE_URL + item.src : undefined

  return (
    <div
      ref={ref}
      className={`illustration-slot size-${size} ${className}`}
      // --art-width: the drawing's own width, so drawings in a group can
      // share one scale. --art-ratio: its shape (width ÷ height).
      // --art-adjust: "peopleSize" from art.js, so the people match in size.
      style={{
        aspectRatio: item.ratio,
        '--art-width': parseFloat(item.ratio),
        '--art-ratio': ratioValue(item.ratio),
        '--art-adjust': item.peopleSize ?? 1,
      }}
    >
      {item.src && item.tint ? (
        // The drawing, already in the dark blue (see "tint" in art.js).
        image && <img className="illustration-tint" src={image} alt="" aria-hidden="true" draggable="false" decoding="async" />
      ) : item.src ? (
        // import.meta.env.BASE_URL adds the site's folder name when it's online
        // (e.g. /soneriakhil-wedding-site/), so image paths work everywhere.
        // alt="" tells screen readers this art is decorative.
        <img src={import.meta.env.BASE_URL + item.src} alt="" loading="lazy" />
      ) : (
        <div className="slot-placeholder" aria-hidden="true">
          <span className="slot-name">{name}</span>
          <span className="slot-note">{item.note}</span>
          <span className="slot-ratio">{item.ratio.replace(' / ', ':')}</span>
        </div>
      )}
    </div>
  )
}

// "963 / 754" → 1.277...
function ratioValue(ratio) {
  const [w, h] = ratio.split('/').map(parseFloat)
  return w / h
}

// What a side drawing's strip says: heading, text, small photos, links.
export function NuggetContent({ nugget, headingId }) {
  return (
    <>
      {nugget.heading && (
        <p className="nugget-heading" id={headingId}>
          {nugget.heading}
        </p>
      )}
      {nugget.text && <p>{nugget.text}</p>}
      {nugget.gallery && <Carousel photos={nugget.gallery} />}
      {nugget.links && (
        <ul>
          {nugget.links.map((link) => (
            <li key={link.label} className={link.thin ? 'has-thin' : undefined}>
              {link.before}
              {link.href ? (
                <a href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ) : (
                link.label
              )}
              {link.thin && <span className="nugget-thin"> {link.thin}</span>}
              {link.note && <> {link.note}</>}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

// Photos shown one at a time, each as big as the card allows. Below it, the
// count ("2 / 10") with an arrow either side (the same small arrows as the
// Memories camera and grid); phones can also swipe. Clicking a photo opens
// it full screen.
// Each photo has a 600px copy in a "small" folder beside it (what the card
// shows: sharp even on iPhones at that size) and the full-size 1600px one,
// which only loads full screen.
const smallCopy = (src) => src.replace(/\/([^/]+)$/, '/small/$1')
const CAROUSEL_SIZES = '(max-width: 699px) 45vw, 260px'

function Carousel({ photos }) {
  const ref = useRef(null)
  const [current, setCurrent] = useState(0)
  // A photo opened full screen (its number), or null.
  const [open, setOpen] = useState(null)
  const fullScreen = photos
    .filter((piece) => typeof piece !== 'string')
    .map((piece) => ({ src: smallCopy(piece.src), thumb: smallCopy(piece.src), full: piece.src, alt: piece.alt, label: piece.alt }))
  // Keep the count in step with swiping.
  const onScroll = () => {
    const strip = ref.current
    setCurrent(Math.round(strip.scrollLeft / strip.clientWidth))
  }
  const goTo = (i) => {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ref.current.scrollTo({ left: i * ref.current.clientWidth, behavior: smooth ? 'smooth' : 'auto' })
  }

  const arrow = (direction) => (
    <button
      type="button"
      className="count-arrow"
      aria-label={direction === 'prev' ? 'Previous photo' : 'Next photo'}
      disabled={direction === 'prev' ? current === 0 : current === photos.length - 1}
      onClick={() => goTo(direction === 'prev' ? current - 1 : current + 1)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={direction === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  )

  // The photo, and below it how far along you are ("2 / 10") with an arrow
  // either side.
  return (
    <div className="nugget-carousel">
      <div className="nugget-carousel-row">
        <div className="nugget-carousel-window">
          <div ref={ref} className="nugget-carousel-strip" onScroll={onScroll}>
            {photos.map((piece, i) =>
              typeof piece === 'string' ? (
                <span key={piece} className="nugget-photo">
                  {piece}
                </span>
              ) : (
                // Clicking (or tapping) a photo opens it full screen.
                <button
                  key={piece.src}
                  type="button"
                  className="nugget-photo-button"
                  aria-label={`See full screen: ${piece.alt}`}
                  aria-hidden={i !== current}
                  tabIndex={i === current ? 0 : -1}
                  onClick={() => setOpen(i)}
                >
                  <img
                    className="nugget-photo"
                    src={import.meta.env.BASE_URL + smallCopy(piece.src)}
                    srcSet={srcSetFor([
                      [smallCopy(piece.src), 600],
                      [piece.src, 1600],
                    ])}
                    sizes={CAROUSEL_SIZES}
                    alt={piece.alt}
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                  />
                </button>
              )
            )}
          </div>
        </div>
      </div>
      <div className="camera-count memory-count carousel-count">
        {arrow('prev')}
        <span aria-live="polite">
          {current + 1} / {photos.length}
        </span>
        {arrow('next')}
      </div>
      {/* Full screen: attached to the page itself, so it covers the whole
          screen (not just the strip it was opened from). */}
      {open !== null &&
        createPortal(<Lightbox photos={fullScreen} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />, document.body)}
    </div>
  )
}
