// The RSVP form, for everyone on the invitation at once.
//   - Each person: accept or decline each event they're invited to, plus dietary needs.
//     (An unnamed plus-one also gets a box for their name.)
//   - The whole party: email, phone, and an optional note for Soneri & Akhil.
// Answers are saved to the Google Sheet. Guests can come back and change them.
//
// Saved email, phone, and notes are never sent back to the website, so those
// boxes start empty and say "on file"; leaving them blank keeps what's saved.
import { useState } from 'react'
import Section from '../components/Section.jsx'
import IllustrationSlot from '../components/IllustrationSlot.jsx'
import { useGuest } from '../guest/GuestProvider.jsx'
import { submitRsvp } from '../api/rsvpApi.js'

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
  const { party, token, setParty } = useGuest()
  const [answers, setAnswers] = useState(() => savedAnswers(party))
  const [contact, setContact] = useState(blankContact)
  const [status, setStatus] = useState('editing') // 'editing' | 'saving' | 'saved'
  const [error, setError] = useState('')

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

  // Returns a message if something is missing, or '' if the form is complete.
  function findProblem() {
    for (const g of party.guests) {
      const a = answers[g.guestId]
      if (g.invitedEvents.some((id) => !a.attending[id])) {
        return `Please answer every event for ${g.isPlusOne ? 'your guest' : g.firstName}.`
      }
      if (g.isPlusOne && Object.values(a.attending).includes('yes') && !a.name.trim()) {
        return "Please add your guest's name."
      }
    }
    return ''
  }

  async function save(event) {
    event.preventDefault()
    const problem = findProblem()
    setError(problem)
    if (problem) return

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
      <h2>RSVP</h2>
      <p className="rsvp-intro">
        {party.hasResponded
          ? 'We have your RSVP. You can change anything below and save again.'
          : 'Let us know who’s coming. One form covers everyone on your invitation.'}
      </p>

      <form onSubmit={save} noValidate>
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
                  />
                </div>
              )}

              {g.invitedEvents.map((eventId) => {
                const ev = eventsById[eventId]
                const group = `${g.guestId}-${eventId}`
                return (
                  <div key={eventId} className="rsvp-event" role="radiogroup" aria-label={`${ev.name}, ${displayName(g)}`}>
                    <p className="rsvp-event-name">
                      {ev.name}
                      <span>
                        {ev.date} · {ev.timeOfDay}
                      </span>
                    </p>
                    <div className="rsvp-choices">
                      {[
                        ['yes', 'Joyfully accepts'],
                        ['no', 'Regretfully declines'],
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
            />
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

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {status === 'saved' && (
          <p className="form-success" role="status">
            Thank you! Your RSVP is saved. You can change it any time.
          </p>
        )}

        <button className="button rsvp-submit" type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : party.hasResponded ? 'Update RSVP' : 'Send RSVP'}
        </button>
      </form>

      <IllustrationSlot name="rsvpCouple" size="large" className="rsvp-art" />
    </Section>
  )
}
