// Small hand-drawn-style line doodles, drawn with code (SVG).
// They're decorative, so screen readers skip them.
// Usage: <Doodle type="heart" size={32} />
// Types: heart, flower, plane, suitcase, gift, cup, sprig

// Each doodle is a set of shapes on a 48 x 48 grid.
const shapes = {
  heart: (
    <path
      className="fill-blush"
      d="M24 39 C 10 29, 7 18, 13 12.5 C 18 8.5, 22.5 11, 24 15.5 C 25.5 11, 30.5 8, 35.5 12 C 41.5 17.5, 37 29, 24 39 Z"
    />
  ),
  flower: (
    <>
      <path d="M24 26 C 24.5 33, 23 39, 24 45" />
      <path className="fill-sage" d="M24 37 C 29 33, 34 34, 36 31 C 31 30, 27 32, 24 37 Z" />
      <circle className="fill-blush" cx="24" cy="10" r="5.5" />
      <circle className="fill-blush" cx="32" cy="16" r="5.5" />
      <circle className="fill-blush" cx="29" cy="25" r="5.5" />
      <circle className="fill-blush" cx="19" cy="25" r="5.5" />
      <circle className="fill-blush" cx="16" cy="16" r="5.5" />
      <circle className="fill-ochre" cx="24" cy="18" r="4" />
    </>
  ),
  plane: (
    <>
      <path className="fill-paper" d="M5 27 L 39 19.5 C 44 18.5, 46 22, 42 23.5 L 8 31 Z" />
      <path className="fill-paper" d="M19 24.5 L 13 12 L 18 12 L 28.5 22.5" />
      <path className="fill-paper" d="M21 28 L 18 36 L 23 35 L 28.5 26.5" />
      <path className="fill-paper" d="M8 29 L 5 21 L 9 21 L 13 27" />
    </>
  ),
  suitcase: (
    <>
      <rect className="fill-terracotta" x="9" y="16" width="30" height="23" rx="4" />
      <path d="M19 16 V 10.5 H 29 V 16" />
      <path d="M16 16 V 39 M 32 16 V 39" />
      <circle cx="14" cy="42" r="1.8" />
      <circle cx="34" cy="42" r="1.8" />
    </>
  ),
  gift: (
    <>
      <rect className="fill-sage" x="10" y="21" width="28" height="20" rx="2" />
      <rect className="fill-sage" x="8" y="15" width="32" height="7" rx="2" />
      <path d="M24 15 V 41" />
      <path d="M24 15 C 20 8, 13 10, 17 14.5 C 19 16, 22 15.5, 24 15 C 26 15.5, 29 16, 31 14.5 C 35 10, 28 8, 24 15" />
    </>
  ),
  cup: (
    <>
      <path className="fill-paper" d="M12 19 H 33 V 32 C 33 38, 29 41, 22.5 41 C 16 41, 12 38, 12 32 Z" />
      <path d="M33 23 C 40 22.5, 40.5 32, 33 32" />
      <path d="M18 14 C 15.5 11, 20 9, 17.5 5" />
      <path d="M25.5 14 C 23 11, 27.5 9, 25 5" />
    </>
  ),
  sprig: (
    <>
      <path d="M12 44 C 18 32, 24 20, 36 6" />
      <path className="fill-sage" d="M18 33 C 11 31, 9 25, 10 22 C 15 24, 18 28, 18 33 Z" />
      <path className="fill-sage" d="M21 27 C 27 27, 31 23, 32 19 C 27 19, 23 22, 21 27 Z" />
      <path className="fill-sage" d="M27 18 C 22 15, 21 10, 22 7 C 26 9, 28 14, 27 18 Z" />
      <path className="fill-sage" d="M30 13 C 35 13, 38 10, 40 7 C 35 6.5, 32 9, 30 13 Z" />
    </>
  ),
}

export default function Doodle({ type, size = 40, className = '' }) {
  return (
    <svg
      className={`doodle ${className}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      {shapes[type]}
    </svg>
  )
}
