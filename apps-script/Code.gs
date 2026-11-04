/**
 * @OnlyCurrentDoc
 * (This line limits the script's permissions to this one Sheet.)
 *
 * Soneri & Akhil — RSVP back end (Google Apps Script)
 *
 * This code lives inside the wedding Google Sheet (Extensions → Apps Script).
 * The website sends it requests; it reads the guest list from the Sheet and
 * writes RSVPs back. Guests log in with their name plus the wedding passcode
 * (one passcode for everyone, set in the Settings tab). Each person gives
 * their own email and phone (both required) and can leave a note. Saved
 * emails and phones are only ever sent back partly hidden (p•••h@gmail.com,
 * •••-•••-1234), and saved notes not at all.
 *
 * Tabs (setup() creates them; see apps-script/SETUP.md for the full guide):
 *   You fill in:  Settings (the passcode), Guests (one row per person), Events
 *   It fills in:  Summary (headcounts + copy-ready email and phone lists),
 *                 All Guests (everyone, with their answers), RSVPs (saved
 *                 answers), Party Responses (when each invitation last saved),
 *                 Change Log (every submission)
 *
 * The Guests tab: one row per person.
 *   first_name, last_name  their name, as they'd type it to log in
 *   household              blank = invited on their own. Everyone with the
 *                          same household name is one invitation; any of
 *                          them can RSVP for all of them.
 *   side, group            private notes for you (never sent to the website;
 *                          neither is any column you add yourself)
 *   one column per event   (named by its event_id from the Events tab) — a
 *                          checkbox: checked = invited to that event
 *   plus_one               checked = may bring a guest
 *   guest_id               filled in automatically; don't change it
 *
 * The website can ask for four things ("actions"):
 *   search   — find guests by first + last name
 *   verify   — check the wedding passcode; returns the guest's invitation + a login token
 *   party    — reload an invitation's details using a saved login token
 *   submit   — save the invitation's RSVP
 *
 * After changing this code, you must publish a new version:
 * Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.
 */

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const TAB = {
  settings: 'Settings',
  guests: 'Guests',
  events: 'Events',
  rsvps: 'RSVPs',
  responses: 'Party Responses',
  log: 'Change Log',
  summary: 'Summary',
  allGuests: 'All Guests',
}

// The Guests tab's columns: these, then one checkbox column per event (named
// by its event_id), then plus_one and guest_id.
const GUEST_COLUMNS_BEFORE = ['first_name', 'last_name', 'household', 'side', 'group']
const GUEST_COLUMNS_AFTER = ['plus_one', 'guest_id']

const HEADERS = {
  Settings: ['setting', 'value'],
  Events: ['event_id', 'name', 'date', 'time_of_day', 'time', 'location', 'address', 'attire', 'description'],
  // One extra column per event (yes / no) is added automatically after these.
  RSVPs: ['updated_at', 'party_id', 'party_name', 'guest_id', 'guest_name', 'plus_one', 'dietary', 'email', 'phone', 'note',
    // The invitation's mailing address: all in one cell, then its parts.
    'address', 'address_street', 'address_apt', 'address_city', 'address_state', 'address_zip', 'address_country'],
  'Party Responses': ['updated_at', 'party_id', 'party_name', 'email', 'phone', 'note', 'address'],
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
      case 'party': {
        const list = loadGuestList()
        requireToken(req.partyId, req.token, list)
        return json({ ok: true, party: partyDetails(req.partyId, list) })
      }
      case 'submit': {
        const list = loadGuestList()
        requireToken(req.partyId, req.token, list)
        return json({ ok: true, party: saveRsvp(req, list) })
      }
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
// The guest list
// ---------------------------------------------------------------------------

/**
 * Reads the Guests and Events tabs. Returns:
 *   events — the Events tab's rows, in order
 *   people — everyone who can be on an RSVP, including a "Your guest" spot
 *            right after anyone with plus_one checked. Each has: guestId,
 *            firstName, lastName, isPlusOne, invitedEvents (event ids),
 *            partyId, partyName, household, side, group, hostName (plus-ones)
 *
 * An invitation ("party") is a household: everyone with the same household
 * name (ignoring capitals and extra spaces). Someone with no household is
 * their own invitation, under their guest id.
 */
function loadGuestList(fresh) {
  // Remembered for a few minutes (see "Speed" below), so a guest's search,
  // passcode, and RSVP don't each re-read the whole Guests tab.
  if (!fresh) {
    const remembered = cacheGet('guestList')
    if (remembered) return remembered
  }
  ensureGuestIds()
  const events = readTab(TAB.events).filter((ev) => ev.event_id)
  const people = []
  readGuestRows().forEach((row) => {
    const fullName = `${row.first_name || ''} ${row.last_name || ''}`.trim()
    if (!row.guest_id || !fullName) return
    const household = row.household || ''
    const person = {
      guestId: row.guest_id,
      firstName: row.first_name || '',
      lastName: row.last_name || '',
      isPlusOne: false,
      invitedEvents: events.map((ev) => ev.event_id).filter((id) => isYes(row[id])),
      partyId: household ? 'H:' + household.toLowerCase().replace(/\s+/g, ' ') : row.guest_id,
      partyName: household || fullName,
      household,
      side: row.side || '',
      group: row.group || '',
    }
    people.push(person)
    if (isYes(row.plus_one)) {
      // Their guest: same invitation, same events, name typed in on the RSVP.
      people.push({ ...person, guestId: row.guest_id + '-guest', firstName: '', lastName: '', isPlusOne: true, hostName: fullName })
    }
  })
  const list = { events, people }
  cachePut('guestList', list)
  return list
}

/** The Guests tab's rows with a name in them, as objects (like readTab, but
 *  skipping the hundreds of empty checkbox rows below the last guest). */
function readGuestRows() {
  const sheet = getTab(TAB.guests)
  const header = guestHeader(sheet)
  const last = lastGuestRow(sheet, header)
  if (last < 2) return []
  return sheet
    .getRange(2, 1, last - 1, header.length)
    .getDisplayValues()
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] || '').trim()])))
}

function guestHeader(sheet) {
  return sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getDisplayValues()[0].map((h) => h.trim())
}

/** The last row of the Guests tab with a first or last name in it (1 if none). */
function lastGuestRow(sheet, header) {
  const cols = ['first_name', 'last_name'].map((h) => header.indexOf(h)).filter((i) => i >= 0)
  const last = sheet.getLastRow()
  if (last < 2 || !cols.length) return 1
  const from = Math.min(...cols)
  const names = sheet.getRange(2, from + 1, last - 1, Math.max(...cols) - from + 1).getDisplayValues()
  for (let i = names.length - 1; i >= 0; i--) if (names[i].some((v) => v.trim())) return i + 2
  return 1
}

/**
 * Gives every named row in the Guests tab a guest id (G001, G002, …) if it
 * doesn't have one yet, and a new one to any row that copied another row's
 * id. Runs on its own when you edit the Guests tab, and before every request.
 * Ids are never reused.
 */
function ensureGuestIds() {
  const sheet = getTab(TAB.guests)
  const header = guestHeader(sheet)
  const idCol = header.indexOf('guest_id')
  if (idCol === -1) {
    throw new Error('The Guests tab has no guest_id column. Use Wedding RSVP → Switch to the new guest list.')
  }
  const needsId = () => {
    const last = lastGuestRow(sheet, header)
    const rows = last < 2 ? [] : sheet.getRange(2, 1, last - 1, header.length).getDisplayValues()
    const seen = new Set()
    const ids = rows.map((r) => r[idCol].trim())
    const missing = []
    rows.forEach((r, i) => {
      const named = header.some((h, c) => (h === 'first_name' || h === 'last_name') && r[c].trim())
      if (!named) return
      if (!ids[i] || seen.has(ids[i])) missing.push(i)
      else seen.add(ids[i])
    })
    return { ids, missing }
  }
  if (!needsId().missing.length) return

  const lock = LockService.getScriptLock()
  lock.waitLock(20000)
  try {
    const { ids, missing } = needsId() // again, now that no one else is writing
    // An id is never used twice, even after its guest is deleted (or their
    // answers would carry over to someone new): new ids continue after the
    // highest one ever given out, in Guests, in RSVPs, or remembered here.
    const props = PropertiesService.getScriptProperties()
    const saved = getTab(TAB.rsvps).getLastRow() > 1 ? readTab(TAB.rsvps).map((r) => r.guest_id) : []
    let next = ids.concat(saved).reduce((max, id) => {
      const m = String(id).match(/^G(\d+)/)
      return m ? Math.max(max, Number(m[1])) : max
    }, Number(props.getProperty('LAST_GUEST_ID') || 0))
    missing.forEach((i) => {
      next += 1
      sheet.getRange(i + 2, idCol + 1).setValue('G' + String(next).padStart(3, '0'))
    })
    props.setProperty('LAST_GUEST_ID', String(next))
    forgetRemembered()
  } finally {
    lock.releaseLock()
  }
}

/**
 * Google runs this whenever someone edits the Sheet. Edits to Guests, Events,
 * or Settings show up on the website right away (the remembered copies are
 * forgotten), and new guests get their ids.
 */
function onEdit(e) {
  try {
    const name = e && e.range ? e.range.getSheet().getName() : ''
    if ([TAB.guests, TAB.events, TAB.settings].includes(name)) forgetRemembered()
    if (name === TAB.guests) ensureGuestIds()
  } catch (err) {
    console.error(err) // the ids are filled in on the next request instead
  }
}

// ---------------------------------------------------------------------------
// Speed: remembering the guest list for a few minutes
// ---------------------------------------------------------------------------
// Reading the Sheet is the slow part of every request. The guest list and
// passcode are remembered (in Google's cache, packed small) for a few
// minutes. Any edit to Guests, Events, or Settings forgets them right away
// (onEdit above), and so does Wedding RSVP → Refresh. Saved answers (RSVPs)
// are never remembered: they're always read fresh.

const REMEMBER_SECONDS = 5 * 60

function cacheGet(key) {
  try {
    const packed = CacheService.getScriptCache().get(key)
    if (!packed) return null
    const blob = Utilities.newBlob(Utilities.base64Decode(packed), 'application/x-gzip')
    return JSON.parse(Utilities.ungzip(blob).getDataAsString())
  } catch (err) {
    return null
  }
}

function cachePut(key, value) {
  try {
    const packed = Utilities.base64Encode(Utilities.gzip(Utilities.newBlob(JSON.stringify(value))).getBytes())
    if (packed.length < 90000) CacheService.getScriptCache().put(key, packed, REMEMBER_SECONDS) // (Google's limit is 100 KB)
  } catch (err) {
    // too big or the cache is unavailable: it just reads the Sheet each time
  }
}

function forgetRemembered() {
  CacheService.getScriptCache().removeAll(['guestList', 'passcode'])
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Finds guests by their full first and last name. Each typed name must match a
 * whole name on the guest list (ignoring case and accents), so the guest list
 * can't be pieced together by trying a few letters at a time. Middle names and
 * two-part names work: "Mary Smith" finds "Mary Ann Smith".
 */
function searchGuests(name) {
  const words = normalize(name).split(' ').filter(Boolean)
  if (words.length < 2) throw new UserError('Please enter your first and last name.')
  const first = words[0]
  const last = words[words.length - 1]

  const matches = loadGuestList().people.filter((g) => {
    if (g.isPlusOne) return false // plus-ones log in through the person who invited them
    const firstNames = normalize(g.firstName).split(' ')
    const lastNames = normalize(g.lastName).split(' ')
    return firstNames.includes(first) && lastNames.includes(last)
  })

  if (matches.length === 0) {
    throw new UserError("We couldn't find that name. Try your full first and last name, as on your invitation.")
  }
  if (matches.length > MAX_MATCHES) {
    throw new UserError('Please type your full first and last name.')
  }
  // Only enough to tell people apart: the name, and the household name (shown
  // only when two guests share a name). Never side, group, or other details.
  return {
    matches: matches.map((g) => ({
      guestId: g.guestId,
      name: `${g.firstName} ${g.lastName}`,
      partyName: g.household,
    })),
  }
}

/** Checks the wedding passcode, then opens the guest's invitation. */
function verifyCode(guestId, code) {
  const cache = CacheService.getScriptCache()
  const triesKey = 'tries:' + guestId
  const tries = Number(cache.get(triesKey) || 0)
  if (tries >= MAX_CODE_TRIES) {
    throw new UserError('Too many tries. Please wait an hour, or reach out to us.')
  }

  const passcode = sitePasscode()
  const list = loadGuestList()
  const guest = list.people.find((g) => g.guestId === String(guestId) && !g.isPlusOne)
  if (!guest || cleanCode(code) !== cleanCode(passcode)) {
    cache.put(triesKey, String(tries + 1), 60 * 60)
    throw new UserError("That passcode doesn't match. Check your invitation and try again.")
  }

  cache.remove(triesKey)
  return { token: makeToken(guest.partyId), party: partyDetails(guest.partyId, list) }
}

/** The wedding passcode from the Settings tab (row "site_passcode"). */
function sitePasscode() {
  const remembered = cacheGet('passcode')
  if (remembered) return remembered
  const row = readTab(TAB.settings).find((r) => r.setting === 'site_passcode')
  if (!row || !row.value) throw new UserError("RSVPs aren't open yet. Please check back soon.")
  cachePut('passcode', row.value)
  return row.value
}

/** Everything the website needs about one invitation (and nothing private). */
function partyDetails(partyId, list) {
  list = list || loadGuestList()
  const members = list.people.filter((g) => g.partyId === partyId)
  if (!members.length) throw new UserError('We could not find your invitation.')

  const guests = members.map((g) => ({
    guestId: g.guestId,
    firstName: g.firstName,
    lastName: g.lastName,
    isPlusOne: g.isPlusOne,
    invitedEvents: g.invitedEvents,
  }))

  // Only events someone on this invitation is invited to, in the Events tab's order.
  const invited = new Set(guests.flatMap((g) => g.invitedEvents))
  const events = list.events
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

  // Previous answers, so guests can review and change them. Saved emails and
  // phones are sent partly hidden; notes only as whether one is saved.
  const memberIds = new Set(guests.map((g) => g.guestId))
  const answers = {}
  const onFile = {}
  let addressOnFile = '' // only the place ("Dallas, TX"), never the street
  readTab(TAB.rsvps)
    .filter((r) => memberIds.has(r.guest_id))
    .forEach((r) => {
      if (r.address && !addressOnFile) {
        const where = r.address_country === 'United States' ? r.address_state : r.address_country === 'Outside the US' ? '' : r.address_country
        addressOnFile = [r.address_city, where].filter(Boolean).join(', ') || 'your country'
      }
      const attending = {}
      events.forEach((ev) => {
        if (r[ev.id]) attending[ev.id] = r[ev.id]
      })
      answers[r.guest_id] = { name: r.guest_name, dietary: r.dietary, attending }
      onFile[r.guest_id] = {
        email: r.email ? maskEmail(r.email) : '',
        phone: r.phone ? maskPhone(r.phone) : '',
        note: Boolean(r.note),
      }
    })
  return {
    partyId,
    partyName: members[0].partyName,
    guests,
    events,
    answers,
    onFile, // by guest id: { email: 'p•••h@gmail.com', phone: '•••-•••-1234', note: true } ('' / false if not saved)
    // Answered = anyone on it has saved answers (worked out per person, so
    // renaming a household or moving someone between households keeps it right).
    hasResponded: Object.keys(answers).length > 0,
    addressOnFile,
  }
}

/**
 * Saves an invitation's RSVP: one row per guest in RSVPs, one row in Party
 * Responses, a record of the submission in Change Log, then refreshes the
 * Summary and All Guests tabs.
 */
function saveRsvp(req, list) {
  const details = partyDetails(req.partyId, list)
  const guestsById = byId(details.guests, 'guestId')
  const eventsById = byId(details.events, 'id')
  const allEventIds = list.events.map((ev) => ev.event_id)
  const savedRows = byId(readTab(TAB.rsvps).filter((r) => guestsById[r.guest_id]), 'guest_id')
  const now = new Date()

  // The mailing address (one for the whole invitation). Blank boxes keep the
  // saved one; otherwise it's checked and tidied, and saved on every row.
  const newAddress = cleanAddress(req.address)
  const savedAddressRow = Object.values(savedRows).find((r) => r.address) || {}
  const address = newAddress || Object.fromEntries(ADDRESS_COLUMNS.map((c) => [c, savedAddressRow[c] || '']))

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
    // Everyone gives an email and a phone number (an unnamed plus-one who
    // isn't coming is skipped). A blank box keeps what's already saved.
    const saved = savedRows[guest.guestId] || {}
    const email = (limit(g.email, 200) || saved.email || '').toLowerCase()
    // Phones are saved as 214-555-1234 in the US, or with + and the country
    // code otherwise (+91 98765 43210). Older saved ones are tidied too.
    const phone = sheetPhone(limit(g.phone, 40) || saved.phone || '')
    const note = limit(g.note, 1000) || saved.note || ''
    const who = name || 'your guest'
    if (name) {
      if (!email) throw new UserError(`Please add an email for ${who}.`)
      if (!EMAIL.test(email) || COM_TYPO.test(email)) throw new UserError(`Please check the email for ${who}.`)
      if (!phone) throw new UserError(`Please add a phone number for ${who}.`)
      if (!isValidPhone(phone)) throw new UserError(`Please check the phone number for ${who}.`)
    }
    guestRows.push({
      updated_at: now,
      party_id: details.partyId,
      party_name: details.partyName,
      guest_id: guest.guestId,
      guest_name: name,
      plus_one: guest.isPlusOne ? 'yes' : '',
      dietary: limit(g.dietary, 500),
      email,
      phone,
      note,
      ...address,
      ...attending,
      // For the Change Log: "Sangeet: yes · Reception: no"
      _summary: guest.invitedEvents
        .map((id) => `${eventsById[id] ? eventsById[id].name : id}: ${attending[id] || '—'}`)
        .join(' · '),
    })
  })

  // When this party last saved (any older party-wide contact info is kept as it was).
  const savedResponse = readTab(TAB.responses).find((r) => r.party_id === details.partyId) || {}
  const responseRow = {
    updated_at: now,
    party_id: details.partyId,
    party_name: details.partyName,
    email: savedResponse.email || '',
    phone: savedResponse.phone || '',
    note: savedResponse.note || '',
    address: address.address || savedResponse.address || '',
  }

  // Only one save at a time, so two guests saving at once can't collide.
  const lock = LockService.getScriptLock()
  lock.waitLock(20000)
  try {
    const rsvps = getTab(TAB.rsvps)
    const rsvpHeader = ensureColumns(rsvps, HEADERS.RSVPs.concat(allEventIds))
    guestRows.forEach((row) => upsertRow(rsvps, rsvpHeader, 'guest_id', row))

    const responses = getTab(TAB.responses)
    upsertRow(responses, ensureColumns(responses, HEADERS['Party Responses']), 'party_id', responseRow)

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
    guestRows.forEach((r) =>
      logRow(
        r.guest_name || '(unnamed plus-one)',
        `${r._summary} · email: ${r.email || '—'} · phone: ${r.phone || '—'} · note: ${r.note || '—'} · address: ${r.address || '—'}`,
        r.dietary
      )
    )
  } finally {
    lock.releaseLock()
  }

  refreshSoon() // Summary and All Guests catch up about a minute later
  return partyDetails(req.partyId, list)
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

function requireToken(partyId, token, list) {
  const exists = (list || loadGuestList()).people.some((g) => g.partyId === partyId)
  if (!exists || !token || token !== makeToken(partyId)) {
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
  if (!sheet) throw new Error(`Missing tab "${name}". Run setup(), or use Wedding RSVP → Switch to the new guest list.`)
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

/**
 * Guest-typed text is always saved as plain text. Without this, an answer
 * starting with "=" (or + - @) would become a formula in the Sheet, and a
 * crafted formula could send other cells to an outside website. A leading
 * apostrophe tells Sheets "this is text"; it isn't shown in the cell.
 */
function asText(value) {
  // (Also plain numbers like ZIP code 07030, so Sheets keeps the leading zero.)
  return typeof value === 'string' && (/^[=+\-@]/.test(value) || /^\d+$/.test(value)) ? "'" + value : value
}

/** Updates the row whose keyColumn matches, or adds a new row. */
function upsertRow(sheet, header, keyColumn, data) {
  const keyIndex = header.indexOf(keyColumn)
  const values = header.map((h) => asText(h in data ? data[h] : ''))
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
  sheet.appendRow(header.map((h) => asText(h in data ? data[h] : '')))
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

// The same email checks the website does: something@something.ending (2+
// letters), and not a common slip on ".com" like ".con".
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i
const COM_TYPO = /\.(con|cmo|ocm|vom|xom|cpm|comm|coom|om)$/i

// Phone numbers, the same way the website does them (src/guest/contact.js).
//   US: 214-555-1234   India: +91 98765 43210   UK: +44 7911 123456
//   anywhere else: +33612345678
function formatPhone(text) {
  const raw = String(text).trim()
  let d = raw.replace(/\D/g, '')
  if (!raw.startsWith('+')) {
    if (d.length === 11 && d[0] === '1') d = d.slice(1)
    return usStyle(d.slice(0, 10))
  }
  d = d.slice(0, 15)
  if (d.startsWith('1')) return joinParts('+1', [usStyle(d.slice(1, 11))])
  if (d.startsWith('91')) return joinParts('+91', groups(d.slice(2, 12), [5, 5]))
  if (d.startsWith('44')) {
    const rest = d.slice(2).replace(/^0/, '')
    return joinParts('+44', groups(rest.slice(0, 10), [4, 6]))
  }
  return '+' + d
}

/** What the Sheet saves: like formatPhone, but US numbers without the "+1". */
function sheetPhone(text) {
  return formatPhone(text).replace(/^\+1 /, '')
}

function isValidPhone(phone) {
  return (
    /^\d{3}-\d{3}-\d{4}$/.test(phone) ||
    /^\+1 \d{3}-\d{3}-\d{4}$/.test(phone) ||
    /^\+91 \d{5} \d{5}$/.test(phone) ||
    /^\+44 \d{4} \d{5,6}$/.test(phone) ||
    (/^\+\d{8,15}$/.test(phone) && !/^\+(1|91|44)/.test(phone))
  )
}

function usStyle(d) {
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6)].filter(Boolean).join('-')
}
function groups(d, sizes) {
  const parts = []
  let i = 0
  sizes.forEach((n) => {
    if (i < d.length) parts.push(d.slice(i, i + n))
    i += n
  })
  return parts
}
function joinParts(code, parts) {
  return [code].concat(parts.filter(Boolean)).join(' ')
}

// The mailing address, the same way the website checks it (src/guest/address.js).
const ADDRESS_COLUMNS = ['address', 'address_street', 'address_apt', 'address_city', 'address_state', 'address_zip', 'address_country']
const US_STATE_CODES = ('AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY ' +
  'NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY AS GU MP PR VI AA AE AP').split(' ')

/**
 * The address the guest typed → its columns (with "address" all in one
 * cell: "123 Main St, Apt 4, Dallas, TX 75201"), or null if they left it
 * blank (keep the saved one). A mistake is a friendly UserError.
 */
function cleanAddress(raw) {
  if (!raw || typeof raw !== 'object') return null
  const a = {}
  ;['country', 'otherCountry', 'street', 'apt', 'city', 'state', 'zip'].forEach((k) => (a[k] = limit(raw[k], 150)))
  if (!['otherCountry', 'street', 'apt', 'city', 'state', 'zip'].some((k) => a[k])) return null
  // "I don't live in the United States": nothing is required or checked.
  const us = !a.country || a.country === 'US'
  const country = us ? 'United States' : a.otherCountry
  if (us) {
    if (!a.street) throw new UserError('Please add the street for your mailing address.')
    if (!a.city) throw new UserError('Please add the city for your mailing address.')
    a.state = a.state.toUpperCase()
    if (!US_STATE_CODES.includes(a.state)) throw new UserError('Please choose the state for your mailing address.')
    if (!/^\d{5}(-\d{4})?$/.test(a.zip)) throw new UserError('Please check the ZIP code (5 digits).')
  }
  const oneLine = us
    ? `${a.street}${a.apt ? ', ' + a.apt : ''}, ${a.city}, ${a.state} ${a.zip}`
    : [a.street, a.apt, a.city, [a.state, a.zip].filter(Boolean).join(' '), country].filter(Boolean).join(', ')
  return {
    address: oneLine,
    address_street: a.street,
    address_apt: a.apt,
    address_city: a.city,
    address_state: a.state,
    address_zip: a.zip,
    address_country: country || 'Outside the US',
  }
}

/** priya.shah@gmail.com → p•••h@gmail.com */
function maskEmail(email) {
  const at = email.lastIndexOf('@')
  if (at < 1) return '•••'
  const local = email.slice(0, at)
  const shown = local.length <= 2 ? local[0] + '•••' : local[0] + '•••' + local.slice(-1)
  return shown + email.slice(at)
}

/** 214-555-1234 → •••-•••-1234; +91 98765 43210 → +91 ••••• •3210 */
function maskPhone(phone) {
  const m = String(phone).match(/^(\+\d+ )?(.*)$/)
  const code = m[1] || ''
  let keep = 4
  const hidden = m[2]
    .split('')
    .reverse()
    .map((ch) => (/\d/.test(ch) ? (keep-- > 0 ? ch : '•') : ch))
    .reverse()
    .join('')
  return code + hidden
}

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

/** True for a checked checkbox, or "yes", "y", "x" typed in. */
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
// The Summary and All Guests tabs, and the "Wedding RSVP" menu
// ---------------------------------------------------------------------------

/**
 * Rebuilds the Summary and All Guests tabs. Runs after every RSVP; you can
 * also run it from the Wedding RSVP menu after editing the guest list.
 * (It also adds a checkbox column to Guests for any new event in Events.)
 */
function refreshReports() {
  forgetRemembered()
  const list = loadGuestList(true)
  ensureEventColumns(list.events)
  const answers = byId(readTab(TAB.rsvps), 'guest_id')
  refreshSummary(list, answers)
  refreshAllGuests(list, answers)
}

/**
 * The Summary tab: headcount per event, copy-ready lists of emails and phone
 * numbers, and which invitations haven't responded yet.
 */
function refreshSummary(list, answers) {
  list = list || loadGuestList()
  answers = answers || byId(readTab(TAB.rsvps), 'guest_id')
  const { events, people } = list
  const ss = SpreadsheetApp.getActive()
  const sheet = ss.getSheetByName(TAB.summary) || ss.insertSheet(TAB.summary, 0)
  const answerOf = (g, eventId) => (answers[g.guestId] || {})[eventId]
  const W = 5 // columns used
  const row = (...cells) => cells.concat(Array(W - cells.length).fill(''))

  const rows = [row('Last updated', new Date()), row(), row('Event', 'Invited', 'Yes', 'No', 'Waiting')]
  const bold = [3]
  events.forEach((ev) => {
    const invited = people.filter((g) => g.invitedEvents.includes(ev.event_id))
    const yes = invited.filter((g) => answerOf(g, ev.event_id) === 'yes').length
    const no = invited.filter((g) => answerOf(g, ev.event_id) === 'no').length
    rows.push(row(ev.name, invited.length, yes, no, invited.length - yes - no))
  })

  // Copy-ready lists: everyone's emails or phones in one cell, separated by
  // commas, each only once (a family sharing an email shows it once).
  const coming = people.filter((g) => g.invitedEvents.some((id) => answerOf(g, id) === 'yes'))
  const collect = (guests, field) => unique(guests.map((g) => (answers[g.guestId] || {})[field]))
  const lists = [
    ['All emails', collect(people, 'email')],
    ['All phone numbers', collect(people, 'phone')],
    ['Emails of guests coming', collect(coming, 'email')],
    ['Phone numbers of guests coming', collect(coming, 'phone')],
  ]
  rows.push(row())
  rows.push(row('Copy-ready lists: click a cell in column B, copy it, and paste it into BCC or a group chat'))
  bold.push(rows.length)
  const firstList = rows.length + 1
  lists.forEach(([label, items]) => rows.push(row(`${label} (${items.length})`, items.join(', '))))

  // Invitations that haven't answered yet: no one on them has saved answers
  // (worked out per person, so renaming a household keeps it right).
  const responded = new Set(people.filter((g) => answers[g.guestId]).map((g) => g.partyId))
  const invitations = {}
  people.forEach((g) => (invitations[g.partyId] = g.partyName))
  const ids = Object.keys(invitations)
  const waiting = ids.filter((id) => !responded.has(id))
  rows.push(row())
  rows.push(row(`Invitations: ${ids.length} · responded: ${ids.length - waiting.length} · waiting: ${waiting.length}`))
  bold.push(rows.length)
  rows.push(row('Still waiting on:'))
  waiting.forEach((id) => rows.push(row(invitations[id])))

  sheet.clear()
  sheet.getRange(1, 1, rows.length, W).setValues(rows.map((r) => r.map(asText)))
  bold.forEach((r) => sheet.getRange(r, 1, 1, W).setFontWeight('bold'))
  // The lists stay on one line each (no tall rows); the whole list is still copied.
  sheet.getRange(firstList, 2, lists.length, 1).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP)
  sheet.setColumnWidth(1, 280)
  sheet.setColumnWidth(2, 360)
}

/**
 * The All Guests tab: one row per guest (and per plus-one spot), with their
 * side and group, their answer for each event (yes / no / waiting, or "—"
 * if not invited), dietary needs, email, phone, and note. Filters you set on
 * it are kept when it refreshes.
 */
function refreshAllGuests(list, answers) {
  list = list || loadGuestList()
  answers = answers || byId(readTab(TAB.rsvps), 'guest_id')
  const { events, people } = list
  const ss = SpreadsheetApp.getActive()
  const sheet = ss.getSheetByName(TAB.allGuests) || ss.insertSheet(TAB.allGuests, 1)

  const header = ['Name', 'Household', 'Side', 'Group']
    .concat(events.map((ev) => ev.name))
    .concat(['Dietary', 'Email', 'Phone', 'Address', 'Note', 'Last updated'])
  const rows = people.map((g) => {
    const a = answers[g.guestId] || {}
    let name = `${g.firstName} ${g.lastName}`.trim()
    if (g.isPlusOne) name = a.guest_name ? `${a.guest_name} (guest of ${g.hostName})` : `Guest of ${g.hostName}`
    const perEvent = events.map((ev) => (g.invitedEvents.includes(ev.event_id) ? a[ev.event_id] || 'waiting' : '—'))
    return [name, g.household, g.side, g.group]
      .concat(perEvent)
      .concat([a.dietary || '', a.email || '', a.phone || '', a.address || '', a.note || '', a.updated_at || ''])
  })
  const all = [header].concat(rows)

  // Remember any filter (e.g. Side = Bride), so it survives the refresh.
  const criteria = {}
  const oldFilter = sheet.getFilter()
  if (oldFilter) {
    const r = oldFilter.getRange()
    for (let c = r.getColumn(); c <= r.getLastColumn(); c++) {
      const cr = oldFilter.getColumnFilterCriteria(c)
      if (cr) criteria[c] = cr.copy().build()
    }
    oldFilter.remove()
  }

  sheet.clear()
  const range = sheet.getRange(1, 1, all.length, header.length)
  range.setValues(all.map((r) => r.map(asText)))
  sheet.getRange(1, 1, 1, header.length).setFontWeight('bold')
  sheet.setFrozenRows(1)
  sheet.setFrozenColumns(1)

  // Colors for the answers: yes green, no red, waiting gray.
  const answerCells = sheet.getRange(2, 5, Math.max(rows.length, 1), Math.max(events.length, 1))
  const rule = (text, background, color) =>
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(text).setBackground(background).setFontColor(color).setRanges([answerCells]).build()
  sheet.setConditionalFormatRules([
    rule('yes', '#d9f2e3', '#1b5e3a'),
    rule('no', '#fbe0de', '#8a2a22'),
    rule('waiting', '#f1f3f4', '#6b7280'),
  ])

  const filter = range.createFilter()
  Object.keys(criteria).forEach((c) => {
    if (Number(c) <= header.length) filter.setColumnFilterCriteria(Number(c), criteria[c])
  })
}

/**
 * After an RSVP: rebuilds Summary and All Guests about a minute later, in the
 * background, so the guest doesn't wait for it. Several RSVPs close together
 * share one rebuild. (If background runs aren't allowed yet, it rebuilds
 * right away instead, like before.)
 */
function refreshSoon() {
  const cache = CacheService.getScriptCache()
  if (cache.get('refreshScheduled')) return
  try {
    ScriptApp.newTrigger('refreshFromTrigger').timeBased().after(60 * 1000).create()
    cache.put('refreshScheduled', 'yes', 10 * 60)
  } catch (err) {
    console.error(err)
    refreshReports()
  }
}

/** Runs about a minute after an RSVP (see refreshSoon). */
function refreshFromTrigger() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'refreshFromTrigger')
    .forEach((t) => ScriptApp.deleteTrigger(t))
  CacheService.getScriptCache().remove('refreshScheduled')
  refreshReports()
}

/** Adds a checkbox column to the Guests tab for any event that doesn't have one yet. */
function ensureEventColumns(events) {
  const sheet = getTab(TAB.guests)
  events.forEach((ev) => {
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0].map((h) => h.trim())
    if (header.includes(ev.event_id)) return
    const plusOne = header.indexOf('plus_one')
    let col
    if (plusOne === -1) {
      col = header.length + 1
    } else {
      col = plusOne + 1
      sheet.insertColumnBefore(col)
    }
    const cell = sheet.getRange(1, col)
    cell.setValue(ev.event_id).setFontWeight('bold').setNote(`Check if this person is invited to ${ev.name}.`)
    sheet.getRange(2, col, sheet.getMaxRows() - 1, 1).insertCheckboxes()
  })
}

/** Each value once, in the order first seen; blanks skipped. Emails ignore capitals. */
function unique(values) {
  const seen = new Set()
  const out = []
  values.forEach((v) => {
    const text = String(v || '').trim()
    const key = text.toLowerCase()
    if (!text || seen.has(key)) return
    seen.add(key)
    out.push(text)
  })
  return out
}

/** Adds a "Wedding RSVP" menu to the Sheet (Google runs this when the Sheet opens). */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Wedding RSVP')
    .addItem('Refresh Summary and All Guests', 'refreshReports')
    .addSeparator()
    .addItem('Switch to the new guest list (one time)', 'switchToNewGuestList')
    .addToUi()
}

// ---------------------------------------------------------------------------
// Setting up the tabs
// ---------------------------------------------------------------------------

const SAMPLE_EVENTS = [
  ['ceremony', 'Intimate Ceremony', 'April 9', 'Morning', 'TBD', 'TBD', 'TBD', 'TBD', 'Placeholder description.'],
  ['sangeet', 'Welcome Night / Sangeet', 'April 9', 'Evening', 'TBD', 'TBD', 'TBD', 'TBD', 'Placeholder description.'],
  ['indian-wedding', 'Indian Wedding', 'April 10', 'Morning', 'TBD', 'TBD', 'TBD', 'TBD', 'Placeholder description.'],
  ['reception', 'Cocktail Hour + Reception', 'April 10', 'Evening', 'TBD', 'TBD', 'TBD', 'TBD', 'Placeholder description.'],
]

// SAMPLE guests to test with — replace them with your real guest list.
// first, last, household, side, group, { events they're invited to }, plus_one
// Two "Priya Shah"s let you test the "which one is you?" popup; Sam Rivera is
// invited only to April 10's events.
const SAMPLE_GUESTS = [
  ['Priya', 'Shah', 'Shah family', 'Bride', "Mom's side", ['ceremony', 'sangeet', 'indian-wedding', 'reception'], false],
  ['Rohan', 'Shah', 'Shah family', 'Bride', "Mom's side", ['ceremony', 'sangeet', 'indian-wedding', 'reception'], false],
  ['Priya', 'Shah', '', 'Groom', 'College friends', ['sangeet', 'reception'], true],
  ['Jordan', 'Lee', 'Lee family', 'Groom', "Dad's side", ['sangeet', 'indian-wedding', 'reception'], false],
  ['Sam', 'Lee', 'Lee family', 'Groom', "Dad's side", ['sangeet', 'indian-wedding', 'reception'], false],
  ['Max', 'Lee', 'Lee family', 'Groom', "Dad's side", ['sangeet', 'indian-wedding'], false],
  ['Sam', 'Rivera', '', 'Bride', 'Work friends', ['indian-wedding', 'reception'], true],
]

/**
 * Creates any missing tabs with their headers (and SAMPLE rows in Settings,
 * Events, and Guests to test with). Safe to run again: it never changes a
 * tab that already exists.
 */
function setup() {
  const ss = SpreadsheetApp.getActive()
  const samples = { Settings: [['site_passcode', 'CELEBRATE']], Events: SAMPLE_EVENTS } // CHANGE the passcode!

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
  if (!ss.getSheetByName(TAB.guests)) createGuestsTab(ss)

  // Remove the blank starter tab Google creates, if it's still empty.
  const starter = ss.getSheetByName('Sheet1')
  if (starter && starter.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(starter)

  refreshReports() // creates the Summary and All Guests tabs (first in the list)
  secret() // creates the private signing key if it doesn't exist yet
  console.log('Setup done. Tabs: ' + ss.getSheets().map((s) => s.getName()).join(', '))
}

/** The Guests tab: headers with notes, checkbox columns, and the sample guests. */
function createGuestsTab(ss) {
  const events = readTab(TAB.events).filter((ev) => ev.event_id)
  const eventIds = events.map((ev) => ev.event_id)
  const header = GUEST_COLUMNS_BEFORE.concat(eventIds, GUEST_COLUMNS_AFTER)
  const sheet = ss.insertSheet(TAB.guests, 0)
  const rowsBelow = sheet.getMaxRows() - 1
  const col = (name) => header.indexOf(name) + 1

  sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold')
  sheet.setFrozenRows(1)
  // Names and labels stay plain text (so Sheets never turns one into a date).
  sheet.getRange(2, 1, rowsBelow, GUEST_COLUMNS_BEFORE.length).setNumberFormat('@')
  eventIds.concat(['plus_one']).forEach((name) => sheet.getRange(2, col(name), rowsBelow, 1).insertCheckboxes())
  sheet.getRange(2, col('guest_id'), rowsBelow, 1).setFontColor('#9aa0a6')

  // Hover over a column title to see these.
  const notes = {
    first_name: 'Their first name, as they would type it to find their invitation.',
    last_name: 'Their last name.',
    household:
      'Leave blank if they are invited on their own.\n\nFor a family or couple, give everyone the exact same household name (e.g. "Shah family"): they become one invitation, and any of them can RSVP for everyone.\n\nGuests only see this name if two guests share the same name, to pick the right invitation.',
    side: 'Private (never shown to guests): e.g. Bride, Groom, Both.',
    group: "Private (never shown to guests): e.g. Mom's side, College friends.",
    plus_one: 'Check if this person may bring a guest. Their RSVP gets a "Your guest" spot.',
    guest_id: "Filled in automatically. Don't change it.",
  }
  events.forEach((ev) => (notes[ev.event_id] = `Check if this person is invited to ${ev.name}.`))
  Object.keys(notes).forEach((name) => sheet.getRange(1, col(name)).setNote(notes[name]))

  const rows = SAMPLE_GUESTS.map(([first, last, household, side, group, invitedTo, plusOne]) =>
    [first, last, household, side, group].concat(eventIds.map((id) => invitedTo.includes(id)), [plusOne, ''])
  )
  sheet.getRange(2, 1, rows.length, header.length).setValues(rows)
  sheet.autoResizeColumns(1, header.length)
  ensureGuestIds()
}

/**
 * One time: moves from the old guest list (a Parties tab plus a Guests tab
 * with party ids) to the new one (just Guests, with households and
 * checkboxes). Nothing is deleted: the old tabs are renamed "Old …".
 */
function switchToNewGuestList() {
  const ss = SpreadsheetApp.getActive()
  // From the Sheet's menu, it asks first. Run from the Apps Script editor
  // (choose switchToNewGuestList next to ▶ Run), there's no Sheet to show a
  // question in, so it just goes ahead and reports in the log below.
  let ui = null
  try {
    ui = SpreadsheetApp.getUi()
  } catch (err) {
    ui = null
  }
  const tell = (message) => (ui ? ui.alert(message) : console.log(message))
  const guests = ss.getSheetByName(TAB.guests)
  const header = guests ? guests.getRange(1, 1, 1, Math.max(guests.getLastColumn(), 1)).getDisplayValues()[0] : []
  if (guests && !header.includes('party_id')) {
    tell('Your Guests tab already uses the new layout.')
    return
  }
  if (ui) {
    const answer = ui.alert(
      'Switch to the new guest list?',
      'Your Guests, Parties, RSVPs, and Party Responses tabs will be renamed with "Old" in front (nothing is deleted), and a new Guests tab with sample guests will be created.',
      ui.ButtonSet.OK_CANCEL
    )
    if (answer !== ui.Button.OK) return
  }
  ;['Guests', 'Parties', 'RSVPs', 'Party Responses'].forEach((name) => {
    const sheet = ss.getSheetByName(name)
    if (!sheet) return
    let newName = 'Old ' + name
    for (let n = 2; ss.getSheetByName(newName); n++) newName = `Old ${name} ${n}`
    sheet.setName(newName)
  })
  setup()
  ss.setActiveSheet(ss.getSheetByName(TAB.guests))
  tell('Done! Your new Guests tab has sample guests to try. Hover over a column title to see what goes in it.')
}

/** Tries a search and a passcode check; results appear in the log. */
function tryItOut() {
  const found = searchGuests('priya shah')
  console.log('Search "priya shah" →', JSON.stringify(found.matches))
  const result = verifyCode(found.matches[0].guestId, sitePasscode())
  console.log('Right passcode → invitation:', result.party.partyName,
    '| guests:', result.party.guests.map((g) => g.firstName || '(plus-one)').join(', '),
    '| events:', result.party.events.map((e) => e.name).join(', '))
  try {
    verifyCode(found.matches[0].guestId, 'wrong')
  } catch (err) {
    console.log('Wrong passcode →', err.message)
  }
}
