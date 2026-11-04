// The RSVP form, for everyone on the invitation at once. Each person has their
// own card, closed to start; clicking their name (or the + beside it) opens it.
// In each card:
//   - Accept or decline each event they're invited to.
//   - Dietary needs (optional).
//   - Their email and phone number (both required), and an optional note for
//     Soneri & Akhil. Phones outside the US start with + and the country code.
//     Several people can share the same email or phone. (An unnamed plus-one also gets a box for their name;
//     if they're not coming and have no name, the rest can be left blank.)
// Answers are saved to the Google Sheet. Guests can come back and change them.
//
// Saved emails and phones come back partly hidden (p•••h@gmail.com,
// •••-•••-1234) and show in grey inside their (empty) boxes so guests can
// check them, with "On file. Leave blank to keep it." underneath. Saved notes
// aren't shown at all.
//
// Once it's saved, a pop-up celebrates (see RsvpCelebration.jsx).
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
import RsvpCelebration from '../components/RsvpCelebration.jsx'
import RsvpAddress from '../components/RsvpAddress.jsx'
import { ABROAD, addressProblems, isStarted, livesAbroad, startingAddress } from '../guest/address.js'
import SideDrawing from '../components/SideDrawing.jsx'
// The email and phone rules (the same ones the Sheet checks), so a typo is
// caught before sending.
import { EMAIL, COM_TYPO, formatPhone, isValidPhone } from '../guest/contact.js'
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
  // The "it's saved!" pop-up, and whether anyone in the party is coming
  // (confetti) or everyone declined (a softer thank-you).
  const [celebrate, setCelebrate] = useState(null) // null | { attending: true/false }
  // The mailing address (one for the whole invitation). Its boxes start
  // empty; a saved one only shows as the city it's in (party.addressOnFile).
  const [address, setAddress] = useState(() => startingAddress(party.addressOnFile))
  const updateAddress = (change) => {
    setAddress(change)
    setStatus('editing')
  }

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
      else if (email && COM_TYPO.test(email)) {
        list.push({ id: `email-${g.guestId}`, message: 'Please check the ending of the email (did you mean .com?).' })
      } else if (email && !EMAIL.test(email)) {
        list.push({ id: `email-${g.guestId}`, message: 'Please check the email address (e.g. name@example.com).' })
      }
      if (!phone && !saved.phone) list.push({ id: `phone-${g.guestId}`, message: 'Please add a phone number.' })
      else if (phone && !isValidPhone(phone)) {
        list.push({
          id: `phone-${g.guestId}`,
          message: phone.startsWith('+') ? 'Please check the phone number.' : 'Please enter a 10-digit phone number.',
        })
      }
    }
    return list
  }

  // The address is needed unless one is already saved (then only checked if
  // the guest starts changing it, or unchecks "I don't live in the US").
  const problemsForAddress = () =>
    !party.addressOnFile || isStarted(address) || (livesAbroad(party.addressOnFile) && address.country === 'US')
      ? addressProblems(address, party.addressMasked).map((p) => ({ id: `addr-${p.field}`, field: p.field, message: p.message }))
      : []
  const findProblems = () => [...party.guests.flatMap(problemsFor), ...problemsForAddress()]
  const problems = checked ? findProblems() : []
  const problemFor = (id) => problems.find((p) => p.id === id)

  async function save() {
    setChecked(true)
    const found = findProblems()
    if (found.length) {
      setError('')
      // Open every card that needs something, then bring the first problem
      // into view and put the keyboard there.
      setOpenCards(
        (open) =>
          new Set([
            ...open,
            ...party.guests.filter((g) => problemsFor(g).length).map((g) => g.guestId),
            ...(problemsForAddress().length ? ['address'] : []),
          ])
      )
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
        // "I don't live in the United States" is saved as such (no address);
        // otherwise blank boxes keep the saved address.
        address: address.country !== 'US' ? (livesAbroad(party.addressOnFile) ? null : ABROAD) : isStarted(address) ? address : null,
      })
      setParty(updated) // the site now shows the saved version
      // Saved contact info stays private, so clear those boxes (they'll say "on file").
      setAnswers((all) =>
        Object.fromEntries(Object.entries(all).map(([id, a]) => [id, { ...a, email: '', phone: '', note: '' }]))
      )
      setAddress(startingAddress(updated.addressOnFile))
      setStatus('saved')
      const anyoneComing = Object.values(answers).some((a) => Object.values(a.attending).includes('yes'))
      setCelebrate({ attending: anyoneComing })
    } catch (err) {
      setError(err.message)
      setStatus('editing')
    }
  }

  return (
    <Section id="rsvp" className="rsvp">
      {/* A side drawing just above the title, in its dark strip (see SideDrawing.jsx). */}
      <SideDrawing name="poolDate" side="left" />
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

      {/* Not a <form>: browsers (Safari especially) offer to "save contact
          info" when a form with email and phone boxes is submitted. The
          button saves the answers itself instead, so there's nothing for the
          browser to catch. (It can still offer to fill the boxes in.) */}
      <div className="rsvp-form" role="form" aria-label="RSVP">
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
                    placeholder={onFileText(saved.email) || 'name@example.com'}
                    value={a.email}
                    onChange={(e) => updateGuest(g.guestId, (c) => (c.email = e.target.value))}
                    {...described(problemFor(`email-${g.guestId}`), `email-${g.guestId}-note`, saved.email && `email-${g.guestId}-saved`)}
                  />
                  <OnFile value={saved.email} id={`email-${g.guestId}-saved`} />
                  <FieldNote problem={problemFor(`email-${g.guestId}`)} id={`email-${g.guestId}-note`} />
                </div>

                <div className="rsvp-field">
                  <label htmlFor={`phone-${g.guestId}`}>Phone</label>
                  <input
                    id={`phone-${g.guestId}`}
                    type="tel"
                    inputMode="numeric" // phones show the number pad
                    autoComplete={g.isPlusOne ? 'off' : 'tel'}
                    placeholder={onFileText(saved.phone) || '555-555-5555'}
                    value={a.phone}
                    // Anything but digits (and a "+" at the start) is dropped as
                    // it's typed or pasted; dashes and spaces are added automatically.
                    onChange={(e) => updateGuest(g.guestId, (c) => (c.phone = formatPhone(e.target.value)))}
                    {...described(
                      problemFor(`phone-${g.guestId}`),
                      `phone-${g.guestId}-note`,
                      saved.phone && `phone-${g.guestId}-saved`,
                      `phone-${g.guestId}-hint`
                    )}
                  />
                  <OnFile value={saved.phone} id={`phone-${g.guestId}-saved`} />
                  <p className="field-hint" id={`phone-${g.guestId}-hint`}>
                    Outside the US? Start with + and your country code (like +91 or +44).
                  </p>
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

        <RsvpAddress
          address={address}
          onChange={updateAddress}
          onFile={party.addressOnFile}
          saved={party.addressMasked}
          open={openCards.has('address')}
          onToggle={() => toggleCard('address')}
          problemFor={(field) => problemFor(`addr-${field}`)}
          flagged={checked && problemsForAddress().length > 0}
        />

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
      </div>
      <RsvpCelebration open={Boolean(celebrate)} attending={celebrate?.attending} onClose={() => setCelebrate(null)} />
    </Section>
  )
}

// For a box or question with a problem: tells screen readers it needs fixing
// and which note explains why.
function invalid(problem, noteId) {
  return problem ? { 'aria-invalid': true, 'aria-describedby': noteId } : {}
}

// Like invalid(), for a box that also has helping lines under it (their ids
// in "hintIds"; blank ones are skipped), which screen readers read out too.
function described(problem, noteId, ...hintIds) {
  const ids = [...hintIds, problem && noteId].filter(Boolean).join(' ')
  return { ...(problem ? { 'aria-invalid': true } : {}), ...(ids ? { 'aria-describedby': ids } : {}) }
}

// What a box shows in grey when something's saved: the saved email or phone,
// partly hidden (p•••h@gmail.com). An older back end only says whether
// something is saved, not what, so then it just says "On file".
function onFileText(value) {
  if (!value) return ''
  return typeof value === 'string' ? value : 'On file'
}

// The line under an email or phone box when something's saved.
function OnFile({ value, id }) {
  if (!value) return null
  return (
    <p className="field-hint" id={id}>
      On file. Leave blank to keep it.
    </p>
  )
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
