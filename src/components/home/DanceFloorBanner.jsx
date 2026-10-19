// The Home banner for the "Dance floor" design: the date and place, the names,
// then the illustration of the two of them dancing under string lights, then
// the welcome and the RSVP button.
//
// The illustration is stored as a shape only (dance-floor.webp) and colored by
// the CSS (--cobalt in index.css), so changing the blue is a one-line change.
// Behind it, each string-light bulb has a soft warm glow that twinkles.

// Where each bulb hangs, as % of the illustration's width and height.
const BULBS = [
  [6.3, 14.3], [11.7, 16.8], [17.5, 18.6], [23.7, 18.6], [29.7, 16.5], [35, 13.6], [40.8, 9],
  [48.3, 10.4], [58.3, 17.5], [64.4, 19.7], [71.5, 20.9], [78.8, 20.9], [86.1, 19.1], [93.4, 14.3],
]

export default function DanceFloorBanner({ welcome }) {
  return (
    <div className="dance">
      <p className="dance-details">
        April 9–10, 2027 <span aria-hidden="true">·</span> Dallas, Texas
      </p>
      <h1 className="dance-names">
        Soneri <span className="dance-and">&amp;</span> Akhil
      </h1>

      <div className="dance-art">
        {/* The glows sit behind the drawing; each starts its twinkle at a different moment. */}
        {BULBS.map(([x, y], i) => (
          <span
            key={i}
            className="dance-glow"
            aria-hidden="true"
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i * 0.37) % 2.6}s` }}
          />
        ))}
        <div
          className="dance-drawing"
          role="img"
          aria-label="An illustration of Soneri and Akhil dancing under string lights, surrounded by friends"
        />
      </div>

      <p className="dance-welcome">Welcome, {welcome}</p>
      <a className="button" href="#rsvp">RSVP</a>
    </div>
  )
}
