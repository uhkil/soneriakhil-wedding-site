// A spot for an illustration. Looks up the art by name in src/data/art.js.
//   - If that art has a file ("src"), it shows the image (or, with "tint",
//     the drawing in the page's text color).
//   - If not, it shows a labeled placeholder in the right shape, so we can
//     judge size and placement before the real art exists.
// Usage: <IllustrationSlot name="heroCouple" size="large" />
// size: "small", "medium", or "large" (sets the maximum width).
import art from '../data/art.js'

export default function IllustrationSlot({ name, size = 'medium', className = '' }) {
  const item = art[name]

  return (
    <div
      className={`illustration-slot size-${size} ${className}`}
      // --art-width: the drawing's own width, so drawings in a group (e.g.
      // "corner-art" in index.css) can share one scale.
      style={{ aspectRatio: item.ratio, '--art-width': parseFloat(item.ratio) }}
    >
      {item.src && item.tint ? (
        // The text color, cut into the drawing's shape (see "tint" in art.js).
        <div
          className="illustration-tint"
          aria-hidden="true"
          style={{
            WebkitMaskImage: `url(${import.meta.env.BASE_URL + item.src})`,
            maskImage: `url(${import.meta.env.BASE_URL + item.src})`,
          }}
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
    </div>
  )
}
