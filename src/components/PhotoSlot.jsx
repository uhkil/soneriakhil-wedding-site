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
//
// Optional "srcSet" and "sizes": the same photo at several sizes, and how wide
// it's shown, so each screen downloads the smallest copy that's still sharp
// on it (e.g. a phone gets a 600px copy, a laptop's sharp screen a 1000px
// one). See srcSetFor() in photoUrl.js.
import { createContext, useContext } from 'react'
import { photoUrl } from './photoUrl.js'

// False while the photos around it shouldn't download yet (e.g. a Memories
// view that hasn't been chosen): the spot keeps its size but stays empty.
export const PhotosWanted = createContext(true)

// How different the shapes must be before the photo is shown whole instead
// of cropped: 1.35 = the photo would lose more than about a quarter.
export const SHOW_WHOLE_PAST = 1.35

export default function PhotoSlot({ src, srcSet, sizes, alt = '', label = 'Photo', tilt = 0, className = '', width, height, frame, eager = false }) {
  // eager: download right away instead of waiting until it's scrolled near
  // (iPhone Safari can hold lazy photos back until a finger leaves the screen).
  const loading = eager ? 'eager' : 'lazy'
  const wanted = useContext(PhotosWanted)
  const mismatch = width && height && frame ? Math.max(frame / (width / height), width / height / frame) : 1
  const whole = src && mismatch > SHOW_WHOLE_PAST
  return (
    <div className={`photo-slot ${className}${whole ? ' whole' : ''}`} style={{ rotate: `${tilt}deg` }}>
      {src && !wanted ? null : src ? (
        <>
          {/* (Both use the same copy, so it downloads once.) */}
          {whole && <img className="photo-backdrop" src={photoUrl(src)} srcSet={srcSet} sizes={sizes} alt="" aria-hidden="true" loading={loading} decoding="async" />}
          <img className="photo-main" src={photoUrl(src)} srcSet={srcSet} sizes={sizes} alt={alt} loading={loading} decoding="async" />
        </>
      ) : (
        <div className="photo-placeholder">{label}</div>
      )}
    </div>
  )
}
