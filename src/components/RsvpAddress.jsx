// The "Mailing address" card on the RSVP form: one address for the whole
// invitation (for thank-you cards and anything else we mail).
//
// Separate boxes (street, apartment, city, state, ZIP), so browsers and
// iPhones can fill in a saved address in one tap. Typing a US ZIP code fills
// in the city and state if they're still empty (the guest can change them).
// "I don't live in the United States" locks the boxes (clicking them says
// there's no need) and saves "Lives outside the US" instead of an address.
//
// A saved address isn't sent back to the website: the card only says the
// city it's in ("On file: Dallas, TX"), and leaving the boxes blank keeps it.
import { useEffect, useRef, useState } from 'react'
import { US_STATES, ZIP, livesAbroad, lookUpZip } from '../guest/address.js'

export default function RsvpAddress({ address, onChange, onFile, open, onToggle, problemFor, flagged }) {
  const us = address.country === 'US'
  const set = (field, value) => onChange((a) => ({ ...a, [field]: value }))
  // Which of city / state were filled in from the ZIP code (so a new ZIP
  // can replace them, but never something the guest typed themselves).
  const autoFilled = useRef({ city: false, state: false })

  // A full US ZIP code fills in the city and state.
  const zip5 = address.zip.trim().slice(0, 5)
  useEffect(() => {
    if (!us || !ZIP.test(address.zip.trim())) return
    const controller = new AbortController()
    lookUpZip(zip5, controller.signal).then((place) => {
      if (!place || controller.signal.aborted) return
      onChange((a) => {
        const next = { ...a }
        if (!a.city.trim() || autoFilled.current.city) {
          next.city = place.city
          autoFilled.current.city = true
        }
        if (!a.state || autoFilled.current.state) {
          next.state = place.state
          autoFilled.current.state = true
        }
        return next
      })
    })
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zip5, us])

  // "I don't live in the United States": the boxes are locked, and clicking
  // them shows a little bubble explaining why (for a few seconds).
  const abroad = !us
  const [tip, setTip] = useState(null) // where the bubble is: { x, y } inside the boxes
  const tipTimer = useRef(null)
  const showTip = (e) => {
    const box = e.currentTarget.getBoundingClientRect()
    // Above where they clicked, but never past the card's edges (the bubble
    // is at most 260px wide, or 80% of the boxes' width).
    const half = Math.min(130, box.width * 0.4)
    const x = Math.min(Math.max(e.clientX - box.left, half), box.width - half)
    setTip({ x, y: e.clientY - box.top })
    clearTimeout(tipTimer.current)
    tipTimer.current = setTimeout(() => setTip(null), 2800)
  }
  useEffect(() => () => clearTimeout(tipTimer.current), [])
  useEffect(() => {
    if (!abroad) setTip(null)
  }, [abroad])

  // One labeled box. "autoComplete" is the browser's autofill hint.
  const box = (field, label, props = {}) => {
    const problem = problemFor(field)
    const id = `addr-${field}`
    return (
      <div className={`rsvp-field address-${field}`}>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type="text"
          value={address[field]}
          disabled={abroad}
          onChange={(e) => {
            if (field === 'city') autoFilled.current.city = false
            set(field, e.target.value)
          }}
          {...props}
          {...(problem ? { 'aria-invalid': true, 'aria-describedby': `${id}-note` } : {})}
        />
        {problem && (
          <p id={`${id}-note`} className="field-note">
            {problem.message}
          </p>
        )}
      </div>
    )
  }

  const stateProblem = problemFor('state')
  return (
    <div
      role="group"
      aria-labelledby="rsvp-address-title"
      className={`rsvp-guest rsvp-address${open ? ' open' : ''}${flagged ? ' needs-attention' : ''}`}
    >
      <div className="rsvp-card-head">
        <button type="button" className="rsvp-card-toggle" aria-expanded={open} aria-controls="rsvp-address-body" onClick={onToggle}>
          <span className="rsvp-name" id="rsvp-address-title">
            Mailing address
          </span>
          <span className="rsvp-plus" aria-hidden="true" />
        </button>
      </div>

      <div className="rsvp-card-body" id="rsvp-address-body" hidden={!open}>
        <p className="field-hint address-intro">
          {livesAbroad(onFile)
            ? 'On file: you live outside the US, so there’s no address to add.'
            : onFile
              ? `On file: an address in ${onFile}. Leave these blank to keep it, or fill them in to change it.`
              : 'One address for everyone on your invitation, for anything we mail you.'}
        </p>

        <div className={`address-fields${abroad ? ' locked' : ''}`}>
          {box('street', 'Street address', { autoComplete: 'address-line1' })}
          {box('apt', 'Apartment, suite, etc. (optional)', { autoComplete: 'address-line2' })}
          <div className="address-row address-row-us">
            {box('city', 'City', { autoComplete: 'address-level2' })}
            <div className="rsvp-field address-state">
              <label htmlFor="addr-state">State</label>
              <select
                id="addr-state"
                autoComplete="address-level1"
                value={address.state}
                disabled={abroad}
                onChange={(e) => {
                  autoFilled.current.state = false
                  set('state', e.target.value)
                }}
                {...(stateProblem ? { 'aria-invalid': true, 'aria-describedby': 'addr-state-note' } : {})}
              >
                <option value="">Choose…</option>
                {US_STATES.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              {stateProblem && (
                <p id="addr-state-note" className="field-note">
                  {stateProblem.message}
                </p>
              )}
            </div>
            {box('zip', 'ZIP code', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 10 })}
          </div>
          <p className="field-hint address-zip-hint">Typing your ZIP code fills in the city and state.</p>

          {/* Locked: a see-through cover over the boxes catches clicks and
              shows the bubble (locked boxes can't be clicked themselves). */}
          {abroad && <div className="address-cover" onClick={showTip} aria-hidden="true" />}
          {abroad && tip && (
            <p className="address-tip" role="status" style={{ left: tip.x, top: tip.y }}>
              No need to add your address — it’s only for guests who live in the US.
            </p>
          )}
        </div>

        {/* Only the box itself is clickable (not the words or the space beside them). */}
        <div className="address-abroad">
          <input
            id="addr-abroad"
            type="checkbox"
            checked={abroad}
            aria-labelledby="addr-abroad-label"
            onChange={(e) => onChange((a) => ({ ...a, country: e.target.checked ? 'INTL' : 'US' }))}
          />
          <span id="addr-abroad-label">I don’t live in the United States</span>
        </div>
      </div>
    </div>
  )
}
