// A spot for an illustration. Looks up the art by name in src/data/art.js.
//   - If that art has a file ("src"), it shows the image (or, with "tint",
//     the drawing in the page's text color).
//   - If not, it shows a labeled placeholder in the right shape, so we can
//     judge size and placement before the real art exists.
//   - If the art has a "nugget", hovering over the drawing (or tapping it, or
//     tabbing to it) pops up that little extra about us.
// Usage: <IllustrationSlot name="heroCouple" size="large" />
// size: "small", "medium", or "large" (sets the maximum width).
// Drawings only download once the guest scrolls near them, so the top of the
// page loads first.
import { useRef } from 'react'
import art from '../data/art.js'
import { useNearScreen } from './useNearScreen.js'

export default function IllustrationSlot({ name, size = 'medium', className = '' }) {
  const item = art[name]
  const nugget = item.nugget
  const ref = useRef(null)
  const near = useNearScreen(ref)
  const mask = near && item.src ? `url(${import.meta.env.BASE_URL + item.src})` : undefined

  return (
    <div
      ref={ref}
      className={`illustration-slot size-${size} ${className}${nugget ? ' has-nugget' : ''}`}
      // With a nugget, it can be reached with the keyboard (and tapped on phones).
      tabIndex={nugget ? 0 : undefined}
      aria-label={nugget ? `${item.note}. ${nugget.heading ?? 'A fun fact'}` : undefined}
      // --art-width: the drawing's own width, so drawings in a group (e.g.
      // "corner-art" in index.css) can share one scale.
      style={{ aspectRatio: item.ratio, '--art-width': parseFloat(item.ratio) }}
    >
      {item.src && item.tint ? (
        // The text color, cut into the drawing's shape (see "tint" in art.js).
        <div
          className="illustration-tint"
          aria-hidden="true"
          style={{ WebkitMaskImage: mask, maskImage: mask }}
        />
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
      {nugget && <Nugget nugget={nugget} />}
    </div>
  )
}

// The pop-up card. The outer layer is see-through and slightly bigger, so the
// pointer can travel from the drawing onto the card without it closing.
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
        {nugget.heading && <p className="nugget-heading">{nugget.heading}</p>}
        {nugget.text && <p>{nugget.text}</p>}
        {nugget.gallery && (
          <div className="nugget-gallery">
            {nugget.gallery.map((piece) =>
              typeof piece === 'string' ? (
                <span key={piece} className="nugget-photo">
                  {piece}
                </span>
              ) : (
                <img key={piece.src} className="nugget-photo" src={import.meta.env.BASE_URL + piece.src} alt={piece.alt} />
              )
            )}
          </div>
        )}
        {nugget.links && (
          <ul>
            {nugget.links.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <a href={link.href} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                ) : (
                  link.label
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
