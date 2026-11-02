// A drawing from public/assets/art/, shown as a plain image: a sharp WebP in
// the site's dark blue with see-through gaps (rendered from the SVG masters in
// art-source/, because SVGs with cut-outs are drawn blurry on iPhones).
// Decorative, so screen readers skip it.
// Usage: <Art file="discoball.webp" className="title-disco" />
export default function Art({ file, className = '' }) {
  return (
    <img
      className={className}
      src={`${import.meta.env.BASE_URL}assets/art/${file}`}
      alt=""
      aria-hidden="true"
      draggable="false"
      decoding="async"
    />
  )
}
