// A spot for a real photograph, styled like a small printed photo.
// Usage: <PhotoSlot label="How we met" src="images/how-we-met.jpg" alt="..." />
// With no "src", it shows a placeholder with the label.
// "tilt" turns it slightly, like a photo set down on a table (e.g. tilt={-2}).
export default function PhotoSlot({ src, alt = '', label = 'Photo', tilt = 0, className = '' }) {
  return (
    <div className={`photo-slot ${className}`} style={{ rotate: `${tilt}deg` }}>
      {src ? (
        <img src={import.meta.env.BASE_URL + src} alt={alt} loading="lazy" />
      ) : (
        <div className="photo-placeholder">{label}</div>
      )}
    </div>
  )
}
