// A pretend back end with fake guests, used when the address has ?practice.
// It behaves like the real Google Sheet script, without touching the Sheet.
//
// Try: "Jordan Lee" (4 people, all 4 events), "Priya Shah" (two matches: her
// family of 4 at all 4 events, or just her with a plus-one), or "Sam Rivera"
// (invited only to April 10's events), or "Bartholomew Venkataraman-Christensen"
// (a family with long names), with the passcode CELEBRATE.
import { maskEmail, maskPhone } from '../guest/contact.js'

// "1600 E Randol Mill Rd" → "16•• • •••••• •••• Rd"
const maskMiddle = (text = '') => {
  const k = text.replace(/\s/g, '').length <= 5 ? 1 : 2
  return [...text].map((ch, i) => (/\s/.test(ch) || i < k || i >= text.length - k ? ch : '•')).join('')
}

// "Dallas, TX", or "outside the US" for "I don't live in the United States"
const addressPlace = (a) =>
  a.country === 'US' ? [a.city, a.state].filter(Boolean).join(', ') : 'outside the US'

const events = [
  { id: 'ceremony', name: 'Intimate Ceremony', date: 'April 9', timeOfDay: 'Morning', time: '10:00 AM', location: 'Practice Venue', address: '123 Example St, Dallas, TX', attire: 'Formal', description: 'Practice-mode details.' },
  { id: 'sangeet', name: 'Welcome Night / Sangeet', date: 'April 9', timeOfDay: 'Evening', time: '7:00 PM', location: 'Practice Venue', address: '123 Example St, Dallas, TX', attire: 'Festive', description: 'Practice-mode details.' },
  { id: 'indian-wedding', name: 'Indian Wedding', date: 'April 10', timeOfDay: 'Morning', time: '9:00 AM', location: 'Practice Venue', address: '123 Example St, Dallas, TX', attire: 'Indian formal', description: 'Practice-mode details.' },
  { id: 'reception', name: 'Cocktail Hour + Reception', date: 'April 10', timeOfDay: 'Evening', time: '6:00 PM', location: 'Practice Venue', address: '123 Example St, Dallas, TX', attire: 'Black tie optional', description: 'Practice-mode details.' },
]

const PASSCODE = 'CELEBRATE'

const parties = {
  P001: { name: 'The Shah Family', events: ['ceremony', 'sangeet', 'indian-wedding', 'reception'] },
  P002: { name: 'Priya Shah', events: ['sangeet', 'reception'] },
  P003: { name: 'The Lee Family', events: ['ceremony', 'sangeet', 'indian-wedding', 'reception'] },
  P004: { name: 'Sam Rivera', events: ['indian-wedding', 'reception'] }, // April 10 only
  P005: { name: 'The Venkataraman-Christensen Family', events: ['ceremony', 'sangeet', 'indian-wedding', 'reception'] }, // long names
}

const guests = [
  { guestId: 'G001', partyId: 'P001', firstName: 'Priya', lastName: 'Shah' },
  { guestId: 'G002', partyId: 'P001', firstName: 'Rohan', lastName: 'Shah' },
  { guestId: 'G009', partyId: 'P001', firstName: 'Anika', lastName: 'Shah' },
  { guestId: 'G010', partyId: 'P001', firstName: 'Dev', lastName: 'Shah' },
  { guestId: 'G003', partyId: 'P002', firstName: 'Priya', lastName: 'Shah' },
  { guestId: 'G007', partyId: 'P002', firstName: '', lastName: '', isPlusOne: true },
  { guestId: 'G004', partyId: 'P003', firstName: 'Jordan', lastName: 'Lee' },
  { guestId: 'G005', partyId: 'P003', firstName: 'Sam', lastName: 'Lee' },
  { guestId: 'G006', partyId: 'P003', firstName: 'Max', lastName: 'Lee' },
  { guestId: 'G011', partyId: 'P003', firstName: 'Maya', lastName: 'Lee' },
  { guestId: 'G012', partyId: 'P005', firstName: 'Alexandria', lastName: 'Venkataraman-Christensen' },
  { guestId: 'G013', partyId: 'P005', firstName: 'Bartholomew', lastName: 'Venkataraman-Christensen' },
  { guestId: 'G014', partyId: 'P005', firstName: 'Maximiliano', lastName: 'Venkataraman-Christensen' },
  { guestId: 'G015', partyId: 'P005', firstName: 'Jo', lastName: 'Venkataraman-Christensen' },
  { guestId: 'G008', partyId: 'P004', firstName: 'Sam', lastName: 'Rivera' },
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
  const answers = saved[partyId] || { answers: {}, contact: {} }
  // Like the real back end: emails and phones partly hidden, and only whether a note is saved.
  const onFile = Object.fromEntries(
    Object.entries(answers.contact).map(([id, c]) => [
      id,
      { email: c.email ? maskEmail(c.email) : '', phone: c.phone ? maskPhone(c.phone) : '', note: Boolean(c.note) },
    ])
  )
  return {
    partyId,
    partyName: party.name,
    guests: members,
    events: events.filter((e) => invited.has(e.id)),
    answers: answers.answers,
    onFile,
    hasResponded: Boolean(saved[partyId]),
    // Like the real back end: only the city a saved address is in.
    addressOnFile: answers.address ? addressPlace(answers.address) : '',
    // Each part partly hidden, like the real back end.
    addressMasked:
      answers.address?.country === 'US'
        ? {
            street: maskMiddle(answers.address.street),
            apt: maskMiddle(answers.address.apt),
            city: maskMiddle(answers.address.city),
            state: answers.address.state,
            zip: answers.address.zip.slice(0, 3) + '••',
          }
        : null,
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
      (g) => !g.isPlusOne && clean(g.firstName).split(/\s+/).includes(first) && clean(g.lastName).split(/\s+/).includes(last)
    )
    if (!matches.length) fail("We couldn't find that name. Try your full first and last name, as on your invitation.")
    return { ok: true, matches: matches.map((g) => ({ guestId: g.guestId, name: `${g.firstName} ${g.lastName}`, partyName: parties[g.partyId].name })) }
  }

  if (req.action === 'verify') {
    const guest = guests.find((g) => g.guestId === req.guestId)
    if (!guest || cleanCode(req.code) !== PASSCODE) {
      fail("That passcode doesn't match. Check your invitation and try again.")
    }
    return { ok: true, token: 'practice-' + guest.partyId, party: partyDetails(guest.partyId) }
  }

  if (req.token !== 'practice-' + req.partyId || !parties[req.partyId]) fail('Please find your invitation again.')

  if (req.action === 'party') return { ok: true, party: partyDetails(req.partyId) }

  if (req.action === 'submit') {
    const answers = {}
    const contact = {}
    const before = saved[req.partyId]?.contact || {}
    req.guests.forEach((g) => {
      answers[g.guestId] = { name: g.name || '', dietary: g.dietary || '', attending: g.attending || {} }
      // A blank box keeps what was saved before.
      const was = before[g.guestId] || {}
      contact[g.guestId] = { email: g.email || was.email, phone: g.phone || was.phone, note: g.note || was.note }
      // Like the Sheet: US numbers are saved without the +1.
      if (contact[g.guestId].phone) contact[g.guestId].phone = contact[g.guestId].phone.replace(/^\+1 /, '')
    })
    // A blank address keeps the saved one.
    // A blank box keeps its saved part; a blank address keeps the saved one.
    const savedAddress = saved[req.partyId]?.address
    let address = req.address || savedAddress || null
    if (req.address?.country === 'US' && savedAddress?.country === 'US') {
      address = Object.fromEntries(Object.entries(req.address).map(([k, v]) => [k, (typeof v === 'string' && v.trim()) || savedAddress[k]]))
    }
    saved[req.partyId] = { answers, contact, address }
    return { ok: true, party: partyDetails(req.partyId) }
  }

  fail('Unknown request.')
}
