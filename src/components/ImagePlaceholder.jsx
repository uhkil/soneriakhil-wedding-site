// A box that stands in for a photo or artwork until we have the real image.
// Usage: <ImagePlaceholder label="Couple photo" height={300} />
// "height" is optional. Leave it out to size the box with CSS instead
// (using "className").
export default function ImagePlaceholder({ label = 'Image', height, className = '' }) {
  return (
    <div className={`image-placeholder ${className}`} style={height ? { height } : undefined}>
      {label}
    </div>
  )
}
