// Every illustration spot on the site, in one list.
//
// Each spot has a stable name (like "rsvpCouple") that the page uses.
// To swap in real artwork:
//   1. Put the image file in public/assets/art/ (e.g. rsvp-couple.webp)
//   2. Fill in "src" below with the file name: src: 'assets/art/rsvp-couple.webp'
// Drawings are kept as SVG in art-source/ (for editing) and published as
// sharp WebP images rendered from them (SVGs with cut-outs look blurry on iPhones).
// The page will show the image instead of the placeholder. No other changes needed.
//
// "ratio" is the shape of the spot (width / height). Final art should
// roughly match it. "note" describes what the art is meant to show.
// "tint: true" marks a one-color drawing that's already in the page's dark
// blue (#003459) with see-through gaps, shown sized to fit its spot.
// "nugget" is a little extra about us that pops up when a guest hovers over
// (or taps) the drawing: an optional heading, some text, and an optional
// list of links. A link with an empty href shows as plain text until it has one.
// Also optional: "gap" (space between the drawing and the card, in px),
// "width" (the card's width, e.g. '20em'), "oneLine" (keep it on one line),
// "gallery" (small photos: a label string is a placeholder square; later use
// { src: 'assets/...', alt: '...' }).

const art = {
  storyVignette: {
    src: 'assets/art/coffee-date.webp',
    ratio: '963 / 754',
    tint: true,
    note: 'The two of us on a coffee date, playing cards',
    nugget: {
      gap: 40,
      width: '20em', // two lines of text
      heading: 'games we love',
      text: 'Placeholder: links to the games we like to play together are coming soon.',
    },
  },
  eventsVignette: {
    src: 'assets/art/museum-date.webp',
    ratio: '597 / 784',
    tint: true,
    note: 'The two of us at a museum, looking at a painting',
    nugget: {
      gap: 40,
      heading: 'museums we’ve enjoyed',
      text: 'Go see them for yourself:',
      links: [
        { label: 'Placeholder museum one', href: '' },
        { label: 'Placeholder museum two', href: '' },
        { label: 'Placeholder museum three', href: '' },
      ],
    },
  },
  registryVignette: {
    src: 'assets/art/pottery-date.webp',
    ratio: '885 / 1017',
    tint: true,
    note: 'The two of us at a pottery class',
    nugget: {
      gap: 40,
      heading: 'things we’ve made',
      text: 'Pieces from our pottery classes together:',
      // Placeholder photo spots for now; later each gets an image.
      gallery: ['Piece 1', 'Piece 2', 'Piece 3'],
    },
  },
  travelVignette: {
    src: 'assets/art/basketball-date.webp',
    ratio: '1015 / 775',
    tint: true,
    note: 'The two of us playing basketball',
    nugget: {
      oneLine: true,
      // (non-breaking hyphens keep “p-i-g” on one line)
      text: 'fun fact: soneri has beaten akhil in p\u2011i\u2011g 3 times!',
    },
  },
  'event-ceremony': {
    src: 'assets/art/ceremony.webp',
    ratio: '614 / 1040',
    tint: true,
    note: 'The two of us at the civil ceremony (with a basketball)',
  },
  'event-sangeet': {
    src: 'assets/art/sangeet-outfit.webp',
    ratio: '750 / 1183',
    tint: true,
    note: 'The two of us dressed for the sangeet, with dandiya sticks',
  },

  'event-indian-wedding': {
    src: 'assets/art/indian-outfit.webp',
    ratio: '657 / 1136',
    tint: true,
    note: 'The two of us dressed for the Indian wedding',
  },
  'event-reception': {
    src: 'assets/art/reception-outfit.webp',
    ratio: '561 / 1140',
    tint: true,
    note: 'The two of us dressed for the reception, raising a toast',
  },
  rsvpCouple: {
    // Top right of the RSVP section, above the title (one of the corner drawings).
    src: 'assets/art/hiking-date.webp',
    ratio: '799 / 1104',
    tint: true,
    note: 'The two of us out on a hike',
  },

}

export default art
