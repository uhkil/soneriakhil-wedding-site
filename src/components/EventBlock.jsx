// ONE event on the timeline: the details, a dot on the timeline line,
// and the event's artwork on the opposite side.
// "flipped" swaps which side the details and the artwork are on.
import IllustrationSlot from './IllustrationSlot.jsx'

export default function EventBlock({ event, flipped }) {
  return (
    <div id={event.id} className={flipped ? 'timeline-item flipped' : 'timeline-item'}>
      <div className="event-details">
        <p className="event-when">
          {event.date} · {event.timeOfDay}
        </p>
        <h3>{event.name}</h3>
        {/* A "definition list": pairs of labels (dt) and values (dd). */}
        <dl className="event-facts">
          <dt>Time</dt>
          <dd>{event.time}</dd>
          <dt>Location</dt>
          <dd>{event.location}</dd>
          <dt>Attire</dt>
          <dd>{event.attire}</dd>
        </dl>
        <p>{event.description}</p>
      </div>

      <div className="timeline-dot" />

      {/* Each event's art is listed in src/data/art.js as "event-<id>". */}
      <IllustrationSlot name={`event-${event.id}`} size="small" className="timeline-art" />
    </div>
  )
}
