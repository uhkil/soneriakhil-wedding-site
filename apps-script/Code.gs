/**
 * @OnlyCurrentDoc
 * (This line limits the script's permissions to this one Sheet.)
 *
 * Soneri & Akhil — RSVP back end (Google Apps Script)
 *
 * This code lives inside the wedding Google Sheet (Extensions → Apps Script).
 * The website sends it requests; it reads the guest list from the Sheet and
 * writes RSVPs back. Guests log in with their name plus the wedding passcode
 * (one passcode for everyone, set in the Settings tab). Saved email, phone,
 * and notes never leave the Sheet.
 *
 * Tabs it uses (setup() creates them):
 *   You fill in:      Settings (the passcode), Parties, Guests, Events
 *   It fills in:      Summary (headcounts), RSVPs (one row per guest),
 *                     Party Responses (one row per party), Change Log (every submission)
 *
 * The website can ask for four things ("actions"):
 *   search   — find guests by first + last name
 *   verify   — check the wedding passcode; returns the guest's party + a login token
 *   party    — reload a party's details using a saved login token
 *   submit   — save the party's RSVP
 *
 * After changing this code, you must publish a new version:
 * Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.
 */

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const TAB = {
  settings: 'Settings',
  parties: 'Parties',
  guests: 'Guests',
  events: 'Events',
  rsvps: 'RSVPs',
  responses: 'Party Responses',
  log: 'Change Log',
  summary: 'Summary',
}

const HEADERS = {
  Settings: ['setting', 'value'],
  Parties: ['party_id', 'party_name', 'invited_events', 'notes'],
  Guests: ['guest_id', 'party_id', 'first_name', 'last_name', 'invited_events', 'plus_one'],
  Events: ['event_id', 'name', 'date', 'time_of_day', 'time', 'location', 'address', 'attire', 'description'],
  // One extra column per event (yes / no) is added automatically after these.
  RSVPs: ['updated_at', 'party_id', 'party_name', 'guest_id', 'guest_name', 'plus_one', 'dietary'],
  'Party Responses': ['updated_at', 'party_id', 'party_name', 'email', 'phone', 'note'],
  'Change Log': ['submitted_at', 'party_id', 'party_name', 'who', 'answers', 'dietary'],
}

const MAX_MATCHES = 5 // more matches than this → ask the guest to be more specific
const MAX_CODE_TRIES = 8 // wrong passcodes allowed per guest, per hour

// ---------------------------------------------------------------------------
// Entry points (Google calls these when the website sends a request)
// ---------------------------------------------------------------------------

/** Opening the web app URL in a browser shows this — handy for checking it's live. */
function doGet() {
  return json({ ok: true, message: 'RSVP service is running.' })
}

/** Every request from the website arrives here. */
function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents)
    switch (req.action) {
      case 'search':
        return json({ ok: true, ...searchGuests(req.name) })
      case 'verify':
        return json({ ok: true, ...verifyCode(req.guestId, req.code) })
      case 'party':
        requireToken(req.partyId, req.token)
        return json({ ok: true, party: partyDetails(req.partyId) })
      case 'submit':
        requireToken(req.partyId, req.token)
        return json({ ok: true, party: saveRsvp(req) })
      default:
        throw new UserError('Unknown request.')
    }
  } catch (err) {
    // UserErrors are friendly messages meant for the guest; anything else is a bug.
    if (err instanceof UserError) return json({ ok: false, error: err.message })
    console.error(err)
    return json({ ok: false, error: 'Something went wrong on our end. Please try again.' })
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Finds guests whose first and last names start with what was typed. */
function searchGuests(name) {
  const words = normalize(name).split(' ').filter(Boolean)
  if (words.length < 2) throw new UserError('Please enter your first and last name.')
  const first = words[0]
  const last = words[words.length - 1]

  const parties = byId(readTab(TAB.parties), 'party_id')
  const matches = readTab(TAB.guests).filter((g) => {
    if (isYes(g.plus_one)) return false // unnamed plus-ones can't log in
    const firstNames = normalize(g.first_name).split(' ')
    const lastNames = normalize(g.last_name).split(' ')
    return firstNames.some((n) => n.startsWith(first)) && lastNames.some((n) => n.startsWith(last))
  })

  if (matches.length === 0) {
    throw new UserError("We couldn't find that name. Try the name on your invitation.")
  }
  if (matches.length > MAX_MATCHES) {
    throw new UserError('Please type your full first and last name.')
  }
  // Only enough to tell people apart — never codes or other details.
  return {
    matches: matches.map((g) => ({
      guestId: g.guest_id,
      name: `${g.first_name} ${g.last_name}`,
      partyName: parties[g.party_id] ? parties[g.party_id].party_name : '',
    })),
  }
}

/** Checks the wedding passcode, then opens the guest's party. */
function verifyCode(guestId, code) {
  const cache = CacheService.getScriptCache()
  const triesKey = 'tries:' + guestId
  const tries = Number(cache.get(triesKey) || 0)
  if (tries >= MAX_CODE_TRIES) {
    throw new UserError('Too many tries. Please wait an hour, or reach out to us.')
  }

  const passcode = sitePasscode()
  const guest = readTab(TAB.guests).find((g) => g.guest_id === String(guestId))
  const party = guest && byId(readTab(TAB.parties), 'party_id')[guest.party_id]
  if (!party || cleanCode(code) !== cleanCode(passcode)) {
    cache.put(triesKey, String(tries + 1), 60 * 60)
    throw new UserError("That passcode doesn't match. Check your invitation and try again.")
  }

  cache.remove(triesKey)
  return { token: makeToken(party.party_id), party: partyDetails(party.party_id) }
}

/** The wedding passcode from the Settings tab (row "site_passcode"). */
function sitePasscode() {
  const row = readTab(TAB.settings).find((r) => r.setting === 'site_passcode')
  if (!row || !row.value) throw new UserError("RSVPs aren't open yet. Please check back soon.")
  return row.value
}

/** Everything the website shows a logged-in party: people, events, past answers. */
function partyDetails(partyId) {
  const party = byId(readTab(TAB.parties), 'party_id')[partyId]
  if (!party) throw new UserError('We could not find your invitation.')

  const guests = readTab(TAB.guests)
    .filter((g) => g.party_id === partyId)
    .map((g) => ({
      guestId: g.guest_id,
      firstName: g.first_name,
      lastName: g.last_name,
      isPlusOne: isYes(g.plus_one),
      // A guest's own invited_events overrides the party's (e.g. kids skipping the reception).
      invitedEvents: idList(g.invited_events || party.invited_events),
    }))

  // Only events someone in this party is invited to, in the Events tab's order.
  const invited = new Set(guests.flatMap((g) => g.invitedEvents))
  const events = readTab(TAB.events)
    .filter((ev) => invited.has(ev.event_id))
    .map((ev) => ({
      id: ev.event_id,
      name: ev.name,
      date: ev.date,
      timeOfDay: ev.time_of_day,
      time: ev.time,
      location: ev.location,
      address: ev.address,
      attire: ev.attire,
      description: ev.description,
    }))

  // Previous answers, so guests can review and change them.
  const answers = {}
  readTab(TAB.rsvps)
    .filter((r) => r.party_id === partyId)
    .forEach((r) => {
      const attending = {}
      events.forEach((ev) => {
        if (r[ev.id]) attending[ev.id] = r[ev.id]
      })
      answers[r.guest_id] = { name: r.guest_name, dietary: r.dietary, attending }
    })
  const response = readTab(TAB.responses).find((r) => r.party_id === partyId) || {}

  return {
    partyId,
    partyName: party.party_name,
    guests,
    events,
    answers,
    // Saved contact info stays private: the website only learns whether it's on file.
    onFile: { email: Boolean(response.email), phone: Boolean(response.phone), note: Boolean(response.note) },
    hasResponded: Boolean(response.updated_at),
  }
}

/**
 * Saves a party's RSVP: one row per guest in RSVPs, one row in Party Responses,
 * a record of the submission in Change Log, then refreshes the Summary.
 */
function saveRsvp(req) {
  const details = partyDetails(req.partyId)
  const guestsById = byId(details.guests, 'guestId')
  const eventsById = byId(details.events, 'id')
  const allEventIds = readTab(TAB.events).map((ev) => ev.event_id)
  const now = new Date()

  // Check everything first, so a mistake never leaves a half-saved RSVP.
  const guestRows = []
  ;(req.guests || []).forEach((g) => {
    const guest = guestsById[g.guestId]
    if (!guest) return // ignore anyone not in this party
    // Record yes/no only for events this guest is invited to.
    const attending = {}
    guest.invitedEvents.forEach((id) => {
      const answer = g.attending && g.attending[id]
      attending[id] = answer === 'yes' || answer === 'no' ? answer : ''
    })
    let name = `${guest.firstName} ${guest.lastName}`.trim()
    if (guest.isPlusOne) {
      name = limit(g.name, 100)
      if (!name && Object.values(attending).includes('yes')) {
        throw new UserError("Please add your guest's name.")
      }
    }
    guestRows.push({
      updated_at: now,
      party_id: details.partyId,
      party_name: details.partyName,
      guest_id: guest.guestId,
      guest_name: name,
      plus_one: guest.isPlusOne ? 'yes' : '',
      dietary: limit(g.dietary, 500),
      ...attending,
      // For the Change Log: "Sangeet: yes · Reception: no"
      _summary: guest.invitedEvents
        .map((id) => `${eventsById[id] ? eventsById[id].name : id}: ${attending[id] || '—'}`)
        .join(' · '),
    })
  })

  // A blank box keeps what's already saved (the website never sees saved values).
  const saved = readTab(TAB.responses).find((r) => r.party_id === details.partyId) || {}
  const contact = req.contact || {}
  const email = limit(contact.email, 200) || saved.email || ''
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new UserError('Please check the email address.')
  }
  const contactRow = {
    updated_at: now,
    party_id: details.partyId,
    party_name: details.partyName,
    email,
    phone: limit(contact.phone, 40) || saved.phone || '',
    note: limit(contact.note, 1000) || saved.note || '',
  }

  // Only one save at a time, so two guests saving at once can't collide.
  const lock = LockService.getScriptLock()
  lock.waitLock(20000)
  try {
    const rsvps = getTab(TAB.rsvps)
    const rsvpHeader = ensureColumns(rsvps, HEADERS.RSVPs.concat(allEventIds))
    guestRows.forEach((row) => upsertRow(rsvps, rsvpHeader, 'guest_id', row))

    const responses = getTab(TAB.responses)
    upsertRow(responses, ensureColumns(responses, HEADERS['Party Responses']), 'party_id', contactRow)

    const log = getTab(TAB.log)
    const logHeader = ensureColumns(log, HEADERS['Change Log'])
    const logRow = (who, answers, dietary) =>
      appendObject(log, logHeader, {
        submitted_at: now,
        party_id: details.partyId,
        party_name: details.partyName,
        who,
        answers,
        dietary,
      })
    guestRows.forEach((r) => logRow(r.guest_name || '(unnamed plus-one)', r._summary, r.dietary))
    logRow('(contact info)', `email: ${email || '—'} · phone: ${contactRow.phone || '—'} · note: ${contactRow.note || '—'}`, '')
  } finally {
    lock.releaseLock()
  }

  refreshSummary()
  return partyDetails(req.partyId)
}

// ---------------------------------------------------------------------------
// Login tokens
// ---------------------------------------------------------------------------
// After the right passcode, the website gets a token: a signature of the
// party's id + the passcode, made with a secret only this script knows. The
// website saves it so guests stay logged in. Changing the passcode logs
// everyone out.

function makeToken(partyId) {
  const sig = Utilities.computeHmacSha256Signature(`${partyId}|${cleanCode(sitePasscode())}`, secret())
  return Utilities.base64EncodeWebSafe(sig)
}

function requireToken(partyId, token) {
  const party = byId(readTab(TAB.parties), 'party_id')[partyId]
  if (!party || !token || token !== makeToken(partyId)) {
    throw new UserError('Please find your invitation again.')
  }
}

function secret() {
  const props = PropertiesService.getScriptProperties()
  let value = props.getProperty('TOKEN_SECRET')
  if (!value) {
    value = Utilities.getUuid() + Utilities.getUuid()
    props.setProperty('TOKEN_SECRET', value)
  }
  return value
}

// ---------------------------------------------------------------------------
// Sheet helpers
// ---------------------------------------------------------------------------

function getTab(name) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(name)
  if (!sheet) throw new Error(`Missing tab "${name}". Run setup().`)
  return sheet
}

/** Reads a tab into a list of objects, using the header row as keys. Skips blank rows. */
function readTab(name) {
  const [header, ...rows] = getTab(name).getDataRange().getDisplayValues()
  return rows
    .filter((r) => r.some((cell) => cell.trim() !== ''))
    .map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] || '').trim()])))
}

/** Makes sure the header row has these columns (adding any missing ones); returns the header. */
function ensureColumns(sheet, columns) {
  const width = Math.max(sheet.getLastColumn(), 1)
  const header = sheet.getRange(1, 1, 1, width).getValues()[0].map(String)
  while (header.length && !header[header.length - 1]) header.pop() // drop trailing blanks
  columns.forEach((c) => {
    if (!header.includes(c)) {
      header.push(c)
      sheet.getRange(1, header.length).setValue(c).setFontWeight('bold')
    }
  })
  return header
}

/** Updates the row whose keyColumn matches, or adds a new row. */
function upsertRow(sheet, header, keyColumn, data) {
  const keyIndex = header.indexOf(keyColumn)
  const values = header.map((h) => (h in data ? data[h] : ''))
  const keys = sheet.getLastRow() > 1
    ? sheet.getRange(2, keyIndex + 1, sheet.getLastRow() - 1, 1).getDisplayValues().map((r) => r[0])
    : []
  const found = keys.indexOf(String(data[keyColumn]))
  if (found === -1) {
    sheet.appendRow(values)
  } else {
    sheet.getRange(found + 2, 1, 1, values.length).setValues([values])
  }
}

/** Adds a new row at the bottom, matching values to the header's columns. */
function appendObject(sheet, header, data) {
  sheet.appendRow(header.map((h) => (h in data ? data[h] : '')))
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

class UserError extends Error {}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)
}

/** Lowercase, no accents or punctuation: "Zoë O'Brien" → "zoe obrien". */
function normalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s-]/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Passcodes ignore case, spaces, and dashes: "sun-flower" = "SUNFLOWER". */
function cleanCode(code) {
  return String(code || '').toUpperCase().replace(/[\s-]/g, '')
}

/** "ceremony, sangeet" → ['ceremony', 'sangeet'] */
function idList(text) {
  return String(text || '').split(',').map((s) => s.trim()).filter(Boolean)
}

/** True for "yes", "y", "true", "x" (how you might mark a checkbox-style column). */
function isYes(value) {
  return ['yes', 'y', 'true', 'x'].includes(String(value || '').trim().toLowerCase())
}

function byId(list, key) {
  return Object.fromEntries(list.map((item) => [item[key], item]))
}

function limit(text, max) {
  return String(text || '').trim().slice(0, max)
}

// ---------------------------------------------------------------------------
// Summary tab and the "Wedding RSVP" menu
// ---------------------------------------------------------------------------

/**
 * Rebuilds the Summary tab: headcount per event and who hasn't responded.
 * Runs after every RSVP; you can also run it from the Wedding RSVP menu
 * after editing the guest list.
 */
function refreshSummary() {
  const ss = SpreadsheetApp.getActive()
  const sheet = ss.getSheetByName(TAB.summary) || ss.insertSheet(TAB.summary, 0)
  const parties = readTab(TAB.parties).filter((p) => p.party_id)
  const partyById = byId(parties, 'party_id')
  const guests = readTab(TAB.guests).filter((g) => partyById[g.party_id])
  const answers = byId(readTab(TAB.rsvps), 'guest_id')
  const responded = new Set(readTab(TAB.responses).map((r) => r.party_id))

  const rows = [
    ['Last updated', new Date(), '', '', ''],
    ['', '', '', '', ''],
    ['Event', 'Invited', 'Yes', 'No', 'Waiting'],
  ]
  readTab(TAB.events).forEach((ev) => {
    const invited = guests.filter((g) =>
      idList(g.invited_events || partyById[g.party_id].invited_events).includes(ev.event_id)
    )
    const count = (answer) => invited.filter((g) => (answers[g.guest_id] || {})[ev.event_id] === answer).length
    const yes = count('yes')
    const no = count('no')
    rows.push([ev.name, invited.length, yes, no, invited.length - yes - no])
  })
  const waiting = parties.filter((p) => !responded.has(p.party_id))
  rows.push(['', '', '', '', ''])
  rows.push([`Invitations: ${parties.length} · responded: ${parties.length - waiting.length} · waiting: ${waiting.length}`, '', '', '', ''])
  rows.push(['Still waiting on:', '', '', '', ''])
  waiting.forEach((p) => rows.push([p.party_name, '', '', '', '']))

  sheet.clearContents()
  sheet.getRange(1, 1, rows.length, 5).setValues(rows)
  sheet.getRange(3, 1, 1, 5).setFontWeight('bold')
}

/** Adds a "Wedding RSVP" menu to the Sheet (Google runs this when the Sheet opens). */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Wedding RSVP')
    .addItem('Refresh summary', 'refreshSummary')
    .addToUi()
}

// ---------------------------------------------------------------------------
// One-time setup and testing (run these from the Apps Script editor)
// ---------------------------------------------------------------------------

/**
 * Creates any missing tabs with their headers and some SAMPLE rows to test with.
 * Safe to run again: it never touches a tab that already exists.
 */
function setup() {
  const ss = SpreadsheetApp.getActive()
  const samples = {
    Events: [
      ['ceremony', 'Intimate Ceremony', 'April 9', 'Morning', 'TBD', 'TBD', 'TBD', 'TBD', 'Placeholder description.'],
      ['sangeet', 'Welcome Night / Sangeet', 'April 9', 'Evening', 'TBD', 'TBD', 'TBD', 'TBD', 'Placeholder description.'],
      ['indian-wedding', 'Indian Wedding', 'April 10', 'Morning', 'TBD', 'TBD', 'TBD', 'TBD', 'Placeholder description.'],
      ['reception', 'Cocktail Hour + Reception', 'April 10', 'Evening', 'TBD', 'TBD', 'TBD', 'TBD', 'Placeholder description.'],
    ],
    // CHANGE the passcode before printing invitations.
    Settings: [['site_passcode', 'CELEBRATE']],
    // SAMPLE parties — replace with your real guest list.
    // Two different "Priya Shah"s let you test the duplicate-name popup.
    Parties: [
      ['P001', 'The Shah Family', 'ceremony, sangeet, indian-wedding, reception', 'sample'],
      ['P002', 'Priya Shah', 'sangeet, reception', 'sample'],
      ['P003', 'The Lee Family', 'sangeet, indian-wedding, reception', 'sample'],
    ],
    Guests: [
      ['G001', 'P001', 'Priya', 'Shah', '', ''],
      ['G002', 'P001', 'Rohan', 'Shah', '', ''],
      ['G003', 'P002', 'Priya', 'Shah', '', ''],
      ['G004', 'P003', 'Jordan', 'Lee', '', ''],
      ['G005', 'P003', 'Sam', 'Lee', '', ''],
      ['G006', 'P003', 'Max', 'Lee', 'sangeet, indian-wedding', ''],
      ['G007', 'P002', '', '', '', 'yes'], // Priya's unnamed plus-one
    ],
  }

  Object.keys(HEADERS).forEach((name) => {
    if (ss.getSheetByName(name)) return
    const sheet = ss.insertSheet(name)
    // Your tabs are plain text, so Sheets won't turn "April 9" into a date
    // or drop the leading zero from a passcode like "0412".
    if (samples[name]) sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS[name].length).setNumberFormat('@')
    sheet.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]).setFontWeight('bold')
    sheet.setFrozenRows(1)
    const rows = samples[name]
    if (rows) sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows)
  })

  // Remove the blank starter tab Google creates, if it's still empty.
  const starter = ss.getSheetByName('Sheet1')
  if (starter && starter.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(starter)

  refreshSummary() // creates the Summary tab (first in the list)
  secret() // creates the private signing key if it doesn't exist yet
  console.log('Setup done. Tabs: ' + ss.getSheets().map((s) => s.getName()).join(', '))
}

/** Tries a search and a passcode check; results appear in the log. */
function tryItOut() {
  const found = searchGuests('priya shah')
  console.log('Search "priya shah" →', JSON.stringify(found.matches))
  const result = verifyCode(found.matches[0].guestId, sitePasscode())
  console.log('Right passcode → party:', result.party.partyName,
    '| guests:', result.party.guests.map((g) => g.firstName || '(plus-one)').join(', '),
    '| events:', result.party.events.map((e) => e.name).join(', '))
  try {
    verifyCode(found.matches[0].guestId, 'wrong')
  } catch (err) {
    console.log('Wrong passcode →', err.message)
  }
}
