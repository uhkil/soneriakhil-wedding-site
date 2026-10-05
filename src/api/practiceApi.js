// A pretend back end with fake guests, used when the address has ?practice.
// It behaves like the real Google Sheet script, without touching the Sheet.
//
// Try: "Jordan Lee" + PEONY, or "Priya Shah" (two matches) + MANGO / LOTUS.

const events = [
  { id: 'ceremony', name: 'Intimate Ceremony', date: 'April 9', timeOfDay: 'Morning', time: '10:00 AM', location: 'Practice Venue', address: '123 Example St, Dallas, TX', attire: 'Formal', description: 'Practice-mode details.' },
  { id: 'sangeet', name: 'Welcome Night / Sangeet', date: 'April 9', timeOfDay: 'Evening', time: '7:00 PM', location: 'Practice Venue', address: '123 Example St, Dallas, TX', attire: 'Festive', description: 'Practice-mode details.' },
  { id: 'indian-wedding', name: 'Indian Wedding', date: 'April 10', timeOfDay: 'Morning', time: '9:00 AM', location: 'Practice Venue', address: '123 Example St, Dallas, TX', attire: 'Indian formal', description: 'Practice-mode details.' },
  { id: 'reception', name: 'Cocktail Hour + Reception', date: 'April 10', timeOfDay: 'Evening', time: '6:00 PM', location: 'Practice Venue', address: '123 Example St, Dallas, TX', attire: 'Black tie optional', description: 'Practice-mode details.' },
]

const parties = {
  P001: { name: 'The Shah Family', code: 'MANGO', events: ['ceremony', 'sangeet', 'indian-wedding', 'reception'] },
  P002: { name: 'Priya Shah', code: 'LOTUS', events: ['sangeet', 'reception'] },
  P003: { name: 'The Lee Family', code: 'PEONY', events: ['sangeet', 'indian-wedding', 'reception'] },
}

const guests = [
  { guestId: 'G001', partyId: 'P001', firstName: 'Priya', lastName: 'Shah' },
  { guestId: 'G002', partyId: 'P001', firstName: 'Rohan', lastName: 'Shah' },
  { guestId: 'G003', partyId: 'P002', firstName: 'Priya', lastName: 'Shah' },
  { guestId: 'G007', partyId: 'P002', firstName: '', lastName: '', isPlusOne: true },
  { guestId: 'G004', partyId: 'P003', firstName: 'Jordan', lastName: 'Lee' },
  { guestId: 'G005', partyId: 'P003', firstName: 'Sam', lastName: 'Lee' },
  { guestId: 'G006', partyId: 'P003', firstName: 'Max', lastName: 'Lee', events: ['sangeet', 'indian-wedding'] },
]

// Saved answers live only in memory: refreshing the page clears them.
const saved = {}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const clean = (text) => String(text || '').toLowerCase().normalize('NFD').replace(/[^a-z\s]/g, '').trim()
const cleanCode = (code) => String(code || '').toUpperCase().replace(/[\s-]/g, '')

function partyDetails(partyId) {
  const party = parties[partyId]
  const members = guests
    .filter((g) => g.partyId === partyId)
    .map((g) => ({ guestId: g.guestId, firstName: g.firstName, lastName: g.lastName, isPlusOne: Boolean(g.isPlusOne), invitedEvents: g.events || party.events }))
  const invited = new Set(members.flatMap((g) => g.invitedEvents))
  const answers = saved[partyId] || { answers: {}, contact: { email: '', phone: '', note: '' } }
  return {
    partyId,
    partyName: party.name,
    guests: members,
    events: events.filter((e) => invited.has(e.id)),
    answers: answers.answers,
    contact: answers.contact,
    hasResponded: Boolean(saved[partyId]),
  }
}

export async function handlePractice(req) {
  await wait(400) // feel like a real network request
  const fail = (message) => {
    throw new Error(message)
  }

  if (req.action === 'search') {
    const words = clean(req.name).split(/\s+/).filter(Boolean)
    if (words.length < 2) fail('Please enter your first and last name.')
    const [first, last] = [words[0], words[words.length - 1]]
    const matches = guests.filter(
      (g) => !g.isPlusOne && clean(g.firstName).startsWith(first) && clean(g.lastName).startsWith(last)
    )
    if (!matches.length) fail("We couldn't find that name. Try the name on your invitation.")
    return { ok: true, matches: matches.map((g) => ({ guestId: g.guestId, name: `${g.firstName} ${g.lastName}`, partyName: parties[g.partyId].name })) }
  }

  if (req.action === 'verify') {
    const guest = guests.find((g) => g.guestId === req.guestId)
    if (!guest || cleanCode(req.code) !== parties[guest.partyId].code) {
      fail("That code doesn't match. Check your invitation and try again.")
    }
    return { ok: true, token: 'practice-' + guest.partyId, party: partyDetails(guest.partyId) }
  }

  if (req.token !== 'practice-' + req.partyId || !parties[req.partyId]) fail('Please find your invitation again.')

  if (req.action === 'party') return { ok: true, party: partyDetails(req.partyId) }

  if (req.action === 'submit') {
    const answers = {}
    req.guests.forEach((g) => (answers[g.guestId] = { name: g.name || '', dietary: g.dietary || '', attending: g.attending || {} }))
    saved[req.partyId] = { answers, contact: req.contact || {} }
    return { ok: true, party: partyDetails(req.partyId) }
  }

  fail('Unknown request.')
}
