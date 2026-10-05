// "Find your invitation": the login form on the landing page.
//   Step 1: type your first and last name.
//   (If several guests share that name, a popup asks which one you are.)
//   Step 2: type the code printed on your invitation.
import { useRef, useState } from 'react'
import { searchGuests } from '../../api/rsvpApi.js'
import { useGuest } from '../../guest/GuestProvider.jsx'

export default function FindInvitation() {
  const { login } = useGuest()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [matches, setMatches] = useState([]) // guests sharing the typed name
  const [guest, setGuest] = useState(null) // the guest chosen for step 2
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const dialog = useRef(null)

  // Step 1: look up the name.
  async function findName(event) {
    event.preventDefault() // stop the browser from reloading the page
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
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function choose(match) {
    dialog.current.close()
    setGuest(match)
  }

  // Step 2: check the code. On success the whole site opens, so this form goes away.
  async function openInvitation(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(guest.guestId, code)
    } catch (err) {
      setError(err.message)
      setBusy(false)
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
        <form onSubmit={findName}>
          <label htmlFor="guest-name">Find your invitation</label>
          <div className="field-row">
            <input
              id="guest-name"
              type="text"
              autoComplete="name"
              placeholder="First and last name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button className="button" type="submit" disabled={busy}>
              {busy ? 'Searching…' : 'Continue'}
            </button>
          </div>
          {/* role="alert" makes screen readers announce the message. */}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      ) : (
        <form onSubmit={openInvitation}>
          <label htmlFor="invite-code">
            Hi, {guest.name.split(' ')[0]}! Enter the code printed on your invitation.
          </label>
          <div className="field-row">
            <input
              id="invite-code"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck="false"
              placeholder="e.g. KX7-M4P"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
            />
            <button className="button" type="submit" disabled={busy}>
              {busy ? 'Opening…' : 'Open invitation'}
            </button>
          </div>
          {/* role="alert" makes screen readers announce the message. */}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="button" className="link-button" onClick={startOver}>
            Not {guest.name.split(' ')[0]}? Search again
          </button>
        </form>
      )}

      {/* A built-in browser popup, shown when several guests share a name. */}
      <dialog ref={dialog} className="choose-dialog" aria-labelledby="choose-title">
        <h2 id="choose-title">Which one is you?</h2>
        <p>A few guests share this name. Pick the invitation that's yours.</p>
        <div className="choose-list">
          {matches.map((m) => (
            <button key={m.guestId} type="button" className="choose-option" onClick={() => choose(m)}>
              <span className="choose-name">{m.name}</span>
              <span className="choose-party">{m.partyName}</span>
            </button>
          ))}
        </div>
        <button type="button" className="link-button" onClick={() => dialog.current.close()}>
          Cancel
        </button>
      </dialog>
    </div>
  )
}
