// A spot for an illustration. Looks up the art by name in src/data/art.js.
//   - If that art has a file ("src"), it shows the image.
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
      style={{ aspectRatio: item.ratio }}
    >
      {item.src ? (
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
