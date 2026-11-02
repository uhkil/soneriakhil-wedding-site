// The RSVP form, for everyone on the invitation at once.
//   - Each person: accept or decline each event they're invited to, plus dietary needs.
//     (An unnamed plus-one also gets a box for their name.)
//   - The whole party: email, phone, and an optional note for Soneri & Akhil.
// Answers are saved to the Google Sheet. Guests can come back and change them.
//
// Saved email, phone, and notes are never sent back to the website, so those
// boxes start empty and say "on file"; leaving them blank keeps what's saved.
//
// If something's missing when they press Send, each spot that needs an answer
// is outlined in red with a short note, the page scrolls to the first one,
// and a message by the button says what to do. The red goes away as each one
// is fixed. Problems saving (no internet, a logged-out invitation) show by
// the button too, and nothing they've typed is lost.
import { useEffect, useState } from 'react'
import Section from '../components/Section.jsx'
import IllustrationSlot from '../components/IllustrationSlot.jsx'
import { useGuest } from '../guest/GuestProvider.jsx'
import { submitRsvp } from '../api/rsvpApi.js'
import FormMessage from '../components/FormMessage.jsx'

// The same check the Sheet does, so a typo is caught before sending.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// PREVIEW ONLY: other looks for the form to compare (see "RSVP style options"
// in index.css). On the local preview a small switch in the corner flips
// between them; the live site always uses the first. Delete once one is chosen.
const STYLES = [
  ['outlined', 'Outlined'],
  ['filled', 'Filled cards'],
  ['open', 'Open rows'],
  ['tickets', 'Tickets'],
]
function useRsvpStyle() {
  const [style, setStyle] = useState(() => (import.meta.env.DEV && localStorage.getItem('rsvp-style')) || 'outlined')
  useEffect(() => {
    if (import.meta.env.DEV) localStorage.setItem('rsvp-style', style)
  }, [style])
  return [style, setStyle]
}

// The Sheet's reply when the saved login no longer works (e.g. the passcode changed).
const LOGGED_OUT = 'Please find your invitation again.'

// Starts the form from whatever this party saved before (or blank).
function savedAnswers(party) {
  const answers = {}
  party.guests.forEach((g) => {
    const saved = party.answers[g.guestId] || {}
    answers[g.guestId] = {
      name: g.isPlusOne ? saved.name || '' : '',
      dietary: saved.dietary || '',
      attending: { ...(saved.attending || {}) },
    }
  })
  return answers
}

const blankContact = { email: '', phone: '', note: '' }

export default function RsvpSection() {
  const { party, token, setParty, logout } = useGuest()
  const [style, setStyle] = useRsvpStyle()
  const [answers, setAnswers] = useState(() => savedAnswers(party))
  const [contact, setContact] = useState(blankContact)
  const [status, setStatus] = useState('editing') // 'editing' | 'saving' | 'saved'
  const [error, setError] = useState('')
  // Turns on after the first Send, so missing answers are only flagged once
  // the guest has tried to send (not while they're still filling it in).
  const [checked, setChecked] = useState(false)

  const eventsById = Object.fromEntries(party.events.map((e) => [e.id, e]))
  const displayName = (g) => (g.isPlusOne ? 'Your guest' : `${g.firstName} ${g.lastName}`)

  // Updates one person's answer. "change" is a function that edits a copy.
  function updateGuest(guestId, change) {
    setAnswers((all) => {
      const copy = { ...all[guestId], attending: { ...all[guestId].attending } }
      change(copy)
      return { ...all, [guestId]: copy }
    })
    setStatus('editing')
  }

  function updateContact(field, value) {
    setContact((c) => ({ ...c, [field]: value }))
    setStatus('editing')
  }

  // Everything that needs fixing, in page order: { id (the spot on the
  // page), message }. Empty when the form is ready to send.
  function findProblems() {
    const problems = []
    for (const g of party.guests) {
      const a = answers[g.guestId]
      if (g.isPlusOne && Object.values(a.attending).includes('yes') && !a.name.trim()) {
        problems.push({ id: `name-${g.guestId}`, message: 'Please add your guest’s name.' })
      }
      g.invitedEvents.forEach((eventId) => {
        if (!a.attending[eventId]) {
          problems.push({ id: `${g.guestId}-${eventId}`, message: 'Please choose Accept or Decline.' })
        }
      })
    }
    if (contact.email.trim() && !EMAIL.test(contact.email.trim())) {
      problems.push({ id: 'rsvp-email', message: 'Please check the email address (e.g. name@example.com).' })
    }
    return problems
  }

  const problems = checked ? findProblems() : []
  const problemFor = (id) => problems.find((p) => p.id === id)

  async function save(event) {
    event.preventDefault()
    setChecked(true)
    const found = findProblems()
    if (found.length) {
      setError('')
      // Bring the first one into view and put the keyboard there.
      const first = document.getElementById(found[0].id)
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      first?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' })
      ;(first?.querySelector('input') ?? first)?.focus({ preventScroll: true })
      return
    }
    setError('')

    setStatus('saving')
    try {
      const updated = await submitRsvp({
        partyId: party.partyId,
        token,
        guests: party.guests.map((g) => ({ guestId: g.guestId, ...answers[g.guestId] })),
        contact,
      })
      setParty(updated) // the site now shows the saved version
      setContact(blankContact) // saved contact info stays private, so clear the boxes
      setStatus('saved')
    } catch (err) {
      setError(err.message)
      setStatus('editing')
    }
  }

  const onFile = party.onFile || {}

  return (
    <Section id="rsvp" className="rsvp">
      {/* Corner art just above the title (see "corner-art" in index.css). */}
      <IllustrationSlot name="rsvpCouple" size="small" className="corner-art corner-art-left" />
      <h2>RSVP</h2>
      <p className="rsvp-intro">
        {party.hasResponded
          ? 'We have your RSVP. You can change anything below and save again.'
          : 'Let us know who’s coming. One form covers everyone on your invitation.'}
      </p>

      {import.meta.env.DEV && (
        <div className="rsvp-style-switch" role="group" aria-label="Preview RSVP style">
          {STYLES.map(([id, label]) => (
            <button key={id} type="button" className={id === style ? 'selected' : ''} onClick={() => setStyle(id)}>
              {label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={save} noValidate data-style={style}>
        {party.guests.map((g) => {
          const a = answers[g.guestId]
          return (
            // A <fieldset> groups one person's questions; <legend> is its title.
            <fieldset key={g.guestId} className="rsvp-guest">
              <legend>{displayName(g)}</legend>

              {g.isPlusOne && (
                <div className="rsvp-field">
                  <label htmlFor={`name-${g.guestId}`}>Your guest’s name</label>
                  <input
                    id={`name-${g.guestId}`}
                    type="text"
                    autoComplete="off"
                    value={a.name}
                    onChange={(e) => updateGuest(g.guestId, (c) => (c.name = e.target.value))}
                    {...invalid(problemFor(`name-${g.guestId}`), `name-${g.guestId}-note`)}
                  />
                  <FieldNote problem={problemFor(`name-${g.guestId}`)} id={`name-${g.guestId}-note`} />
                </div>
              )}

              {g.invitedEvents.map((eventId) => {
                const ev = eventsById[eventId]
                const group = `${g.guestId}-${eventId}`
                const problem = problemFor(group)
                return (
                  <div
                    key={eventId}
                    id={group}
                    tabIndex={-1}
                    className={problem ? 'rsvp-event missing' : 'rsvp-event'}
                    role="radiogroup"
                    aria-label={`${ev.name}, ${displayName(g)}`}
                    {...invalid(problem, `${group}-note`)}
                  >
                    <p className="rsvp-event-name">
                      {ev.name}
                      <span>
                        {ev.date} · {ev.timeOfDay}
                      </span>
                    </p>
                    <div className="rsvp-choices">
                      {[
                        ['yes', 'Accept'],
                        ['no', 'Decline'],
                      ].map(([value, label]) => (
                        <span key={value} className="rsvp-choice">
                          <input
                            type="radio"
                            id={`${group}-${value}`}
                            name={group}
                            value={value}
                            checked={a.attending[eventId] === value}
                            onChange={() => updateGuest(g.guestId, (c) => (c.attending[eventId] = value))}
                          />
                          <label htmlFor={`${group}-${value}`}>{label}</label>
                        </span>
                      ))}
                    </div>
                    <FieldNote problem={problem} id={`${group}-note`} />
                  </div>
                )
              })}

              <div className="rsvp-field">
                <label htmlFor={`diet-${g.guestId}`}>Dietary needs</label>
                <input
                  id={`diet-${g.guestId}`}
                  type="text"
                  placeholder="Allergies, vegetarian, etc. (optional)"
                  value={a.dietary}
                  onChange={(e) => updateGuest(g.guestId, (c) => (c.dietary = e.target.value))}
                />
              </div>
            </fieldset>
          )
        })}

        <fieldset className="rsvp-guest">
          <legend>How can we reach you?</legend>
          <div className="rsvp-field">
            <label htmlFor="rsvp-email">Email</label>
            <input
              id="rsvp-email"
              type="email"
              autoComplete="email"
              placeholder={onFile.email ? 'On file. Leave blank to keep it.' : 'you@example.com'}
              value={contact.email}
              onChange={(e) => updateContact('email', e.target.value)}
              {...invalid(problemFor('rsvp-email'), 'rsvp-email-note')}
            />
            <FieldNote problem={problemFor('rsvp-email')} id="rsvp-email-note" />
          </div>
          <div className="rsvp-field">
            <label htmlFor="rsvp-phone">Phone</label>
            <input
              id="rsvp-phone"
              type="tel"
              autoComplete="tel"
              placeholder={onFile.phone ? 'On file. Leave blank to keep it.' : 'Optional'}
              value={contact.phone}
              onChange={(e) => updateContact('phone', e.target.value)}
            />
          </div>
          <div className="rsvp-field">
            <label htmlFor="rsvp-note">A note for Soneri &amp; Akhil</label>
            <textarea
              id="rsvp-note"
              rows="4"
              placeholder={
                onFile.note
                  ? 'We have your note. Write a new one to replace it, or leave blank to keep it.'
                  : 'Optional'
              }
              value={contact.note}
              onChange={(e) => updateContact('note', e.target.value)}
            />
          </div>
        </fieldset>

        {problems.length > 0 && (
          <FormMessage>
            {problems.length === 1
              ? 'One answer still needs your attention. It’s marked in red above.'
              : `${problems.length} answers still need your attention. They’re marked in red above.`}
          </FormMessage>
        )}
        {error && (
          <FormMessage>
            {error === LOGGED_OUT ? (
              <>
                Your invitation has been signed out (the passcode may have changed).{' '}
                <button type="button" className="link-button" onClick={logout}>
                  Find your invitation again
                </button>
              </>
            ) : (
              error
            )}
          </FormMessage>
        )}
        {status === 'saved' && (
          <FormMessage kind="success">Thank you! Your RSVP is saved. You can change it anytime before January 15.</FormMessage>
        )}

        <button className="button rsvp-submit" type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : party.hasResponded ? 'Update RSVP' : 'Send RSVP'}
        </button>
      </form>
    </Section>
  )
}

// For a box or question with a problem: tells screen readers it needs fixing
// and which note explains why.
function invalid(problem, noteId) {
  return problem ? { 'aria-invalid': true, 'aria-describedby': noteId } : {}
}

// The short red note under a box or question that needs fixing.
function FieldNote({ problem, id }) {
  if (!problem) return null
  return (
    <p id={id} className="field-note">
      {problem.message}
    </p>
  )
}
