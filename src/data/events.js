// What the site shows for each event, by its id (the event_id in the
// Sheet's Events tab).
//
// The Sheet still decides WHO is invited to which events (and their order);
// these details fill in WHAT each event is. Anything left out here falls back
// to that column in the Sheet, so an event missing from this list still shows.
//
// Optional extras:
//   calendarUrl — the calendar icon next to the time opens this ("add to
//                 calendar" link to the event in our Google Calendar)
//   mapUrl      — the pin next to the address opens this (Google Maps link)
//   moodboard   — the moodboard icon next to the attire opens this link; ''
//                 shows a "coming soon" message instead
//   attireNote  — a small line under the attire; { before, link, after } makes
//                 the middle words a link that opens a pop-up window (attirePopup)
//   attirePopup — what that window shows: { image, alt, caption } — the photo,
//                 its description for screen readers, and a caption shown
//                 under it (no image yet → a placeholder box)
//
// Use " | " between two parts of a name or place (e.g. a venue and its room).

// "Add to calendar" links: each event in our Google Calendar (soneriakhil@gmail.com).
const calendar = (eventId) =>
  `https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=${eventId}&tmsrc=soneriakhil%40gmail.com`

const LOEWS_ADDRESS = '1600 E Randol Mill Rd, Arlington, TX 76011'
const LOEWS_MAP = 'https://maps.app.goo.gl/mwfHokVjNmsswHYw9'

const eventDetails = {
  ceremony: {
    name: 'Intimate Ceremony',
    time: '9:00 AM',
    calendarUrl: calendar('M2ZoOWZkYmMyNDBvMmhjaXRzaWIzZmY0ZnIgc29uZXJpYWtoaWxAbQ'),
    location: 'Weston Gardens',
    address: '8101 Anglin Dr, Fort Worth, TX 76140',
    mapUrl: 'https://maps.app.goo.gl/9ukmWUF7erqTjdSNA',
    attire: 'Garden party | Chic semi-formal western',
    moodboard: '',
    description: 'Join the couple for an intimate gathering as they read their vows to each other.',
  },
  sangeet: {
    name: 'Welcome Night | Sangeet',
    time: '7:00 PM',
    calendarUrl: calendar('MnNyc2FoczRjNWQwNmphY3FsYmJmc3NncWUgc29uZXJpYWtoaWxAbQ'),
    location: 'Live! by Loews | Arlington Ballroom',
    address: LOEWS_ADDRESS,
    mapUrl: LOEWS_MAP,
    attire: 'Vibrant & festive colors | Traditional Indian or Indo-western',
    moodboard: '',
    description:
      'Join the couple for an evening of mingling, good food, and dancing as they kick off the wedding weekend.',
  },
  'indian-wedding': {
    name: 'Wedding',
    time: '10:00 AM',
    calendarUrl: calendar('NzJiY2YxdDdrOHM5Z3Nna3FibGhtcjA4c2ogc29uZXJpYWtoaWxAbQ'),
    location: 'Live! by Loews | Clover Club Lawn',
    address: LOEWS_ADDRESS,
    mapUrl: LOEWS_MAP,
    attire: 'Traditional Indian | Please avoid wearing red',
    moodboard: '',
    description: 'Join the couple for a traditional Indian wedding ceremony, followed by lunch.',
  },
  reception: {
    name: 'Cocktail Hour | Reception',
    time: '6:00 PM',
    calendarUrl: calendar('NmF1bWcwdWNicmM4amkxNTI0ODBwNWtiN2ogc29uZXJpYWtoaWxAbQ'),
    location: 'Live! by Loews | Arlington Ballroom',
    address: LOEWS_ADDRESS,
    mapUrl: LOEWS_MAP,
    attire: 'Deep & dark tones | Formal Indian or western | Please avoid wearing silver & gold',
    moodboard: '',
    description: 'Join the couple for an hour of mingling, followed by a night celebrating the newlyweds.',
  },
}

// The Sheet's event, with these details laid over it.
export function withEventDetails(event) {
  return { ...event, ...eventDetails[event.id] }
}
