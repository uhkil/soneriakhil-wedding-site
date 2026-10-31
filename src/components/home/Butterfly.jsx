// A small line-drawn butterfly that drifts in place and flaps its wings in
// little bursts, like a real one resting near a flower. Purely decorative.
// It's drawn in the text color; the moves are in index.css ("butterfly").
// With "reduce motion" on, it simply sits still.
export default function Butterfly() {
  return (
    <div className="butterfly" aria-hidden="true">
      <svg viewBox="-50 -50 100 100" className="butterfly-drift">
        {/* Left wings: an upper and a lower lobe, with a light spot in each. */}
        <g className="butterfly-wing butterfly-wing-left">
          {/* Invisible box centered on the body, so the wing folds toward the body. */}
          <rect className="butterfly-pivot" x="-46" y="-40" width="92" height="84" />
          <path d="M-3 -4 C -14 -30, -44 -36, -44 -18 C -44 -6, -26 2, -4 2 Z" />
          <path d="M-3 2 C -20 4, -34 16, -28 28 C -22 38, -8 26, -2 8 Z" />
          <circle className="butterfly-spot" cx="-30" cy="-16" r="4.5" />
          <circle className="butterfly-spot" cx="-18" cy="18" r="3.2" />
        </g>
        {/* Right wings: the same, mirrored. */}
        <g className="butterfly-wing butterfly-wing-right">
          {/* Invisible box centered on the body, so the wing folds toward the body. */}
          <rect className="butterfly-pivot" x="-46" y="-40" width="92" height="84" />
          <path d="M3 -4 C 14 -30, 44 -36, 44 -18 C 44 -6, 26 2, 4 2 Z" />
          <path d="M3 2 C 20 4, 34 16, 28 28 C 22 38, 8 26, 2 8 Z" />
          <circle className="butterfly-spot" cx="30" cy="-16" r="4.5" />
          <circle className="butterfly-spot" cx="18" cy="18" r="3.2" />
        </g>
        {/* Body and antennae. */}
        <ellipse className="butterfly-body" cx="0" cy="2" rx="2.6" ry="16" />
        <path className="butterfly-antenna" d="M-1 -13 C -4 -22, -8 -28, -12 -30" />
        <path className="butterfly-antenna" d="M1 -13 C 4 -22, 8 -28, 12 -30" />
      </svg>
    </div>
  )
}
