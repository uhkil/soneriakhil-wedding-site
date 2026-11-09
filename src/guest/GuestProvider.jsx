// Keeps track of which invitation (party) is logged in, for the whole site.
//
// Any component can call useGuest() to get:
//   status    'checking' (looking up a saved login), 'guest' (not logged in), or 'in'
//   party     the logged-in party's details from the Sheet (or null)
//   guestId   which person on the invitation logged in (null for logins
//             saved before this was remembered)
//   token     proof of login, sent along when saving an RSVP
//   login(guestId, code), logout(), setParty(updatedParty)
//
// After the right passcode, the login is saved in this browser for 7 days
// (LOGIN_DAYS), so guests stay logged in when they come back; after that they
// enter their passcode again. A copy of their invitation is saved with it, so
// a returning guest sees the site straight away while the Sheet is checked
// quietly in the background (any changes appear a moment later).
import { createContext, useContext, useEffect, useState } from 'react'
import { isPractice, loadParty, verifyCode, wakeService } from '../api/rsvpApi.js'
import { withEventDetails } from '../data/events.js'

const GuestContext = createContext(null)

// Practice logins are kept separately so they never mix with real ones.
const STORAGE_KEY = isPractice ? 'wedding-invitation-practice' : 'wedding-invitation'

// How long a login lasts before the guest has to enter their passcode again.
const LOGIN_DAYS = 7
const LOGIN_MS = LOGIN_DAYS * 24 * 60 * 60 * 1000

// localStorage can be unavailable (e.g. private browsing), so every use is wrapped.
function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}
function writeSaved(value) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Not saved; the guest will just need to log in again next visit.
  }
}

// The saved login, or null if there isn't one or it's more than 7 days old
// (an old one is forgotten). Logins saved before the 7-day limit existed
// start their 7 days now, so no one is logged out the moment this goes live.
function readLogin() {
  const saved = readSaved()
  if (!saved?.token) return null
  if (!saved.loggedInAt) {
    saved.loggedInAt = Date.now()
    writeSaved(saved)
  }
  if (Date.now() - saved.loggedInAt > LOGIN_MS) {
    writeSaved(null)
    return null
  }
  return saved
}

// A saved copy of the invitation, with the latest event details from
// events.js laid over it (in case the site has changed since it was saved).
function fromSaved(party) {
  return { ...party, events: party.events?.map(withEventDetails) }
}

export function GuestProvider({ children }) {
  // Read once, on the first render: a recent saved invitation shows straight away.
  const [startup] = useState(readLogin)
  const [party, setPartyState] = useState(() => (startup?.party ? fromSaved(startup.party) : null))
  const [token, setToken] = useState(() => (startup?.party ? startup.token : null))
  const [guestId, setGuestId] = useState(() => (startup?.party ? (startup.guestId ?? null) : null))
  const [status, setStatus] = useState(() => (!startup ? 'guest' : startup.party ? 'in' : 'checking'))

  function forget() {
    writeSaved(null)
    setPartyState(null)
    setToken(null)
    setGuestId(null)
    setStatus('guest')
  }

  // Shows an updated invitation and saves the copy alongside the login.
  function setParty(p) {
    setPartyState(p)
    const saved = readSaved()
    if (saved?.token) writeSaved({ ...saved, party: p })
  }

  // On page load: if this browser has a saved login, check it with the Sheet
  // (in the background when the saved copy is already showing).
  useEffect(() => {
    if (!startup) {
      wakeService() // not logged in: get the RSVP service ready while they type
      return
    }
    // Ignores the reply if the guest logged out (or in again) while waiting.
    const stillSame = () => readSaved()?.token === startup.token
    loadParty(startup.partyId, startup.token)
      .then((p) => {
        if (!stillSame()) return
        setParty(p)
        setToken(startup.token)
        setGuestId(startup.guestId ?? null)
        setStatus('in')
      })
      .catch((error) => {
        // A rejected login (e.g. the passcode was changed) is forgotten.
        // A network hiccup keeps it (and any saved copy stays on screen),
        // so the next visit tries again.
        if (!stillSame()) return
        if (!error.isNetwork) forget()
        else if (!startup.party) setStatus('guest')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // A tab left open past the 7 days logs out when the guest comes back to it.
  useEffect(() => {
    function check() {
      if (document.visibilityState === 'visible' && status === 'in' && !readLogin()) forget()
    }
    document.addEventListener('visibilitychange', check)
    return () => document.removeEventListener('visibilitychange', check)
  }, [status])

  async function login(guestId, code) {
    const result = await verifyCode(guestId, code) // throws if the passcode is wrong
    writeSaved({ partyId: result.party.partyId, token: result.token, guestId, loggedInAt: Date.now(), party: result.party })
    setPartyState(result.party)
    setToken(result.token)
    setGuestId(guestId)
    setStatus('in')
  }

  function logout() {
    forget()
    window.scrollTo(0, 0)
  }

  return (
    <GuestContext.Provider value={{ status, party, token, guestId, login, logout, setParty }}>
      {children}
    </GuestContext.Provider>
  )
}

export function useGuest() {
  return useContext(GuestContext)
}
