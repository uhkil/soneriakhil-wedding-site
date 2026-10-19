// The Home banner for the "Dance floor" design: the date and place, the names,
// then the illustration of the two of them dancing under string lights, then
// the welcome and the RSVP button.
//
// The illustration is stored as a shape only (dance-floor.webp) and colored by
// the CSS (--cobalt in index.css), so changing the blue is a one-line change.

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
