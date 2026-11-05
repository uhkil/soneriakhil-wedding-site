// Dates for the logged-in guest, worked out from the events they're invited
// to (so someone invited only to April 10's events never sees April 9).
// Event dates and times come from the Sheet / src/data/events.js, e.g.
// date "April 10" and time "10:00 AM". All times are Arlington time.
const YEAR = 2027
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const ARLINGTON = '-05:00' // Central Daylight Time, which Arlington is on in April

// "April 10" + "10:00 AM" → that moment. Without a time, the start of the day.
export function eventStart(event) {
  const [monthName, day] = String(event.date || '').trim().split(/\s+/)
  const month = MONTHS.indexOf((monthName || '').toLowerCase()) + 1
  if (!month || !parseInt(day)) return null
  const t = String(event.time || '').match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i)
  let hour = t ? parseInt(t[1]) % 12 : 0
  if (t && t[3].toLowerCase() === 'pm') hour += 12
  const pad = (n) => String(n).padStart(2, '0')
  return new Date(`${YEAR}-${pad(month)}-${pad(parseInt(day))}T${pad(hour)}:${t?.[2] || '00'}:00${ARLINGTON}`)
}

// The guest's first event (the countdown counts down to it).
export function firstEvent(events) {
  return events
    .map((event) => ({ event, start: eventStart(event) }))
    .filter((e) => e.start)
    .sort((a, b) => a.start - b.start)[0]
}

// "April 10, 2027", or "April 9–10, 2027" when their events span both days.
export function dateRange(events) {
  const dates = [...new Set(events.filter(eventStart).sort((a, b) => eventStart(a) - eventStart(b)).map((e) => e.date))]
  if (!dates.length) return `April 9–10, ${YEAR}` // nothing to go on: the whole weekend
  if (dates.length === 1) return `${dates[0]}, ${YEAR}`
  const [month, firstDay] = dates[0].split(/\s+/)
  const lastDay = dates[dates.length - 1].split(/\s+/)[1]
  return `${month} ${firstDay}–${lastDay}, ${YEAR}`
}

// RSVPs close at the end of January 15, 2027, Arlington time (CST in
// January). After that, the RSVP buttons (under the countdown, and Send at
// the bottom of the form) go away, and the RSVP section shows the guest's
// answers without letting them change. (If the Sheet's script ever sends
// its own date, party.rsvpCloses, that one is used instead.)
export const RSVP_CLOSES = '2027-01-16T00:00:00-06:00'

export function rsvpClosed(party) {
  return Date.now() >= new Date(party?.rsvpCloses || RSVP_CLOSES).getTime()
}
