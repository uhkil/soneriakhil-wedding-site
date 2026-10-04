// ONE event on the timeline: a card with the details, a dot on the
// timeline line, and the event's artwork on the opposite side.
// "flipped" swaps which side the card and the artwork are on.
import ImagePlaceholder from './ImagePlaceholder.jsx'

export default function EventBlock({ event, flipped }) {
  return (
    <div id={event.id} className={flipped ? 'timeline-item flipped' : 'timeline-item'}>
      <div className="event-block">
        <p className="event-when">
          {event.date} · {event.timeOfDay}
        </p>
        <h3>{event.name}</h3>
        <p>Time: {event.time}</p>
        <p>Location: {event.location}</p>
        <p>Attire: {event.attire}</p>
        <p>{event.description}</p>
      </div>

      <div className="timeline-dot" />

      {/* Show the real artwork if there is one, otherwise a placeholder. */}
      <div className="timeline-image">
        {event.image ? (
          <img src={event.image} alt={`${event.name} artwork`} />
        ) : (
          <ImagePlaceholder label={`${event.name} artwork`} className="event-art" />
        )}
      </div>
    </div>
  )
}
