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
        {/* A "definition list": pairs of labels (dt) and values (dd).
            Rows the Sheet leaves blank are skipped. */}
        <dl className="event-facts">
          {[
            ['Time', event.time],
            ['Location', event.location],
            ['Address', event.address],
            ['Attire', event.attire],
          ]
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="event-fact">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>
        {event.description && <p>{event.description}</p>}
      </div>

      <div className="timeline-dot" />

      {/* Each event's art is listed in src/data/art.js as "event-<id>". */}
      <IllustrationSlot name={`event-${event.id}`} size="small" className="timeline-art" />
    </div>
  )
}
