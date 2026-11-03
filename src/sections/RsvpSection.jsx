// The RSVP form, for everyone on the invitation at once. Each person has their
// own card, closed to start; clicking their name (or the + beside it) opens it.
// In each card:
//   - Accept or decline each event they're invited to.
//   - Dietary needs (optional).
//   - Their email and phone number (both required), and an optional note for
//     Soneri & Akhil. (An unnamed plus-one also gets a box for their name;
//     if they're not coming and have no name, the rest can be left blank.)
// Answers are saved to the Google Sheet. Guests can come back and change them.
//
// Saved emails, phones, and notes are never sent back to the website, so those
// boxes start empty and say "on file"; leaving them blank keeps what's saved.
//
// If something's missing when they press Send, the cards that need something
// open, each spot is outlined with a short note, the page scrolls to the first
// one, and a message by the button says what to do. The marks go away as each
// one is fixed. Problems saving (no internet, a logged-out invitation) show by
// the button too, and nothing they've typed is lost.
import { useState } from 'react'
import Section from '../components/Section.jsx'
import IllustrationSlot from '../components/IllustrationSlot.jsx'
import { useGuest } from '../guest/GuestProvider.jsx'
import { submitRsvp } from '../api/rsvpApi.js'
import FormMessage from '../components/FormMessage.jsx'

// The same checks the Sheet does, so a typo is caught before sending.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const enoughDigits = (phone) => phone.replace(/\D/g, '').length >= 7
// The Sheet's reply when the saved login no longer works (e.g. the passcode changed).
const LOGGED_OUT = 'Please find your invitation again.'

// Starts the form from whatever this party saved before (or blank). Contact
// boxes always start empty (saved ones stay private).
function savedAnswers(party) {
  const answers = {}
  party.guests.forEach((g) => {
    const saved = party.answers[g.guestId] || {}
    answers[g.guestId] = {
      name: g.isPlusOne ? saved.name || '' : '',
      dietary: saved.dietary || '',
      attending: { ...(saved.attending || {}) },
      email: '',
      phone: '',
      note: '',
    }
  })
  return answers
}

export default function RsvpSection() {
  const { party, token, setParty, logout } = useGuest()
  const [answers, setAnswers] = useState(() => savedAnswers(party))
  const [status, setStatus] = useState('editing') // 'editing' | 'saving' | 'saved'
  const [error, setError] = useState('')
  // Turns on after the first Send, so missing answers are only flagged once
  // the guest has tried to send (not while they're still filling it in).
  const [checked, setChecked] = useState(false)
  // Which people's cards are open (all closed to start).
  const [openCards, setOpenCards] = useState(() => new Set())

  const eventsById = Object.fromEntries(party.events.map((e) => [e.id, e]))
  const displayName = (g) => (g.isPlusOne ? 'Your guest' : `${g.firstName} ${g.lastName}`)
  const onFile = (g) => party.onFile?.[g.guestId] || {}

  function toggleCard(guestId) {
    setOpenCards((open) => {
      const next = new Set(open)
      next.has(guestId) ? next.delete(guestId) : next.add(guestId)
      return next
    })
  }

  // Updates one person's answer. "change" is a function that edits a copy.
  function updateGuest(guestId, change) {
    setAnswers((all) => {
      const copy = { ...all[guestId], attending: { ...all[guestId].attending } }
      change(copy)
      return { ...all, [guestId]: copy }
    })
    setStatus('editing')
  }

  // Does this person need to give an email and phone? Everyone does, except
  // an unnamed plus-one who isn't coming.
  const needsContact = (g) => !g.isPlusOne || answers[g.guestId].name.trim() !== ''

  // One person's problems, in the order they appear in their card:
  // { id (the spot on the page), message }.
  function problemsFor(g) {
    const a = answers[g.guestId]
    const saved = onFile(g)
    const list = []
    if (g.isPlusOne && Object.values(a.attending).includes('yes') && !a.name.trim()) {
      list.push({ id: `name-${g.guestId}`, message: 'Please add your guest’s name.' })
    }
    g.invitedEvents.forEach((eventId) => {
      if (!a.attending[eventId]) {
        list.push({ id: `${g.guestId}-${eventId}`, message: 'Please choose Accept or Decline.' })
      }
    })
    if (needsContact(g)) {
      const email = a.email.trim()
      const phone = a.phone.trim()
      if (!email && !saved.email) list.push({ id: `email-${g.guestId}`, message: 'Please add an email address.' })
      else if (email && !EMAIL.test(email)) {
        list.push({ id: `email-${g.guestId}`, message: 'Please check the email address (e.g. name@example.com).' })
      }
      if (!phone && !saved.phone) list.push({ id: `phone-${g.guestId}`, message: 'Please add a phone number.' })
      else if (phone && !enoughDigits(phone)) {
        list.push({ id: `phone-${g.guestId}`, message: 'Please check the phone number.' })
      }
    }
    return list
  }

  const findProblems = () => party.guests.flatMap(problemsFor)
  const problems = checked ? findProblems() : []
  const problemFor = (id) => problems.find((p) => p.id === id)

  async function save(event) {
    event.preventDefault()
    setChecked(true)
    const found = findProblems()
    if (found.length) {
      setError('')
      // Open every card that needs something, then bring the first problem
      // into view and put the keyboard there.
      setOpenCards((open) => new Set([...open, ...party.guests.filter((g) => problemsFor(g).length).map((g) => g.guestId)]))
      requestAnimationFrame(() => {
        const first = document.getElementById(found[0].id)
        const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        first?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' })
        ;(first?.querySelector('input') ?? first)?.focus({ preventScroll: true })
      })
      return
    }
    setError('')

    setStatus('saving')
    try {
      const updated = await submitRsvp({
        partyId: party.partyId,
        token,
        guests: party.guests.map((g) => ({ guestId: g.guestId, ...answers[g.guestId] })),
      })
      setParty(updated) // the site now shows the saved version
      // Saved contact info stays private, so clear those boxes (they'll say "on file").
      setAnswers((all) =>
        Object.fromEntries(Object.entries(all).map(([id, a]) => [id, { ...a, email: '', phone: '', note: '' }]))
      )
      setStatus('saved')
    } catch (err) {
      setError(err.message)
      setStatus('editing')
    }
  }

  return (
    <Section id="rsvp" className="rsvp">
      {/* Corner art just above the title (see "corner-art" in index.css). */}
      <IllustrationSlot name="rsvpCouple" size="small" className="corner-art corner-art-right" />
      {/* Everything from the title down. It's always at least a screen tall
          (see .rsvp-body in index.css), so a link to RSVP can bring the
          title right up to the top of the screen. */}
      <div className="rsvp-body">
      <h2>RSVP</h2>
      <p className="rsvp-intro">
        {party.hasResponded
          ? 'We have your RSVP. You can change anything below and save again.'
          : 'Let us know who’s coming. Open each person’s card to fill in their answers.'}
      </p>

      <form onSubmit={save} noValidate>
        {party.guests.map((g) => {
          const a = answers[g.guestId]
          const open = openCards.has(g.guestId)
          const saved = onFile(g)
          const bodyId = `rsvp-card-${g.guestId}`
          const flagged = checked && problemsFor(g).length > 0
          return (
            // One person's card. (A plain group, not a <fieldset>: Safari puts a
            // fieldset's title on the card's top edge, half outside the card.)
            <div
              key={g.guestId}
              role="group"
              aria-labelledby={`rsvp-name-${g.guestId}`}
              className={`rsvp-guest${open ? ' open' : ''}${flagged ? ' needs-attention' : ''}`}
            >
              <div className="rsvp-card-head">
                {/* The whole header opens and closes the card. */}
                <button
                  type="button"
                  className="rsvp-card-toggle"
                  aria-expanded={open}
                  aria-controls={bodyId}
                  onClick={() => toggleCard(g.guestId)}
                >
                  <span className="rsvp-name" id={`rsvp-name-${g.guestId}`}>
                    {displayName(g)}
                  </span>
                  <span className="rsvp-plus" aria-hidden="true" />
                </button>
              </div>

              <div className="rsvp-card-body" id={bodyId} hidden={!open}>
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
                    placeholder="Any allergies? Vegan? (optional)"
                    value={a.dietary}
                    onChange={(e) => updateGuest(g.guestId, (c) => (c.dietary = e.target.value))}
                  />
                </div>

                <div className="rsvp-field">
                  <label htmlFor={`email-${g.guestId}`}>Email</label>
                  <input
                    id={`email-${g.guestId}`}
                    type="email"
                    autoComplete={g.isPlusOne ? 'off' : 'email'}
                    placeholder={saved.email ? 'On file. Leave blank to keep it.' : 'name@example.com'}
                    value={a.email}
                    onChange={(e) => updateGuest(g.guestId, (c) => (c.email = e.target.value))}
                    {...invalid(problemFor(`email-${g.guestId}`), `email-${g.guestId}-note`)}
                  />
                  <FieldNote problem={problemFor(`email-${g.guestId}`)} id={`email-${g.guestId}-note`} />
                </div>

                <div className="rsvp-field">
                  <label htmlFor={`phone-${g.guestId}`}>Phone</label>
                  <input
                    id={`phone-${g.guestId}`}
                    type="tel"
                    autoComplete={g.isPlusOne ? 'off' : 'tel'}
                    placeholder={saved.phone ? 'On file. Leave blank to keep it.' : '(555) 555-5555'}
                    value={a.phone}
                    onChange={(e) => updateGuest(g.guestId, (c) => (c.phone = e.target.value))}
                    {...invalid(problemFor(`phone-${g.guestId}`), `phone-${g.guestId}-note`)}
                  />
                  <FieldNote problem={problemFor(`phone-${g.guestId}`)} id={`phone-${g.guestId}-note`} />
                </div>

                <div className="rsvp-field">
                  <label htmlFor={`note-${g.guestId}`}>A note for Soneri &amp; Akhil</label>
                  <textarea
                    id={`note-${g.guestId}`}
                    rows="3"
                    placeholder={
                      saved.note ? 'We have your note. Write a new one to replace it, or leave blank to keep it.' : 'Optional'
                    }
                    value={a.note}
                    onChange={(e) => updateGuest(g.guestId, (c) => (c.note = e.target.value))}
                  />
                </div>
              </div>
            </div>
          )
        })}

        {problems.length > 0 && (
          <FormMessage>
            {problems.length === 1
              ? 'One answer still needs your attention. It’s marked above.'
              : `${problems.length} answers still need your attention. They’re marked above.`}
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
      </div>
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
