// The RSVP form, organized by event (the new design; for now only in
// practice mode — see RsvpSection.jsx). Cards, in order:
//   - One per event the invitation is invited to (in date order): each
//     person invited to it, with Accept / Decline.
//   - Your details: for each person, their email, phone, and dietary needs
//     (and a plus-one's name). The invitation needs at least one email and
//     one phone number; the rest are optional.
//   - Mailing address (one for the whole invitation; see RsvpAddress.jsx).
//   - A note for Soneri & Akhil (one for the whole invitation).
// All cards start closed, and only one is open at a time.
//
// The answers are the same as before (each person's yes/no for each event,
// their contact details and dietary needs), so they save to the Sheet the
// same way.
//
// If something's missing when they press Send, the first card that needs
// something opens, its spots are outlined with a short note, the page
// scrolls there, cards with something missing are marked, and a message by
// the button says what to do.
import { useState } from 'react'
import { useGuest } from '../guest/GuestProvider.jsx'
import { submitRsvp } from '../api/rsvpApi.js'
import FormMessage from '../components/FormMessage.jsx'
import RsvpCelebration from '../components/RsvpCelebration.jsx'
import RsvpAddress from '../components/RsvpAddress.jsx'
import { ABROAD, addressProblems, isStarted, livesAbroad, startingAddress } from '../guest/address.js'
import { EMAIL, COM_TYPO, formatPhone, isValidPhone } from '../guest/contact.js'

const LOGGED_OUT = 'Please find your invitation again.'

function savedAnswers(party) {
  return Object.fromEntries(
    party.guests.map((g) => {
      const saved = party.answers[g.guestId] || {}
      return [
        g.guestId,
        {
          name: g.isPlusOne ? saved.name || '' : '',
          dietary: saved.dietary || '',
          attending: { ...(saved.attending || {}) },
          email: '',
          phone: '',
        },
      ]
    })
  )
}

export default function RsvpByEvent() {
  const { party, token, setParty, logout } = useGuest()
  const [answers, setAnswers] = useState(() => savedAnswers(party))
  const [note, setNote] = useState('')
  const [address, setAddress] = useState(() => startingAddress(party.addressOnFile))
  const [status, setStatus] = useState('editing') // 'editing' | 'saving' | 'saved'
  const [error, setError] = useState('')
  const [checked, setChecked] = useState(false) // after the first Send: flag what's missing
  const [openCard, setOpenCard] = useState(null) // the one open card (or none)
  const [celebrate, setCelebrate] = useState(null)

  const displayName = (g) => (g.isPlusOne ? 'Your guest' : `${g.firstName} ${g.lastName}`)
  const onFile = (g) => party.onFile?.[g.guestId] || {}
  const people = party.guests
  const invitedTo = (ev) => people.filter((g) => g.invitedEvents.includes(ev.id))
  const noteOnFile = people.some((g) => onFile(g).note)

  // Opening a card closes the one that was open; it scrolls into view if
  // closing the other moved it.
  function toggle(id) {
    setOpenCard((current) => (current === id ? null : id))
    requestAnimationFrame(() =>
      (document.getElementById(`card-${id}`) ?? document.querySelector(`.rsvp-${id}`))?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    )
  }

  function updateGuest(guestId, change) {
    setAnswers((all) => {
      const copy = { ...all[guestId], attending: { ...all[guestId].attending } }
      change(copy)
      return { ...all, [guestId]: copy }
    })
    setStatus('editing')
  }

  // ----- What's missing or wrong: { id (the spot), card, message } -----
  function findProblems() {
    const list = []
    // Each event: everyone invited to it has answered.
    party.events.forEach((ev) =>
      invitedTo(ev).forEach((g) => {
        if (!answers[g.guestId].attending[ev.id]) {
          list.push({ id: `${g.guestId}-${ev.id}`, card: `event-${ev.id}`, message: 'Please choose Accept or Decline.' })
        }
      })
    )
    // Details: a plus-one who's coming needs a name; every email and phone
    // typed must look right; and the invitation needs one of each.
    people.forEach((g) => {
      const a = answers[g.guestId]
      if (g.isPlusOne && Object.values(a.attending).includes('yes') && !a.name.trim()) {
        list.push({ id: `name-${g.guestId}`, card: 'details', message: 'Please add your guest’s name.' })
      }
      const email = a.email.trim()
      if (email && COM_TYPO.test(email)) {
        list.push({ id: `email-${g.guestId}`, card: 'details', message: 'Please check the ending of the email (did you mean .com?).' })
      } else if (email && !EMAIL.test(email)) {
        list.push({ id: `email-${g.guestId}`, card: 'details', message: 'Please check the email address (e.g. name@example.com).' })
      }
      const phone = a.phone.trim()
      if (phone && !isValidPhone(phone)) {
        list.push({
          id: `phone-${g.guestId}`,
          card: 'details',
          message: phone.startsWith('+') ? 'Please check the phone number.' : 'Please enter a 10-digit phone number.',
        })
      }
    })
    const first = people.find((g) => !g.isPlusOne) || people[0]
    const anyEmail = people.some((g) => answers[g.guestId].email.trim() || onFile(g).email)
    const anyPhone = people.some((g) => answers[g.guestId].phone.trim() || onFile(g).phone)
    if (!anyEmail) list.push({ id: `email-${first.guestId}`, card: 'details', message: 'Please add at least one email for your invitation.' })
    if (!anyPhone) list.push({ id: `phone-${first.guestId}`, card: 'details', message: 'Please add at least one phone number for your invitation.' })
    // The address is needed unless one is saved (then only checked if changed).
    if (!party.addressOnFile || isStarted(address) || (livesAbroad(party.addressOnFile) && address.country === 'US')) {
      addressProblems(address, party.addressMasked).forEach((p) => list.push({ id: `addr-${p.field}`, card: 'address', field: p.field, message: p.message }))
    }
    // In the order the cards appear.
    const order = [...party.events.map((ev) => `event-${ev.id}`), 'details', 'address']
    return list.sort((a, b) => order.indexOf(a.card) - order.indexOf(b.card))
  }
  const problems = checked ? findProblems() : []
  const problemFor = (id) => problems.find((p) => p.id === id)
  const cardFlagged = (card) => problems.some((p) => p.card === card)

  async function save() {
    setChecked(true)
    const found = findProblems()
    if (found.length) {
      setError('')
      setOpenCard(found[0].card)
      requestAnimationFrame(() => {
        const spot = document.getElementById(found[0].id)
        const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        spot?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' })
        ;(spot?.querySelector('input') ?? spot)?.focus({ preventScroll: true })
      })
      return
    }
    setError('')
    setStatus('saving')
    try {
      const firstId = people[0].guestId
      const updated = await submitRsvp({
        partyId: party.partyId,
        token,
        // (The one note travels with the first person, until the Sheet keeps
        // one note per invitation.)
        guests: people.map((g) => ({ guestId: g.guestId, ...answers[g.guestId], note: g.guestId === firstId ? note : '' })),
        address: address.country !== 'US' ? (livesAbroad(party.addressOnFile) ? null : ABROAD) : isStarted(address) ? address : null,
      })
      setParty(updated)
      setAnswers((all) => Object.fromEntries(Object.entries(all).map(([id, a]) => [id, { ...a, email: '', phone: '' }])))
      setNote('')
      setAddress(startingAddress(updated.addressOnFile))
      setStatus('saved')
      setOpenCard(null)
      setCelebrate({ attending: Object.values(answers).some((a) => Object.values(a.attending).includes('yes')) })
    } catch (err) {
      setError(err.message)
      setStatus('editing')
    }
  }

  return (
    <>
      <p className="rsvp-intro">
        {party.hasResponded
          ? 'We have your RSVP. You can change anything below and save again.'
          : 'Let us know who’s coming. Open each event to answer for everyone invited to it.'}
      </p>

      <div className="rsvp-form" role="form" aria-label="RSVP">
        {party.events.map((ev) => (
          <Card
            key={ev.id}
            id={`event-${ev.id}`}
            title={ev.name}
            sub={`${ev.date} · ${ev.timeOfDay}`}
            open={openCard === `event-${ev.id}`}
            flagged={cardFlagged(`event-${ev.id}`)}
            onToggle={toggle}
          >
            {invitedTo(ev).map((g) => {
              const group = `${g.guestId}-${ev.id}`
              const problem = problemFor(group)
              return (
                <div
                  key={g.guestId}
                  id={group}
                  tabIndex={-1}
                  className={`rsvp-person${problem ? ' missing' : ''}`}
                  role="radiogroup"
                  aria-label={`${displayName(g)}, ${ev.name}`}
                  {...invalid(problem, `${group}-note`)}
                >
                  <p className="rsvp-person-name">{displayName(g)}</p>
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
                          checked={answers[g.guestId].attending[ev.id] === value}
                          onChange={() => updateGuest(g.guestId, (c) => (c.attending[ev.id] = value))}
                        />
                        <label htmlFor={`${group}-${value}`}>{label}</label>
                      </span>
                    ))}
                  </div>
                  <FieldNote problem={problem} id={`${group}-note`} />
                </div>
              )
            })}
          </Card>
        ))}

        <Card id="details" title="Your details" open={openCard === 'details'} flagged={cardFlagged('details')} onToggle={toggle}>
          <p className="field-hint rsvp-details-intro">
            We need at least one email and one phone number for your invitation. Add them for everyone if you’d like.
          </p>
          {people.map((g) => {
            const a = answers[g.guestId]
            const saved = onFile(g)
            const id = (field) => `${field}-${g.guestId}`
            return (
              <div key={g.guestId} className="rsvp-details-person">
                <p className="rsvp-person-name">{displayName(g)}</p>
                {g.isPlusOne && (
                  <div className="rsvp-field">
                    <label htmlFor={id('name')}>Your guest’s name</label>
                    <input
                      id={id('name')}
                      type="text"
                      autoComplete="off"
                      value={a.name}
                      onChange={(e) => updateGuest(g.guestId, (c) => (c.name = e.target.value))}
                      {...invalid(problemFor(id('name')), `${id('name')}-note`)}
                    />
                    <FieldNote problem={problemFor(id('name'))} id={`${id('name')}-note`} />
                  </div>
                )}
                <div className="rsvp-details-row">
                  <div className="rsvp-field">
                    <label htmlFor={id('email')}>Email</label>
                    <input
                      id={id('email')}
                      type="email"
                      autoComplete={g.isPlusOne ? 'off' : 'email'}
                      placeholder={onFileText(saved.email) || 'name@example.com'}
                      value={a.email}
                      onChange={(e) => updateGuest(g.guestId, (c) => (c.email = e.target.value))}
                      {...described(problemFor(id('email')), `${id('email')}-note`, saved.email && `${id('email')}-saved`)}
                    />
                    <OnFile value={saved.email} id={`${id('email')}-saved`} />
                    <FieldNote problem={problemFor(id('email'))} id={`${id('email')}-note`} />
                  </div>
                  <div className="rsvp-field">
                    <label htmlFor={id('phone')}>Phone</label>
                    <input
                      id={id('phone')}
                      type="tel"
                      inputMode="numeric"
                      autoComplete={g.isPlusOne ? 'off' : 'tel'}
                      placeholder={onFileText(saved.phone) || '555-555-5555'}
                      value={a.phone}
                      onChange={(e) => updateGuest(g.guestId, (c) => (c.phone = formatPhone(e.target.value)))}
                      {...described(problemFor(id('phone')), `${id('phone')}-note`, saved.phone && `${id('phone')}-saved`)}
                    />
                    <OnFile value={saved.phone} id={`${id('phone')}-saved`} />
                    <FieldNote problem={problemFor(id('phone'))} id={`${id('phone')}-note`} />
                  </div>
                </div>
                <div className="rsvp-field">
                  <label htmlFor={id('diet')}>Dietary needs</label>
                  <input
                    id={id('diet')}
                    type="text"
                    placeholder="Any allergies? Vegan? (optional)"
                    value={a.dietary}
                    onChange={(e) => updateGuest(g.guestId, (c) => (c.dietary = e.target.value))}
                  />
                </div>
              </div>
            )
          })}
          <p className="field-hint">Outside the US? Start phone numbers with + and the country code (like +91 or +44).</p>
        </Card>

        <RsvpAddress
          address={address}
          onChange={(change) => {
            setAddress(change)
            setStatus('editing')
          }}
          onFile={party.addressOnFile}
          saved={party.addressMasked}
          open={openCard === 'address'}
          onToggle={() => toggle('address')}
          problemFor={(field) => problemFor(`addr-${field}`)}
          flagged={cardFlagged('address')}
        />

        <Card id="note" title="A note for Soneri & Akhil" open={openCard === 'note'} onToggle={toggle}>
          <div className="rsvp-field">
            <label htmlFor="rsvp-note" className="visually-hidden">
              A note for Soneri &amp; Akhil
            </label>
            <textarea
              id="rsvp-note"
              rows="4"
              placeholder={noteOnFile ? 'We have your note. Write a new one to replace it, or leave blank to keep it.' : 'Optional'}
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
                setStatus('editing')
              }}
            />
          </div>
        </Card>

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

        <button className="button rsvp-submit" type="button" onClick={save} disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : party.hasResponded ? 'Update RSVP' : 'Send RSVP'}
        </button>
      </div>
      <RsvpCelebration open={Boolean(celebrate)} attending={celebrate?.attending} onClose={() => setCelebrate(null)} />
    </>
  )
}

// One card: a header that opens and closes it (title, and an optional line
// under it, like the date), and what's inside.
function Card({ id, title, sub, open, flagged, onToggle, children }) {
  return (
    <div
      id={`card-${id}`}
      role="group"
      aria-labelledby={`card-${id}-title`}
      className={`rsvp-guest rsvp-card-${id.startsWith('event-') ? 'event' : id}${open ? ' open' : ''}${flagged ? ' needs-attention' : ''}`}
    >
      <div className="rsvp-card-head">
        <button type="button" className="rsvp-card-toggle" aria-expanded={open} aria-controls={`card-${id}-body`} onClick={() => onToggle(id)}>
          <span className="rsvp-card-titles">
            <span className="rsvp-name" id={`card-${id}-title`}>
              {title}
            </span>
            {sub && <span className="rsvp-card-sub">{sub}</span>}
          </span>
          <span className="rsvp-plus" aria-hidden="true" />
        </button>
      </div>
      <div className="rsvp-card-body" id={`card-${id}-body`} hidden={!open}>
        {children}
      </div>
    </div>
  )
}

function invalid(problem, noteId) {
  return problem ? { 'aria-invalid': true, 'aria-describedby': noteId } : {}
}

function described(problem, noteId, ...hintIds) {
  const ids = [...hintIds, problem && noteId].filter(Boolean).join(' ')
  return { ...(problem ? { 'aria-invalid': true } : {}), ...(ids ? { 'aria-describedby': ids } : {}) }
}

function onFileText(value) {
  if (!value) return ''
  return typeof value === 'string' ? value : 'On file'
}

function OnFile({ value, id }) {
  if (!value) return null
  return (
    <p className="field-hint" id={id}>
      On file. Leave blank to keep it.
    </p>
  )
}

function FieldNote({ problem, id }) {
  if (!problem) return null
  return (
    <p id={id} className="field-note">
      {problem.message}
    </p>
  )
}
