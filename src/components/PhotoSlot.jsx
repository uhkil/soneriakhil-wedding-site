// A spot for a real photograph, styled like a small printed photo.
// Usage: <PhotoSlot label="How we met" src="images/how-we-met.jpg" alt="..." />
// With no "src", it shows a placeholder with the label.
// "tilt" turns it slightly, like a photo set down on a table (e.g. tilt={-2}).
// Photos load as they come near the screen; loading="eager" loads them right away.
export default function PhotoSlot({ src, alt = '', label = 'Photo', tilt = 0, className = '', loading = 'lazy' }) {
  return (
    <div className={`photo-slot ${className}`} style={{ rotate: `${tilt}deg` }}>
      {src ? (
        <img src={import.meta.env.BASE_URL + src} alt={alt} loading={loading} />
      ) : (
        <div className="photo-placeholder">{label}</div>
      )}
    </div>
  )
}
