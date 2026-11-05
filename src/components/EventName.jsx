// An event's name. "Welcome Night | Sangeet": on phones, where it wraps,
// each part goes on its own line and the bar is left out (so it never
// dangles at the end of a line); wider screens show it as written. Used in
// the Events section and the RSVP form. (The styles: .event-name-part and
// .event-name-bar in index.css.)
export default function EventName({ name }) {
  const parts = name.split(/\s*\|\s*/)
  if (parts.length < 2) return <span className="event-name-part">{name}</span>
  return parts.map((part, i) => (
    <span key={i} className="event-name-part">
      {i > 0 && <span className="event-name-bar">{'\u00a0| '}</span>}
      {part}
    </span>
  ))
}
