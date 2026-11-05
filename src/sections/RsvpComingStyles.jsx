// Practice-only: a second way to lay out the "Who's coming?" tab, to try
// next to the name chips (see RsvpByEvent.jsx). Same answers, same rules
// (tap who's coming; anyone not tapped isn't; "None of us" for no one).
//   - tiles: the weekend as a little calendar (days across, morning and
//            evening down), each event's name chips right inside its tile.
//            Phones: the days one under the other, one tile per line.

export const STYLES = [
  ['chips', 'Chips'],
  ['tiles', 'Two days'],
]

// Has everyone invited to this event been answered?
export function answered(ev, h) {
  return h.invitedTo(ev).every((g) => h.answers[g.guestId].attending[ev.id])
}

export function TilesView({ h }) {
  const dates = [...new Set(h.events.map((ev) => ev.date))]
  const times = [...new Set(h.events.map((ev) => ev.timeOfDay))]
  return (
    <>
      <p className="rsvp-chip-hint">Tap everyone who’s coming.</p>
      <div className="rsvp-tiles" style={{ '--days': dates.length }}>
        {dates.map((date) => (
          <div key={date} className="rsvp-day">
            <p className="rsvp-day-name">{date}</p>
            {times.map((time) => {
              const ev = h.events.find((e) => e.date === date && e.timeOfDay === time)
              // A time of day with no event on this invitation: an empty
              // outline, so the calendar keeps its shape.
              if (!ev) return <div key={time} className="rsvp-tile empty" aria-hidden="true" />
              const missing = h.problemFor(`event-${ev.id}`)
              return (
                <div key={time} className={`rsvp-tile${answered(ev, h) ? ' answered' : ''}${missing ? ' missing' : ''}`}>
                  {h.eventChips(ev, { tile: true })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}
