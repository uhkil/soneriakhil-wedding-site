// Talks to the RSVP back end (the Google Sheet's script).
//
// Practice mode: add ?practice to the address (e.g. localhost:5173/?practice)
// to use fake guests instead of the real Sheet. Handy for testing.
import { RSVP_API_URL } from '../config.js'
import { handlePractice } from './practiceApi.js'

export const isPractice = new URLSearchParams(window.location.search).has('practice')

// Sends one request and returns the reply, or throws an Error whose
// message is safe to show to guests.
async function call(action, data) {
  const request = { action, ...data }
  if (isPractice) return handlePractice(request)

  let response
  try {
    response = await fetch(RSVP_API_URL, {
      method: 'POST',
      // "text/plain" keeps this a "simple" request that Google's servers accept.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(request),
    })
  } catch {
    const error = new Error("We couldn't reach the RSVP service. Check your connection and try again.")
    error.isNetwork = true
    throw error
  }

  const reply = await response.json().catch(() => null)
  if (!reply) throw new Error('Something went wrong. Please try again.')
  if (!reply.ok) throw new Error(reply.error)
  return reply
}

// Returns a list of { guestId, name, partyName } matching a typed name.
export const searchGuests = (name) => call('search', { name }).then((r) => r.matches)

// Checks the wedding passcode. Returns { token, party }.
export const verifyCode = (guestId, code) => call('verify', { guestId, code })

// Reloads a party's details with a saved login token.
export const loadParty = (partyId, token) => call('party', { partyId, token }).then((r) => r.party)

// Saves a party's RSVP. Returns the updated party.
export const submitRsvp = (rsvp) => call('submit', rsvp).then((r) => r.party)
