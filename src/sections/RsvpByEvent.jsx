// The RSVP form, organized by event, in two tabs (one card showing at a time):
//   - Who's coming?: each event (its name in heading style, then its date),
//     with a line per person invited to it and Yes / No beside their name
//     (Accept / Decline when the invitation is just for one person). Long
//     names shorten to first name + last initial when they don't fit.
//   - Your details: for each person, their email, phone, and dietary needs
//     (and a plus-one's name); then the mailing address and one note for the
//     whole invitation. The invitation needs at least one email or phone
//     number; the rest are optional.
//
// The answers are the same as before (each person's yes/no for each event,
// their contact details and dietary needs), so they save to the Sheet the
// same way.
//
// If something's missing when they press Send, the spots are outlined with
// a short note, the page scrolls to the first one, and a message by the
// button says what to do.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useGuest } from '../guest/GuestProvider.jsx'
import { submitRsvp } from '../api/rsvpApi.js'
import FormMessage from '../components/FormMessage.jsx'
import RsvpCelebration from '../components/RsvpCelebration.jsx'
import RsvpAddress from '../components/RsvpAddress.jsx'
import EventName from '../components/EventName.jsx'
import { ABROAD, addressProblems, isStarted, livesAbroad, startingAddress } from '../guest/address.js'
import { EMAIL, COM_TYPO, formatPhone, isValidPhone } from '../guest/contact.js'

const LOGGED_OUT = 'Please find your invitation again.'

// RSVPs close at the end of January 15, 2027, Arlington time. The Sheet's
// script sends its own date (party.rsvpCloses, which can be moved from the
// Settings tab); this is the fallback. After it, the form shows the
// guest's answers without letting them change, and the script refuses changes.
const RSVP_CLOSES = '2027-01-16T00:00:00-06:00'

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
  const closed = Date.now() >= new Date(party.rsvpCloses || RSVP_CLOSES).getTime()

  const displayName = (g) => (g.isPlusOne ? 'Your guest' : `${g.firstName} ${g.lastName}`)
  const onFile = (g) => party.onFile?.[g.guestId] || {}
  const people = party.guests
  const invitedTo = (ev) => people.filter((g) => g.invitedEvents.includes(ev.id))
  // An invitation for just one person: Accept / Decline instead of names.
  const solo = people.length === 1
  const noteOnFile = people.some((g) => onFile(g).note)

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
        const message = solo ? 'Please choose Accept or Decline.' : invitedTo(ev).length > 1 ? 'Please choose Yes or No for everyone.' : 'Please choose Yes or No.'
        list.push({ id: `event-${ev.id}`, card: `event-${ev.id}`, message })
      }
    })
    // Details: a plus-one who's coming needs a name; every email and phone
    // typed must look right; and the invitation needs at least one of either.
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
    if (!anyEmail && !anyPhone) {
      list.push({ id: `email-${first.guestId}`, card: 'details', message: 'Please add at least one email or phone number for your invitation.' })
    }
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

  // One event: its name and date, then a line per person with Yes / No
  // (Accept / Decline when the invitation is just for one person).
  function eventChips(ev) {
    const invited = invitedTo(ev)
    const problem = problemFor(`event-${ev.id}`)
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
          <EventName name={ev.name} />
          <span className="rsvp-event-when">
            {ev.date} · {ev.timeOfDay}
          </span>
        </p>
        <div className="rsvp-toggle-list">
          {invited.map((g) => {
            const group = `${g.guestId}-${ev.id}`
            const state = answers[g.guestId].attending[ev.id]
            return (
              <div key={g.guestId} className={`rsvp-toggle-row${problem && !state ? ' unanswered' : ''}`}>
                <NameFit full={displayName(g)} short={g.isPlusOne ? displayName(g) : `${g.firstName} ${g.lastName.charAt(0)}.`} />
                <span className="rsvp-choices" role="radiogroup" aria-label={`${displayName(g)}, ${ev.name}`}>
                  {(solo
                    ? [
                        ['yes', 'Accept'],
                        ['no', 'Decline'],
                      ]
                    : [
                        ['yes', 'Yes'],
                        ['no', 'No'],
                      ]
                  ).map(([value, label]) => (
                    <span key={value} className="rsvp-choice">
                      <input
                        type="radio"
                        id={`${group}-${value}`}
                        name={group}
                        value={value}
                        checked={state === value}
                        onChange={() => updateGuest(g.guestId, (c) => (c.attending[ev.id] = value))}
                      />
                      <label htmlFor={`${group}-${value}`}>{label}</label>
                    </span>
                  ))}
                </span>
              </div>
            )
          })}
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

  if (closed) {
    return (
      <>
        <p className="rsvp-intro">
          {party.hasResponded
            ? 'RSVPs closed on January 15. Here’s what we have for you. If something has changed, please reach out to us.'
            : 'RSVPs closed on January 15. If you still need to RSVP, please reach out to us.'}
        </p>
        {party.hasResponded && (
          // Their answers, to look at but not change.
          <fieldset className="rsvp-form rsvp-v2 rsvp-closed" disabled aria-label="Your RSVP">
            <Card id="coming" title="Who’s coming?">
              <p className="rsvp-chip-hint">Your answers:</p>
              {party.events.map((ev) => eventChips(ev))}
            </Card>
          </fieldset>
        )}
      </>
    )
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
            Will you be able to join us?
          </p>
          {party.events.map((ev) => eventChips(ev))}
        </Card>

        )}

        {tab === 'details' && (
        <Card id="details" title="Your details">
          <p className="field-hint rsvp-details-intro">
            We need at least one email or phone number for your invitation. Add them for everyone if you’d like.
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


// A small "i" next to a label. On iPads and laptops: point at it or tap it
// for a little bubble (tapping anywhere else, or Escape, closes it). On
// phones: tapping it shows the tip as a message over a light overlay, with
// "Got it" to close.
function InfoTip({ id, label, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const dialog = useRef(null)
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
  const onPhone = () => window.matchMedia('(max-width: 699px)').matches
  return (
    <span className={`info-tip${open ? ' open' : ''}`} ref={ref}>
      <button
        type="button"
        className="info-tip-button"
        aria-label={label}
        aria-describedby={id}
        onClick={() => (onPhone() ? dialog.current?.showModal() : setOpen((o) => !o))}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="8.25" />
          <path d="M10 9v5" />
          <circle className="info-dot" cx="10" cy="6.1" r="0.6" />
        </svg>
      </button>
      <span className="info-tip-bubble" role="tooltip" id={id}>
        {children}
      </span>
      <dialog
        ref={dialog}
        className="info-dialog"
        aria-label={label}
        onClick={(e) => e.target === e.currentTarget && dialog.current.close()}
      >
        <div className="info-dialog-card">
          <p>{children}</p>
          <button type="button" className="button info-dialog-close" onClick={() => dialog.current.close()}>
            Got it
          </button>
        </div>
      </dialog>
    </span>
  )
}

// A person's name on one line: in full when it fits; otherwise first name
// and last initial ("Bartholomew V."); and if even that's too long, it
// wraps. Checked again whenever the space changes (e.g. turning a phone)
// and once the site's fonts have loaded.
let measurer
function textWidth(text, el) {
  measurer ??= document.createElement('canvas').getContext('2d')
  const style = getComputedStyle(el)
  measurer.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  return measurer.measureText(text).width
}
function NameFit({ full, short }) {
  const box = useRef(null)
  const [useShort, setUseShort] = useState(false)
  useLayoutEffect(() => {
    const check = () => box.current && setUseShort(textWidth(full, box.current) > box.current.clientWidth)
    check()
    document.fonts?.ready.then(check)
    const watch = new ResizeObserver(check)
    watch.observe(box.current)
    return () => watch.disconnect()
  }, [full])
  return (
    <span className="rsvp-toggle-name" ref={box} title={useShort ? full : undefined}>
      {useShort ? (
        <>
          <span aria-hidden="true">{short}</span>
          <span className="visually-hidden">{full}</span>
        </>
      ) : (
        full
      )}
    </span>
  )
}
