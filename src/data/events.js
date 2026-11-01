// What the site shows for each event, by its id (the event_id in the
// Sheet's Events tab).
//
// The Sheet still decides WHO is invited to which events (and their order);
// these details fill in WHAT each event is. Anything left out here falls back
// to that column in the Sheet, so an event missing from this list still shows.
//
// Optional extras:
//   mapUrl      — the pin next to the address opens this (Google Maps link)
//   moodboard   — the moodboard icon next to the attire opens this link; ''
//                 shows a "coming soon" message instead
//   attireNote  — a small line under the attire; { before, link, after } makes
//                 the middle words a link that pops up a card (attirePopup)
//   attirePopup — what that card shows: { image, alt, caption } (no image yet
//                 → a placeholder box)
//
// Use " | " between two parts of a name or place (e.g. a venue and its room).

const LOEWS_ADDRESS = '1600 E Randol Mill Rd, Arlington, TX 76011'
const LOEWS_MAP = 'https://share.google/6XwFvYhHYML7DQSGE'

const eventDetails = {
  ceremony: {
    name: 'Intimate Ceremony',
    time: '9:00 AM',
    location: 'Weston Gardens',
    address: '8101 Anglin Dr, Fort Worth, TX 76140',
    mapUrl: 'https://share.google/6XTHf1bFIH6gOgH4F',
    attire: 'Garden formal',
    moodboard: '',
    description: 'Join the couple for an intimate gathering as they read their vows to each other.',
  },
  sangeet: {
    name: 'Welcome Night | Sangeet',
    time: '7:00 PM',
    location: 'Live! by Loews | Arlington Ballroom',
    address: LOEWS_ADDRESS,
    mapUrl: LOEWS_MAP,
    attire: 'Dark jewel tones (to be confirmed)',
    moodboard: '',
    description:
      'Join the couple for an evening of mingling, good food, and dancing as they kick off the wedding weekend.',
  },
  'indian-wedding': {
    name: 'Wedding',
    time: '10:00 AM',
    location: 'Live! by Loews | Clover Club Lawn',
    address: LOEWS_ADDRESS,
    mapUrl: LOEWS_MAP,
    attire: 'Indian clothes or western formal',
    moodboard: '',
    attireNote: { before: 'bonus points if you wear a ', link: 'cowboys jersey', after: '' },
    attirePopup: {
      image: 'assets/photos/cowboys-jersey.jpg',
      alt: 'Suraj and friends in Cowboys jerseys at AT&T Stadium',
      caption: '',
    },
    description: 'Join the couple for a traditional Indian wedding ceremony, followed by lunch.',
  },
  reception: {
    name: 'Cocktail Hour | Reception',
    time: '6:00 PM',
    location: 'Live! by Loews | Arlington Ballroom',
    address: LOEWS_ADDRESS,
    mapUrl: LOEWS_MAP,
    attire: 'Indian clothes or western formal',
    moodboard: '',
    description: 'Join the couple for an hour of mingling, followed by a night celebrating the newlyweds.',
  },
}

// The Sheet's event, with these details laid over it.
export function withEventDetails(event) {
  return { ...event, ...eventDetails[event.id] }
}
