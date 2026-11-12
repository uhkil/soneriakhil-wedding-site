// Small line icons for the "What to do" cards in Travel, drawn like the
// calendar and map-pin icons on the Events cards (24×24, rounded strokes,
// no fill). The stroke color and width come from the CSS (.activity-icon).

const icons = {
  // A basketball: the ball and its seams.
  basketball: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5v17" />
      <path d="M6 6c2.2 1.6 3.4 3.6 3.4 6S8.2 16.4 6 18" />
      <path d="M18 6c-2.2 1.6-3.4 3.6-3.4 6s1.2 4.4 3.4 6" />
    </>
  ),
  // A long-necked dinosaur (the Perot's skeletons).
  dinosaur: (
    <>
      <path d="M2.5 17.5c2.4 0 4-.6 5.4-2 .9-.9 2.6-1.6 4.6-1.6 2.4 0 3.6-1 4.1-3.4l.8-4.4c.2-1 .9-1.6 1.9-1.6h.6c.7 0 1.3.5 1.4 1.2l.1.6-1.9.6-1 6.4c-.4 2.8-1.6 4.6-3.6 5.4" />
      <path d="M8.6 15.4v4.1M11.4 14.2v5.3M14.4 15.8v3.7M16.5 17v2.5" />
    </>
  ),
  // A golf flag in the hole, and a ball.
  golf: (
    <>
      <path d="M9 20V3.5l7.5 3.2L9 9.9" />
      <ellipse cx="9" cy="20" rx="5.5" ry="1.4" />
      <circle cx="17.5" cy="17" r="1.6" />
    </>
  ),
  // A tulip (spring at the Arboretum).
  flower: (
    <>
      <path d="M12 13.5c-3 0-4.8-2.2-4.8-5.2V4.4l2.4 2 2.4-2.9 2.4 2.9 2.4-2v3.9c0 3-1.8 5.2-4.8 5.2z" />
      <path d="M12 13.5v7" />
      <path d="M12 20.5c-.4-2.8-2.4-4.6-5.4-4.8.2 2.8 2.4 4.6 5.4 4.8zM12 18.6c.6-2.2 2.4-3.6 4.8-3.6-.4 2.2-2.2 3.6-4.8 3.6z" />
    </>
  ),
  // An artist's palette with dabs of paint (the galleries and murals).
  palette: (
    <>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7h2c2.5 0 4.5-2 4.5-4.5 0-3.9-4-6.7-9-6.7z" />
      <circle cx="7.5" cy="11.5" r="1.2" />
      <circle cx="9.3" cy="7.6" r="1.2" />
      <circle cx="13.6" cy="6.6" r="1.2" />
      <circle cx="17" cy="9.2" r="1.2" />
    </>
  ),
  // A roller coaster: a car at the top of the first hill, on its supports.
  coaster: (
    <>
      <path d="M2 17c2.6 0 3.6-10 7-10s4.2 7.4 7 7.4c2 0 2.8-3 6-3" />
      <path d="M2 20.5h20M5.2 14.6v5.9M9 7v13.5M12.8 11.8v8.7M16.6 14.3v6.2M20.4 11.6v8.9" />
      <rect x="7" y="4.3" width="4" height="2.4" rx=".8" />
    </>
  ),
}

export default function ActivityIcon({ name }) {
  return (
    <span className="activity-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">{icons[name]}</svg>
    </span>
  )
}
