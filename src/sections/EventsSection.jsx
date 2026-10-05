// The events this guest's party is invited to, shown as a vertical timeline.
// Events alternate sides, and a date marker appears at the start of each day.
//
// The details (times, locations, addresses) come privately from the Google
// Sheet after login, only for the events this party is invited to. They are
// not stored in the website's code.
import Section from '../components/Section.jsx'
import EventBlock from '../components/EventBlock.jsx'

export default function EventsSection({ events }) {
  return (
    <Section id="events" className="section-field">
      <h2>Events</h2>
      <div className="timeline">
        {events.map((event, index) => {
          // Is this the first event shown for its day? If so, show a day marker.
          const isNewDay = index === 0 || events[index - 1].date !== event.date

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
