// Keeps track of which invitation (party) is logged in, for the whole site.
//
// Any component can call useGuest() to get:
//   status    'checking' (looking up a saved login), 'guest' (not logged in), or 'in'
//   party     the logged-in party's details from the Sheet (or null)
//   token     proof of login, sent along when saving an RSVP
//   login(guestId, code), logout(), setParty(updatedParty)
//
// After a correct code, the login token is saved in this browser, so guests
// stay logged in when they come back, until they log out.
import { createContext, useContext, useEffect, useState } from 'react'
import { isPractice, loadParty, verifyCode } from '../api/rsvpApi.js'

const GuestContext = createContext(null)

// Practice logins are kept separately so they never mix with real ones.
const STORAGE_KEY = isPractice ? 'wedding-invitation-practice' : 'wedding-invitation'

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

export function GuestProvider({ children }) {
  const [party, setParty] = useState(null)
  const [token, setToken] = useState(null)
  const [status, setStatus] = useState(() => (readSaved() ? 'checking' : 'guest'))

  // On page load: if this browser has a saved login, reload that party.
  useEffect(() => {
    const saved = readSaved()
    if (!saved) return
    loadParty(saved.partyId, saved.token)
      .then((p) => {
        setParty(p)
        setToken(saved.token)
        setStatus('in')
      })
      .catch((error) => {
        // A rejected login (e.g. the code was changed) is forgotten.
        // A network hiccup keeps it, so the next visit tries again.
        if (!error.isNetwork) writeSaved(null)
        setStatus('guest')
      })
  }, [])

  async function login(guestId, code) {
    const result = await verifyCode(guestId, code) // throws if the code is wrong
    writeSaved({ partyId: result.party.partyId, token: result.token })
    setParty(result.party)
    setToken(result.token)
    setStatus('in')
  }

  function logout() {
    writeSaved(null)
    setParty(null)
    setToken(null)
    setStatus('guest')
    window.scrollTo(0, 0)
  }

  return (
    <GuestContext.Provider value={{ status, party, token, login, logout, setParty }}>
      {children}
    </GuestContext.Provider>
  )
}

export function useGuest() {
  return useContext(GuestContext)
}
