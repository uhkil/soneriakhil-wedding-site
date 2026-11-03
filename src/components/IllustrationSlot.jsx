// A spot for an illustration. Looks up the art by name in src/data/art.js.
//   - If that art has a file ("src"), it shows the image (with "tint", the
//     dark-blue drawing, sized to fit).
//   - If not, it shows a labeled placeholder in the right shape, so we can
//     judge size and placement before the real art exists.
//   - If the art has a "nugget", that little extra about us shows:
//       tablets and laptops: as a card that pops up beside the drawing when
//         hovering over it (or tapping it, or tabbing to it)
//       phones (under 700px): as a pop-up window (modal) in the middle of the
//         screen, over a light overlay, with an × to close it. A "click me to
//         learn more" hint appears above the drawing once it has been
//         scrolled to the middle of the screen, for 2.5 seconds.
// Usage: <IllustrationSlot name="heroCouple" size="large" />
// size: "small", "medium", or "large" (sets the maximum width).
// Drawings only download once the guest scrolls near them, so the top of the
// page loads first.
import { useEffect, useId, useRef, useState } from 'react'
import art from '../data/art.js'
import { useNearScreen } from './useNearScreen.js'

// Phone width (see "Screen sizes" at the top of index.css).
const PHONE = '(max-width: 699px)'

export default function IllustrationSlot({ name, size = 'medium', className = '' }) {
  const item = art[name]
  const nugget = item.nugget
  const ref = useRef(null)
  const dialog = useRef(null)
  const near = useNearScreen(ref)
  const hinted = useInMiddle(ref, Boolean(nugget))
  const image = near && item.src ? import.meta.env.BASE_URL + item.src : undefined

  // On phones, tapping the drawing (or Enter / Space) opens the pop-up window.
  const isPhone = () => window.matchMedia(PHONE).matches
  const openModal = () => {
    if (nugget && isPhone()) dialog.current?.showModal()
  }

  return (
    <div
      ref={ref}
      className={`illustration-slot size-${size} ${className}${nugget ? ' has-nugget' : ''}${hinted ? ' hinted' : ''}`}
      // With a nugget, it can be reached with the keyboard (and tapped on phones).
      tabIndex={nugget ? 0 : undefined}
      aria-label={nugget ? `${item.note}. ${nugget.heading ?? 'A fun fact'}` : undefined}
      onClick={openModal}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ') && isPhone()) {
          e.preventDefault()
          openModal()
        }
      }}
      // --art-width: the drawing's own width, so drawings in a group (e.g.
      // "corner-art" in index.css) can share one scale. --art-ratio: its
      // shape (width ÷ height), used to work out its height on phones.
      style={{ aspectRatio: item.ratio, '--art-width': parseFloat(item.ratio), '--art-ratio': ratioValue(item.ratio) }}
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
      {nugget && (
        <>
          {/* Phones only (index.css hides it elsewhere). */}
          <span className="nugget-hint" aria-hidden="true">
            click me to learn more
          </span>
          <Nugget nugget={nugget} />
          <NuggetModal nugget={nugget} dialog={dialog} />
        </>
      )}
    </div>
  )
}

// "963 / 754" → 1.277...
function ratioValue(ratio) {
  const [w, h] = ratio.split('/').map(parseFloat)
  return w / h
}

// How long the "click me to learn more" hint stays up, in milliseconds.
const HINT_TIME = 2500

// True for HINT_TIME once the element first reaches the middle of the
// screen; then false for good, so the hint shows once and fades away.
function useInMiddle(ref, enabled) {
  const [stage, setStage] = useState('waiting') // → 'showing' → 'done'
  useEffect(() => {
    const element = ref.current
    if (!enabled || stage !== 'waiting' || !element) return
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && setStage('showing'),
      // Only a thin band across the middle of the screen counts.
      { rootMargin: '-45% 0px -45% 0px' }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, enabled, stage])
  useEffect(() => {
    if (stage !== 'showing') return
    const timer = setTimeout(() => setStage('done'), HINT_TIME)
    return () => clearTimeout(timer)
  }, [stage])
  return stage === 'showing'
}

// What the card says: heading, text, small photos, links. Shared by the
// pop-up card and the phone pop-up window.
function NuggetContent({ nugget, headingId }) {
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

// Photos shown one at a time, each as big as the card allows. Arrows on
// either side and dots underneath step through them; phones can also swipe.
function Carousel({ photos }) {
  const ref = useRef(null)
  const [current, setCurrent] = useState(0)
  // Keep the dots in step with swiping.
  const onScroll = () => {
    const strip = ref.current
    setCurrent(Math.round(strip.scrollLeft / strip.clientWidth))
  }
  const goTo = (i) => {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ref.current.scrollTo({ left: i * ref.current.clientWidth, behavior: smooth ? 'smooth' : 'auto' })
  }

  return (
    <div className="nugget-carousel">
      <div className="nugget-carousel-window">
        <div ref={ref} className="nugget-carousel-strip" onScroll={onScroll}>
          {photos.map((piece, i) =>
            typeof piece === 'string' ? (
              <span key={piece} className="nugget-photo">
                {piece}
              </span>
            ) : (
              <img
                key={piece.src}
                className="nugget-photo"
                src={import.meta.env.BASE_URL + piece.src}
                alt={piece.alt}
                loading="lazy"
                draggable="false"
                aria-hidden={i !== current}
              />
            )
          )}
        </div>
        <button type="button" className="carousel-arrow prev" aria-label="Previous photo" disabled={current === 0} onClick={() => goTo(current - 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          className="carousel-arrow next"
          aria-label="Next photo"
          disabled={current === photos.length - 1}
          onClick={() => goTo(current + 1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="carousel-dots" role="group" aria-label="Photos">
        {photos.map((_, i) => (
          <button
            key={i}
            type="button"
            className={i === current ? 'active' : ''}
            aria-label={`Photo ${i + 1} of ${photos.length}`}
            aria-current={i === current}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  )
}

// Tablets and laptops: the pop-up card beside the drawing. The outer layer is
// see-through and slightly bigger, so the pointer can travel from the drawing
// onto the card without it closing.
function Nugget({ nugget }) {
  return (
    <div
      className={nugget.oneLine ? 'nugget one-line' : 'nugget'}
      role="note"
      style={{
        '--nugget-gap': nugget.gap && `${nugget.gap}px`,
        '--nugget-width': nugget.width,
      }}
    >
      <div className="nugget-card">
        <NuggetContent nugget={nugget} />
      </div>
    </div>
  )
}

// Phones: the same card as a pop-up window in the middle of the screen. It
// closes with the ×, the Escape key, or a tap on the overlay around it.
function NuggetModal({ nugget, dialog }) {
  const close = () => dialog.current?.close()
  const headingId = useId()
  return (
    <dialog
      ref={dialog}
      className="nugget-modal"
      aria-labelledby={nugget.heading ? headingId : undefined}
      aria-label={nugget.heading ? undefined : 'A fun fact'}
      // Keep taps inside from reaching the drawing (which would reopen it).
      onClick={(e) => {
        e.stopPropagation()
        // A tap on the overlay lands on the dialog itself, outside the card.
        if (e.target === e.currentTarget) close()
      }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* The card itself takes focus when it opens, rather than the ×, so the ×
          doesn't show a focus ring on every tap. */}
      <div className="nugget-modal-card" tabIndex={-1} autoFocus>
        <button type="button" className="nugget-modal-close" aria-label="Close" onClick={close}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <NuggetContent nugget={nugget} headingId={headingId} />
      </div>
    </dialog>
  )
}
