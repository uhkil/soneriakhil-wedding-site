// The events, shown as a vertical timeline. Events alternate sides,
// and a small date marker appears at the start of each day.
//
// Getting ready for Milestone 2 (guest login):
// This section can be given a list of event ids, like
//   <EventsSection invitedEventIds={['sangeet', 'reception']} />
// and it will show only those events. With no list, it shows every event.
import Section from '../components/Section.jsx'
import EventBlock from '../components/EventBlock.jsx'
import events from '../data/events.js'

export default function EventsSection({ invitedEventIds }) {
  // Keep only the events this guest is invited to (or all of them).
  const visibleEvents = invitedEventIds
    ? events.filter((event) => invitedEventIds.includes(event.id))
    : events

  return (
    <Section id="events">
      <h2>Events</h2>
      <div className="timeline">
        {visibleEvents.map((event, index) => {
          // Is this the first event shown for its day? If so, show a day marker.
          const isNewDay = index === 0 || visibleEvents[index - 1].date !== event.date

          return (
            <div key={event.id}>
              {isNewDay && <div className="timeline-day">{event.date}</div>}
              {/* Every other event is flipped to the opposite side.
                  "index % 2 === 1" means: the 2nd, 4th, ... event. */}
              <EventBlock event={event} flipped={index % 2 === 1} />
            </div>
          )
        })}
      </div>
    </Section>
  )
}
