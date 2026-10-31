// Every illustration spot on the site, in one list.
//
// Each spot has a stable name (like "rsvpCouple") that the page uses.
// To swap in real artwork:
//   1. Put the image file in public/assets/prototype/ (e.g. hero-couple.png)
//   2. Fill in "src" below with the file name: src: 'assets/prototype/hero-couple.png'
// The page will show the image instead of the placeholder. No other changes needed.
//
// "ratio" is the shape of the spot (width / height). Final art should
// roughly match it. "note" describes what the art is meant to show.
// "tint: true" draws a one-color drawing in the page's text color instead of
// its own colors, so it matches every design (its see-through parts stay see-through).

const art = {
  storyVignette: {
    src: 'assets/art/coffee-date.svg',
    ratio: '963 / 754',
    tint: true,
    note: 'The two of us on a coffee date, playing cards',
  },
  transitionWalk: {
    src: '',
    ratio: '3 / 1',
    note: 'Tiny couple walking hand in hand',
  },
  'event-ceremony': {
    src: 'assets/art/ceremony.svg',
    ratio: '614 / 1040',
    tint: true,
    note: 'The two of us at the civil ceremony (with a basketball)',
  },
  'event-sangeet': {
    src: '',
    ratio: '1 / 1',
    note: 'Welcome Night / Sangeet vibe',
  },
  'event-indian-wedding': {
    src: '',
    ratio: '1 / 1',
    note: 'Indian Wedding vibe',
  },
  'event-reception': {
    src: '',
    ratio: '1 / 1',
    note: 'Cocktail Hour + Reception vibe',
  },
  indianAttire: {
    src: '',
    ratio: '16 / 9',
    note: 'Couple in Indian attire, a quiet in-between moment',
  },
  rsvpCouple: {
    src: '',
    ratio: '4 / 3',
    note: 'Closing scene: couple walking away together',
  },
}

export default art
