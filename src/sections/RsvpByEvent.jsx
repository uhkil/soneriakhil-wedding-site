// The RSVP form, organized by event (the new design; for now only in
// practice mode — see RsvpSection.jsx). Two cards, always open:
//   - Who's coming?: one short row per event, with a name button ("chip")
//     for each person invited to it. Tap the people who are coming; tapping
//     anyone marks everyone else as not coming, and "None of us" marks the
//     whole group as not coming. An event counts as answered once someone's
//     tapped (or "None of us").
//   - Your details: for each person, their email, phone, and dietary needs
//     (and a plus-one's name); then the mailing address and one note for the
//     whole invitation. The invitation needs at least one email and one
//     phone number; the rest are optional.
//
// The answers are the same as before (each person's yes/no for each event,
// their contact details and dietary needs), so they save to the Sheet the
// same way.
//
// If something's missing when they press Send, the spots are outlined with
// a short note, the page scrolls to the first one, and a message by the
// button says what to do.
import { useEffect, useRef, useState } from 'react'
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
  const [celebrate, setCelebrate] = useState(null)
  // Which tab is showing: 'coming' (who's coming to each event) or 'details'.
  const [tab, setTab] = useState('coming')

  const displayName = (g) => (g.isPlusOne ? 'Your guest' : `${g.firstName} ${g.lastName}`)
  const onFile = (g) => party.onFile?.[g.guestId] || {}
  const people = party.guests
  const invitedTo = (ev) => people.filter((g) => g.invitedEvents.includes(ev.id))
  // An invitation for just one person: Accept / Decline instead of names.
  const solo = people.length === 1
  const noteOnFile = people.some((g) => onFile(g).note)

  // The chips show first names (full names if two people share one).
  const firstNames = people.map((g) => g.firstName)
  const chipName = (g) =>
    g.isPlusOne ? 'Your guest' : firstNames.filter((n) => n === g.firstName).length > 1 ? displayName(g) : g.firstName

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
    // Each event: answered for everyone invited to it.
    party.events.forEach((ev) => {
      if (invitedTo(ev).some((g) => !answers[g.guestId].attending[ev.id])) {
        const message = solo ? 'Please choose Accept or Decline.' : 'Please check everyone who’s coming, or “None of us.”'
        list.push({ id: `event-${ev.id}`, card: `event-${ev.id}`, message })
      }
    })
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
      const phoneText = a.phone.trim()
      if (phoneText && !isValidPhone(phoneText)) {
        list.push({
          id: `phone-${g.guestId}`,
          card: 'details',
          message: phoneText.startsWith('+') ? 'Please check the phone number.' : 'Please enter a 10-digit phone number.',
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

  // Tap a person: they switch between coming and not, and anyone not yet
  // answered for this event is marked not coming. "None of us": no one is.
  function tapPerson(ev, g) {
    setAnswers((all) => {
      const copy = { ...all }
      invitedTo(ev).forEach((p) => {
        const a = { ...copy[p.guestId], attending: { ...copy[p.guestId].attending } }
        if (p.guestId === g.guestId) a.attending[ev.id] = a.attending[ev.id] === 'yes' ? 'no' : 'yes'
        else if (!a.attending[ev.id]) a.attending[ev.id] = 'no'
        copy[p.guestId] = a
      })
      return copy
    })
    setStatus('editing')
  }
  function noneOfUs(ev) {
    invitedTo(ev).forEach((g) => updateGuest(g.guestId, (c) => (c.attending[ev.id] = 'no')))
  }

  // One event: its name and date, then a chip for each person invited.
  function eventChips(ev) {
    const invited = invitedTo(ev)
    const problem = problemFor(`event-${ev.id}`)
    const answered = invited.every((g) => answers[g.guestId].attending[ev.id])
    const nobody = answered && invited.every((g) => answers[g.guestId].attending[ev.id] === 'no')
    return (
      <div
        key={ev.id}
        id={`event-${ev.id}`}
        tabIndex={-1}
        className={`rsvp-chip-event${problem ? ' missing' : ''}`}
        role="group"
        aria-labelledby={`event-${ev.id}-name`}
        {...invalid(problem, `event-${ev.id}-note`)}
      >
        <p className="rsvp-event-head" id={`event-${ev.id}-name`}>
          {ev.name}
          <span>
            {ev.date} · {ev.timeOfDay}
          </span>
        </p>
        <div className="rsvp-chips">
          {solo
            ? // Just one person: Accept or Decline.
              [
                ['yes', 'Accept'],
                ['no', 'Decline'],
              ].map(([value, label]) => {
                const g = invited[0]
                const picked = answers[g.guestId].attending[ev.id] === value
                return (
                  <button
                    key={value}
                    type="button"
                    className={`rsvp-chip${picked ? ' on' : ''}`}
                    aria-pressed={picked}
                    aria-label={`${label} ${ev.name}`}
                    onClick={() => updateGuest(g.guestId, (c) => (c.attending[ev.id] = value))}
                  >
                    <CheckBox />
                    {label}
                  </button>
                )
              })
            : // A family: a box to check for each person who's coming.
              invited.map((g) => {
                const coming = answers[g.guestId].attending[ev.id] === 'yes'
                return (
                  <button
                    key={g.guestId}
                    type="button"
                    className={`rsvp-chip${coming ? ' on' : ''}`}
                    aria-pressed={coming}
                    aria-label={`${displayName(g)} is coming to ${ev.name}`}
                    onClick={() => tapPerson(ev, g)}
                  >
                    <CheckBox />
                    {chipName(g)}
                  </button>
                )
              })}
          {!solo && (
            <button
              type="button"
              className={`rsvp-chip rsvp-chip-none${nobody ? ' on' : ''}`}
              aria-pressed={nobody}
              onClick={() => noneOfUs(ev)}
            >
              <CheckBox />
              None of us
            </button>
          )}
        </div>
        {problem && (
          <p id={`event-${ev.id}-note`} className="field-note rsvp-chip-note">
            {problem.message}
          </p>
        )}
      </div>
    )
  }



  async function save() {
    setChecked(true)
    const found = findProblems()
    if (found.length) {
      setError('')
      // Go to the tab with the first thing missing, then to that spot.
      const onEvents = found[0].card.startsWith('event-')
      setTab(onEvents ? 'coming' : 'details')
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const spot = document.getElementById(found[0].id)
        const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        spot?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' })
        ;(spot?.querySelector('input') ?? spot)?.focus({ preventScroll: true })
      }))
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
          : 'Let us know who’s coming to each event, then add your details.'}
      </p>

      <div className="rsvp-form rsvp-v2" role="form" aria-label="RSVP">
        {/* Two tabs (the same pill toggle as Travel's): who's coming, and your
            details. A coral dot marks a tab with something still missing. */}
        <div
          className="view-toggle travel-toggle rsvp-tabs"
          role="tablist"
          aria-label="RSVP steps"
          style={{ '--index': tab === 'coming' ? 0 : 1, '--count': 2 }}
        >
          {[
            ['coming', 'Who’s coming?', (p) => p.card.startsWith('event-')],
            ['details', 'Your details', (p) => !p.card.startsWith('event-')],
          ].map(([id, label, belongs]) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`card-${id}`}
              className={tab === id ? 'selected' : ''}
              onClick={() => setTab(id)}
            >
              {label}
              {problems.some(belongs) && <span className="rsvp-tab-dot" aria-label="(needs attention)" />}
            </button>
          ))}
        </div>

        {tab === 'coming' && (
        <Card id="coming" title="Who’s coming?">
          <p className="rsvp-chip-hint">
            {solo ? 'Let us know if you can make it to each event.' : 'Check everyone who’s coming to each event.'}
          </p>
          {party.events.map((ev) => eventChips(ev))}
        </Card>

        )}

        {tab === 'details' && (
        <Card id="details" title="Your details">
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
                    <span className="rsvp-label-row">
                      <label htmlFor={id('phone')}>Phone</label>
                      <InfoTip id={`${id('phone')}-info`} label="About phone numbers outside the US">
                        Outside the US? Start with + and the country code (like +91 or +44).
                      </InfoTip>
                    </span>
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

          <div className="rsvp-details-part">
            <RsvpAddress
              bare
              address={address}
              onChange={(change) => {
                setAddress(change)
                setStatus('editing')
              }}
              onFile={party.addressOnFile}
              saved={party.addressMasked}
              problemFor={(field) => problemFor(`addr-${field}`)}
            />
          </div>

          <div className="rsvp-details-part rsvp-field">
            <label htmlFor="rsvp-note" className="rsvp-subhead">
              A note for Soneri &amp; Akhil
            </label>
            <textarea
              id="rsvp-note"
              rows="3"
              placeholder={noteOnFile ? 'We have your note. Write a new one to replace it, or leave blank to keep it.' : 'Optional'}
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
                setStatus('editing')
              }}
            />
          </div>
        </Card>

        )}

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

        {/* First tab: on to the details. Second tab: send. */}
        {tab === 'coming' ? (
          <button
            className="button rsvp-submit"
            type="button"
            onClick={() => {
              setTab('details')
              requestAnimationFrame(() => document.querySelector('.rsvp-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
            }}
          >
            Next: your details →
          </button>
        ) : (
          <button className="button rsvp-submit" type="button" onClick={save} disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : party.hasResponded ? 'Update RSVP' : 'Send RSVP'}
          </button>
        )}
      </div>
      <RsvpCelebration open={Boolean(celebrate)} attending={celebrate?.attending} onClose={() => setCelebrate(null)} />
    </>
  )
}

// One card: its title in a light label, and what's inside (always open).
function Card({ id, title, children }) {
  return (
    <div id={`card-${id}`} role="group" aria-labelledby={`card-${id}-title`} className={`rsvp-guest open rsvp-card-${id}`}>
      {/* The tab above already names the card, so its title is for screen readers only. */}
      <p className="visually-hidden" id={`card-${id}-title`}>
        {title}
      </p>
      <div className="rsvp-card-body">{children}</div>
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

// The box inside each pill: empty until picked, then checked. It's always
// there, so a pill doesn't change size when it's picked.
function CheckBox() {
  return (
    <span className="rsvp-chip-box" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  )
}

// A small "i" next to a label: tap (or point at) it for a short tip.
// Tapping anywhere else, or Escape, closes it.
function InfoTip({ id, label, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])
  return (
    <span className={`info-tip${open ? ' open' : ''}`} ref={ref}>
      <button type="button" className="info-tip-button" aria-label={label} aria-expanded={open} aria-describedby={id} onClick={() => setOpen((o) => !o)}>
        i
      </button>
      <span className="info-tip-bubble" role="tooltip" id={id}>
        {children}
      </span>
    </span>
  )
}
