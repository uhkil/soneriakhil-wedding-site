// An event's name. "Welcome Night | Sangeet": on phones, where it wraps,
// each part goes on its own line, with the bar at the end of the first
// ("Welcome Night |" / "Sangeet"); wider screens show it on one line as
// written. The bar is joined to the word before it, so it never starts a
// line. Used in the Events section and the RSVP form. (The styles:
// .event-name-part in index.css.)
export default function EventName({ name }) {
  const parts = name.split(/\s*\|\s*/)
  if (parts.length < 2) return <span className="event-name-part">{name}</span>
  return parts.map((part, i) => (
    <span key={i} className="event-name-part">
      {part}
      {i < parts.length - 1 && ' | '}
    </span>
  ))
}
