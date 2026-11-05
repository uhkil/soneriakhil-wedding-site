// Practice-only: four other ways to lay out the "Who's coming?" tab, to try
// next to the name chips (see RsvpByEvent.jsx). They all use the same
// answers and the same rules (tap who's coming; anyone not tapped isn't;
// "None of us" for no one); only how much shows at once differs.
//   - steps:    one event at a time, then a short recap
//   - rows:     one calm line per event; tap it for a pop-up with the chips
//   - tiles:    the weekend as a little calendar (days across, morning and
//               evening down); tap a tile for the pop-up
//   - sentence: like a printed RSVP card: "Priya, Rohan & Dev will be there."
import { useEffect, useRef } from 'react'

export const STYLES = [
  ['chips', 'Chips'],
  ['steps', 'One at a time'],
  ['rows', 'Rows + pop-up'],
  ['tiles', 'Two days'],
  ['sentence', 'RSVP card'],
]

// "Priya, Rohan & Dev"
export function joinNames(names) {
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}

// What an event's answer says in a few words.
export function summary(ev, h) {
  const invited = h.invitedTo(ev)
  const states = invited.map((g) => h.answers[g.guestId].attending[ev.id])
  if (states.some((s) => !s)) return { text: 'Not answered yet', answered: false }
  const coming = invited.filter((g) => h.answers[g.guestId].attending[ev.id] === 'yes')
  if (coming.length === invited.length) return { text: invited.length > 1 ? 'Everyone' : 'Coming', answered: true }
  if (!coming.length) return { text: invited.length > 1 ? 'No one' : 'Not coming', answered: true }
  return { text: joinNames(coming.map(h.chipName)), answered: true }
}

function When({ ev }) {
  return (
    <span>
      {ev.date} · {ev.timeOfDay}
    </span>
  )
}

// ----- One event at a time -----
export function StepsView({ h, step, setStep }) {
  const events = h.events
  const recap = step >= events.length
  const go = (n) => {
    setStep(n)
    requestAnimationFrame(() => document.querySelector('.rsvp-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  return (
    <div className="rsvp-steps">
      <div className="rsvp-step-dots" aria-label={recap ? 'Recap' : `Event ${step + 1} of ${events.length}`}>
        {events.map((ev, i) => (
          <button
            key={ev.id}
            type="button"
            className={`rsvp-step-dot${i === step ? ' on' : ''}${summary(ev, h).answered ? ' done' : ''}${h.problemFor(`event-${ev.id}`) ? ' missing' : ''}`}
            aria-label={`${ev.name}${i === step ? ' (showing)' : ''}`}
            onClick={() => go(i)}
          />
        ))}
        <span className="rsvp-step-count" aria-hidden="true">
          {recap ? 'All done' : `Event ${step + 1} of ${events.length}`}
        </span>
      </div>

      {recap ? (
        <div className="rsvp-recap">
          <p className="rsvp-subhead">Here’s who’s coming</p>
          {events.map((ev, i) => {
            const s = summary(ev, h)
            return (
              <div key={ev.id} className={`rsvp-recap-row${s.answered ? '' : ' missing'}`}>
                <span className="rsvp-recap-event">{ev.name}</span>
                <span className="rsvp-recap-who">{s.text}</span>
                <button type="button" className="rsvp-recap-edit" onClick={() => go(i)}>
                  Edit
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        h.eventChips(events[step], { big: true })
      )}

      {!recap && (
        <div className="rsvp-step-nav">
          {step > 0 ? (
            <button type="button" className="rsvp-text-button" onClick={() => go(step - 1)}>
              ← Back
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="rsvp-text-button strong" onClick={() => go(step + 1)}>
            {step === events.length - 1 ? 'See the recap →' : 'Next event →'}
          </button>
        </div>
      )}
    </div>
  )
}

// ----- A pop-up with one event's chips (rows and tiles) -----
function EventDialog({ ev, h, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ev && !ref.current.open) ref.current.showModal()
    if (!ev && ref.current.open) ref.current.close()
  }, [ev])
  return (
    <dialog
      ref={ref}
      className="rsvp-event-dialog"
      aria-label={ev ? ev.name : 'Event'}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && ref.current.close()}
    >
      {ev && (
        <div className="rsvp-event-dialog-card rsvp-v2" tabIndex={-1} autoFocus>
          {h.eventChips(ev, { inDialog: true })}
          <button type="button" className="button rsvp-dialog-done" onClick={() => ref.current.close()}>
            Done
          </button>
        </div>
      )}
    </dialog>
  )
}

export function RowsView({ h, openEv, setOpenEv }) {
  return (
    <>
      <div className="rsvp-rows">
        {h.events.map((ev) => {
          const s = summary(ev, h)
          return (
            <button
              key={ev.id}
              id={`spot-${ev.id}`}
              type="button"
              className={`rsvp-row${s.answered ? ' answered' : ''}${h.problemFor(`event-${ev.id}`) ? ' missing' : ''}`}
              onClick={() => setOpenEv(ev)}
            >
              <span className="rsvp-event-head">
                {ev.name}
                <When ev={ev} />
              </span>
              <span className="rsvp-row-who">{s.text}</span>
              <svg className="rsvp-row-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          )
        })}
      </div>
      <EventDialog ev={openEv} h={h} onClose={() => setOpenEv(null)} />
    </>
  )
}

export function TilesView({ h, openEv, setOpenEv }) {
  const dates = [...new Set(h.events.map((ev) => ev.date))]
  const times = [...new Set(h.events.map((ev) => ev.timeOfDay))]
  return (
    <>
      <div className="rsvp-tiles" style={{ '--days': dates.length }}>
        {dates.map((date) => (
          <div key={date} className="rsvp-day">
            <p className="rsvp-day-name">{date}</p>
            {times.map((time) => {
              const ev = h.events.find((e) => e.date === date && e.timeOfDay === time)
              if (!ev) return <div key={time} className="rsvp-tile empty" aria-hidden="true" />
              const s = summary(ev, h)
              return (
                <button
                  key={time}
                  id={`spot-${ev.id}`}
                  type="button"
                  className={`rsvp-tile${s.answered ? ' answered' : ''}${h.problemFor(`event-${ev.id}`) ? ' missing' : ''}`}
                  onClick={() => setOpenEv(ev)}
                >
                  <span className="rsvp-tile-time">{time}</span>
                  <span className="rsvp-tile-name">{ev.name}</span>
                  <span className="rsvp-tile-who">
                    {s.answered && (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    )}
                    {s.answered ? s.text : 'Tap to answer'}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <EventDialog ev={openEv} h={h} onClose={() => setOpenEv(null)} />
    </>
  )
}

// ----- The RSVP card: one sentence per event -----
export function SentenceView({ h }) {
  return (
    <div className="rsvp-sentences">
      <p className="rsvp-chip-hint">Tap each name that’ll be there.</p>
      {h.events.map((ev) => {
        const invited = h.invitedTo(ev)
        const s = summary(ev, h)
        const nobody = s.answered && invited.every((g) => h.answers[g.guestId].attending[ev.id] === 'no')
        const problem = h.problemFor(`event-${ev.id}`)
        return (
          <div key={ev.id} id={`event-${ev.id}`} tabIndex={-1} className={`rsvp-sentence${problem ? ' missing' : ''}`}>
            <p className="rsvp-event-head">
              {ev.name}
              <When ev={ev} />
            </p>
            <p className="rsvp-sentence-text">
              {invited.map((g, i) => {
                const state = h.answers[g.guestId].attending[ev.id]
                const sep = i === 0 ? '' : i === invited.length - 1 ? ' & ' : ', '
                return (
                  <span key={g.guestId}>
                    {sep}
                    <button
                      type="button"
                      className={`rsvp-name-word ${state || 'unanswered'}`}
                      aria-pressed={state === 'yes'}
                      aria-label={`${h.displayName(g)} is coming to ${ev.name}`}
                      onClick={() => h.tapPerson(ev, g)}
                    >
                      {h.chipName(g)}
                    </button>
                  </span>
                )
              })}
              <span className="rsvp-sentence-end">
                {nobody ? ' — we’ll miss this one.' : s.answered ? ' will be there.' : ' — who’ll be there?'}
              </span>
            </p>
            {!nobody && (
              <button type="button" className="rsvp-text-button small" onClick={() => h.noneOfUs(ev)}>
                {invited.length > 1 ? 'None of us can make it' : 'I can’t make it'}
              </button>
            )}
            {problem && <p className="field-note">Please tap who’s coming, or “{invited.length > 1 ? 'None of us can make it' : 'I can’t make it'}.”</p>}
          </div>
        )
      })}
    </div>
  )
}
