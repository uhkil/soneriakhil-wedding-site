// "Find your invitation": the login form on the landing page.
//   Step 1: type your first and last name, then press Enter (or the arrow
//   button inside the box).
//   (If several guests share that name, a popup asks which one you are.)
//   Step 2: type the wedding passcode (the same for everyone, printed on the invitation).
// If something's wrong (a blank box, a name that isn't on the list, the wrong
// passcode, no internet), a message appears under the box, the box is outlined
// in red, and the cursor goes back into it so the guest can fix it.
// Password managers are asked to leave these boxes alone (no filling in, no
// offers to save): see "NO_AUTOFILL" below.
import { useRef, useState } from 'react'
import { searchGuests } from '../../api/rsvpApi.js'
import { useGuest } from '../../guest/GuestProvider.jsx'
import FormMessage from '../FormMessage.jsx'

// Tells browsers and the common password managers (1Password, LastPass,
// Bitwarden, Dashlane) not to fill in or offer to save these boxes. Each
// manager listens for its own signal, so all of them are included.
const NO_AUTOFILL = {
  autoComplete: 'off',
  'data-1p-ignore': true,
  'data-lpignore': 'true',
  'data-bwignore': true,
  'data-form-type': 'other',
}

export default function FindInvitation() {
  const { login } = useGuest()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [matches, setMatches] = useState([]) // guests sharing the typed name
  const [guest, setGuest] = useState(null) // the guest chosen for step 2
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const dialog = useRef(null)
  const nameBox = useRef(null)
  const codeBox = useRef(null)

  // Shows a problem and puts the cursor back in the box to fix it.
  function fail(message, box) {
    setError(message)
    box.current?.focus()
  }

  // Step 1: look up the name.
  async function findName(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (!name.trim()) return fail('Please enter your first and last name.', nameBox)
    setError('')
    setBusy(true)
    try {
      const found = await searchGuests(name)
      if (found.length === 1) {
        setGuest(found[0])
      } else {
        setMatches(found)
        dialog.current.showModal() // "Which one is you?"
      }
    } catch (err) {
      fail(err.message, nameBox)
    } finally {
      setBusy(false)
    }
  }

  function choose(match) {
    dialog.current.close()
    setGuest(match)
  }

  // Step 2: check the passcode. On success the whole site opens, so this form goes away.
  async function openInvitation(event) {
    event.preventDefault()
    if (!code.trim()) return fail('Please enter the passcode from your invitation.', codeBox)
    setError('')
    setBusy(true)
    try {
      await login(guest.guestId, code)
    } catch (err) {
      setBusy(false)
      fail(err.message, codeBox)
    }
  }

  function startOver() {
    setGuest(null)
    setCode('')
    setError('')
  }

  return (
    <div className="find-invitation">
      {!guest ? (
        <form onSubmit={findName} noValidate autoComplete="off" data-1p-ignore data-lpignore="true" data-bwignore data-form-type="other">
          <label htmlFor="guest-name">Enter your name to find your invitation</label>
          <div className="field-row">
            <input
              ref={nameBox}
              id="guest-name"
              type="text"
              {...NO_AUTOFILL}
              placeholder="First and last name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('') // the message goes away once they start fixing it
              }}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
            />
            <SubmitArrow busy={busy} label="Find my invitation" />
          </div>
          {error && <FormMessage id="login-error">{error}</FormMessage>}
        </form>
      ) : (
        <form onSubmit={openInvitation} noValidate autoComplete="off" data-1p-ignore data-lpignore="true" data-bwignore data-form-type="other">
          <label htmlFor="invite-code">
            Hi, {guest.name.split(' ')[0]}! Enter the passcode from your invitation.
          </label>
          <div className="field-row">
            <input
              ref={codeBox}
              id="invite-code"
              type="text"
              {...NO_AUTOFILL}
              autoCapitalize="characters"
              spellCheck="false"
              placeholder="Passcode"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError('')
              }}
              required
              autoFocus
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
            />
            <SubmitArrow busy={busy} label="Open my invitation" />
          </div>
          {error && <FormMessage id="login-error">{error}</FormMessage>}
          <button type="button" className="link-button" onClick={startOver}>
            Not {guest.name.split(' ')[0]}? Search again
          </button>
        </form>
      )}

      {/* A built-in browser popup, shown when several guests share a name. */}
      <dialog ref={dialog} className="choose-dialog" aria-labelledby="choose-title">
        <button type="button" className="dialog-close" aria-label="Close" onClick={() => dialog.current.close()}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <h2 id="choose-title">Which one is you?</h2>
        <p>A few guests share this name. Pick the invitation that's yours.</p>
        <div className="choose-list">
          {matches.map((m, i) => (
            // The first choice gets the keyboard when the popup opens.
            <button key={m.guestId} type="button" className="choose-option" autoFocus={i === 0} onClick={() => choose(m)}>
              <span className="choose-name">{m.name}</span>
              <span className="choose-party">{m.partyName}</span>
            </button>
          ))}
        </div>
      </dialog>
    </div>
  )
}

// The small arrow button inside the box (pressing Enter does the same).
// While it's working, the arrow becomes a little spinning ring.
function SubmitArrow({ busy, label }) {
  return (
    <button type="submit" className="input-arrow" aria-label={busy ? 'Working…' : label} disabled={busy}>
      {busy ? (
        <span className="input-spinner" aria-hidden="true" />
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h13M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  )
}
