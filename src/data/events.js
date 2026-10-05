// The list of wedding events. Edit details here and every page updates.
//
// Each event has a unique "id". In Milestone 2 we'll use these ids to show
// each guest only the events they're invited to. For example, a guest
// invited to ["sangeet", "reception"] would only see those two blocks.
//
// "TBD" values are placeholders to fill in later.
//
// Each event's artwork is listed in src/data/art.js as "event-<id>",
// e.g. the sangeet's art is "event-sangeet".

const events = [
  {
    id: 'ceremony',
    name: 'Intimate Ceremony',
    date: 'April 9',
    timeOfDay: 'Morning',
    time: 'TBD',
    location: 'TBD',
    attire: 'TBD',
    description: 'Placeholder description of the intimate ceremony.',
  },
  {
    id: 'sangeet',
    name: 'Welcome Night / Sangeet',
    date: 'April 9',
    timeOfDay: 'Evening',
    time: 'TBD',
    location: 'TBD',
    attire: 'TBD',
    description: 'Placeholder description of the welcome night and sangeet.',
  },
  {
    id: 'indian-wedding',
    name: 'Indian Wedding',
    date: 'April 10',
    timeOfDay: 'Morning',
    time: 'TBD',
    location: 'TBD',
    attire: 'TBD',
    description: 'Placeholder description of the Indian wedding.',
  },
  {
    id: 'reception',
    name: 'Cocktail Hour + Reception',
    date: 'April 10',
    timeOfDay: 'Evening',
    time: 'TBD',
    location: 'TBD',
    attire: 'TBD',
    description: 'Placeholder description of the cocktail hour and reception.',
  },
]

export default events
