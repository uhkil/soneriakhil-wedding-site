// ONE event on the timeline: the details, a dot on the timeline line,
// and the event's artwork on the opposite side.
// "flipped" swaps which side the details and the artwork are on.
// The details come from the Sheet, filled in by src/data/events.js (which
// also adds the map pin, the moodboard icon, and any note under the attire).
import { useRef } from 'react'
import IllustrationSlot from './IllustrationSlot.jsx'
import { showToast } from './Toast.jsx'

export default function EventBlock({ event, flipped }) {
  const facts = [
    ['Time', event.time],
    ['Location', event.location],
    ['Address', event.address && <Address event={event} />],
    ['Attire', event.attire && <Attire event={event} />],
  ]

  return (
    <div id={event.id} className={flipped ? 'timeline-item flipped' : 'timeline-item'}>
      <div className="event-details">
        <p className="event-when">
          {event.date} · {event.timeOfDay}
        </p>
        {/* The "|" stays at the end of the first line if the name wraps. */}
        <h3>{event.name.replaceAll(' | ', '\u00a0| ')}</h3>
        {/* A "definition list": pairs of labels (dt) and values (dd).
            Rows left blank are skipped. */}
        <dl className="event-facts">
          {facts
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

// The address, with a pin that opens it in Google Maps.
function Address({ event }) {
  return (
    <TextWithIcon text={event.address}>
      {event.mapUrl && (
        <a
          className="fact-icon"
          href={event.mapUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${event.location || 'the address'} in Google Maps`}
          title="Open in Google Maps"
        >
          <PinIcon />
        </a>
      )}
    </TextWithIcon>
  )
}

// Text with a small icon after it. The last word and the icon are kept
// together, so the icon never ends up on a line by itself.
function TextWithIcon({ text, children }) {
  const cut = text.lastIndexOf(' ') + 1
  return (
    <span className="fact-with-icon">
      {text.slice(0, cut)}
      <span className="keep-together">
        {text.slice(cut)}
        {children}
      </span>
    </span>
  )
}

// The attire, with a moodboard icon, and an optional note underneath.
function Attire({ event }) {
  const label = `${event.name} attire moodboard`
  return (
    <>
      <TextWithIcon text={event.attire}>
        {'moodboard' in event &&
          (event.moodboard ? (
            <a className="fact-icon" href={event.moodboard} target="_blank" rel="noreferrer" aria-label={label} title="Moodboard">
              <MoodboardIcon />
            </a>
          ) : (
            <button
              type="button"
              className="fact-icon"
              aria-label={label}
              title="Moodboard"
              onClick={() => showToast('Moodboard coming soon!')}
            >
              <MoodboardIcon />
            </button>
          ))}
      </TextWithIcon>
      {event.attireNote && <AttireNote note={event.attireNote} popup={event.attirePopup} />}
    </>
  )
}

// e.g. "bonus points if you wear a cowboys jersey", where "cowboys jersey"
// opens a pop-up window (on every screen size): the photo with its caption
// underneath, centered over a light overlay. The ×, the Escape key, or a tap
// on the overlay closes it.
function AttireNote({ note, popup }) {
  const dialog = useRef(null)
  const close = () => dialog.current?.close()

  return (
    <span className="attire-note">
      {note.before}
      <button type="button" className="link-button" aria-haspopup="dialog" onClick={() => popup && dialog.current?.showModal()}>
        {note.link}
      </button>
      {note.after}
      {popup && (
        <dialog
          ref={dialog}
          className="photo-modal"
          aria-label={popup.alt}
          // A tap on the overlay lands on the dialog itself, outside the card.
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          {/* The card takes focus when it opens (rather than the ×, which
              would show a focus ring on every tap). */}
          <figure className="photo-modal-card" tabIndex={-1} autoFocus>
            <button type="button" className="nugget-modal-close" aria-label="Close" onClick={close}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            {popup.image ? (
              <img src={import.meta.env.BASE_URL + popup.image} alt={popup.alt} />
            ) : (
              <span className="photo-modal-placeholder">Photo coming soon</span>
            )}
            {popup.caption && <figcaption>{popup.caption}</figcaption>}
          </figure>
        </dialog>
      )}
    </span>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  )
}

// A little collage: a tall picture beside two small ones.
function MoodboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="3.5" width="8" height="17" rx="1.5" />
      <rect x="14" y="3.5" width="6.5" height="7.5" rx="1.5" />
      <rect x="14" y="13" width="6.5" height="7.5" rx="1.5" />
    </svg>
  )
}
