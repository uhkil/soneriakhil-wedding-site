// The "Mailing address" card on the RSVP form: one address for the whole
// invitation (for thank-you cards and anything else we mail).
//
// Separate boxes (street, apartment, ZIP, city, state), so browsers and
// iPhones can fill in a saved address in one tap. Typing a US ZIP code fills
// in the city and state (the guest can still change them). Guests outside the
// US pick their country and get the usual international boxes instead.
//
// A saved address isn't sent back to the website: the card only says the
// city it's in ("On file: Dallas, TX"), and leaving the boxes blank keeps it.
import { useEffect, useRef } from 'react'
import { COUNTRIES, US_STATES, ZIP, lookUpZip } from '../guest/address.js'

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

  // One labeled box. "name" is the browser's autofill hint.
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
          {onFile
            ? `On file: an address in ${onFile}. Leave these blank to keep it, or fill them in to change it.`
            : 'One address for everyone on your invitation, for anything we mail you.'}
        </p>

        <div className="rsvp-field address-country">
          <label htmlFor="addr-country">Country</label>
          <select id="addr-country" autoComplete="country" value={address.country} onChange={(e) => set('country', e.target.value)}>
            {COUNTRIES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>
        {address.country === 'OTHER' && box('otherCountry', 'Which country?', { autoComplete: 'country-name' })}

        {box('street', 'Street address', { autoComplete: 'address-line1' })}
        {box('apt', 'Apartment, suite, etc. (optional)', { autoComplete: 'address-line2' })}

        {us ? (
          <>
            {box('zip', 'ZIP code', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 10 })}
            <div className="address-row">
              {box('city', 'City', { autoComplete: 'address-level2' })}
              <div className="rsvp-field address-state">
                <label htmlFor="addr-state">State</label>
                <select
                  id="addr-state"
                  autoComplete="address-level1"
                  value={address.state}
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
            </div>
          </>
        ) : (
          <>
            {box('city', 'City / town', { autoComplete: 'address-level2' })}
            <div className="address-row">
              {box('state', 'State / province (optional)', { autoComplete: 'address-level1' })}
              {box('zip', 'Postal code (if any)', { autoComplete: 'postal-code' })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
