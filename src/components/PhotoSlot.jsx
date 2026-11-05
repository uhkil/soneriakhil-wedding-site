// A spot for a real photograph, styled like a small printed photo.
// Usage: <PhotoSlot label="How we met" src="images/how-we-met.jpg" alt="..." />
// With no "src", it shows a placeholder with the label.
// "tilt" turns it slightly, like a photo set down on a table (e.g. tilt={-2}).
// Photos only download as the guest scrolls near them.
//
// Optional "width", "height" (the photo's own size) and "frame" (the shape
// of the spot it's shown in, width ÷ height): a photo much narrower or wider
// than its spot (e.g. a portrait photo in a landscape opening) is shown
// whole, centered on a soft, blurred copy of itself, instead of being cropped.
import { photoUrl } from './photoUrl.js'

// How different the shapes must be before the photo is shown whole instead
// of cropped: 1.35 = the photo would lose more than about a quarter.
const SHOW_WHOLE_PAST = 1.35

export default function PhotoSlot({ src, alt = '', label = 'Photo', tilt = 0, className = '', width, height, frame }) {
  const mismatch = width && height && frame ? Math.max(frame / (width / height), width / height / frame) : 1
  const whole = src && mismatch > SHOW_WHOLE_PAST
  return (
    <div className={`photo-slot ${className}${whole ? ' whole' : ''}`} style={{ rotate: `${tilt}deg` }}>
      {src ? (
        <>
          {whole && <img className="photo-backdrop" src={photoUrl(src)} alt="" aria-hidden="true" loading="lazy" decoding="async" />}
          <img className="photo-main" src={photoUrl(src)} alt={alt} loading="lazy" decoding="async" />
        </>
      ) : (
        <div className="photo-placeholder">{label}</div>
      )}
    </div>
  )
}
