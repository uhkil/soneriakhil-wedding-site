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
// list of links. A link with an empty href shows as plain text until it has one;
// a link's optional "before" and "note" are plain text shown before and
// after it (so only part of the line is the link), and "thin" is text shown
// after it in lighter letters (e.g. Zion + "National Park").
// Also optional: "gap" (space between the drawing and the card, in px),
// "width" (the card's width, e.g. '20em'), "oneLine" (keep it on one line),
// "peopleSize" (side drawings only): makes the drawing bigger or smaller so
// the two of us come out the same size in every drawing (the coffee date is
// the 1). Measured by eye from Akhil's head; nudge it if one looks off.
// "gallery" (photos shown one at a time, with arrows and dots to step through
// them: { src: 'assets/...', alt: '...' }; a plain label string shows a
// placeholder instead).

const art = {
  storyVignette: {
    src: 'assets/art/coffee-date.webp',
    ratio: '963 / 754',
    tint: true,
    note: 'The two of us on a coffee date, playing cards',
    nugget: {
      gap: 40,
      width: '20em',
      heading: 'games we luv',
      links: [
        { before: 'NYT Daily ', label: 'Crossword', href: 'https://www.nytimes.com/crosswords' },
        {
          label: 'Overcooked2',
          note: 'for Nintendo',
          href: 'https://www.nintendo.com/au/games/nintendo-switch/overcooked-2/?srsltid=AYCX9vIhG5JQEgwUudRMf7g765dCAPRvgemQCakkltnwtautu24y6BYe',
        },
        { label: 'Phase 10', href: 'https://www.amazon.com/dp/B01N3489RH?plpRedirect=mhFallback&ref=clp_hp_h_pc&th=1' },
        {
          label: 'Tailspin',
          note: '– only available in India',
          href: 'https://www.amazon.in/Tailspin-Word-Game-Intelligent-Building/dp/B09HSL5W4W',
        },
        { label: 'Anthropeum', href: 'https://anthropeum.com/' },
      ],
    },
  },
  eventsVignette: {
    src: 'assets/art/museum-date.webp',
    peopleSize: 1.34, // so the two of us come out the same size as in the coffee date
    ratio: '597 / 784',
    tint: true,
    note: 'The two of us at a museum, looking at a painting',
    nugget: {
      gap: 40,
      heading: 'museums we’ve enjoyed',
      text: 'go check them out for yourself :-)',
      links: [
        { label: 'Guggenheim Museum', href: 'https://maps.app.goo.gl/9N26RML1zH1MLGu69' },
        { label: 'Frida Kahlo Museum', href: 'https://maps.app.goo.gl/5jcZPBLdUXwp6aUq5' },
        { label: 'The Met Cloisters', href: 'https://maps.app.goo.gl/eWqjgf25a5Jh2CPV6' },
        { label: 'Blanton Museum of Art', href: 'https://maps.app.goo.gl/3DLSNmFDV7U6J1rw8' },
        { label: 'MoMA SF', href: 'https://maps.app.goo.gl/3RGzN3oLv7smMSVU7' },
        { label: 'New York Transit Museum', href: 'https://maps.app.goo.gl/aT54NyMAgcoPTKJd9' },
        { label: 'The Metropolitan Museum of Art', href: 'https://maps.app.goo.gl/GwU2oMSNgSVyfwVh8' },
        { label: 'De Young Museum', href: 'https://maps.app.goo.gl/YzCSXzSsmLHXPvjo6' },
      ],
    },
  },
  registryVignette: {
    src: 'assets/art/pottery-date.webp',
    peopleSize: 0.78, // so the two of us come out the same size as in the coffee date
    ratio: '885 / 1017',
    tint: true,
    note: 'The two of us at a pottery class',
    nugget: {
      gap: 40,
      width: '300px',
      heading: 'some pieces we’ve made',
      // Shown one at a time, in this order (web-sized copies, in public/assets/pottery/).
      gallery: [
        { src: 'assets/pottery/pottery-4.jpg', alt: 'A black glazed jug carved with a cat' },
        { src: 'assets/pottery/pottery-3.jpg', alt: 'A small red glazed pouring cup' },
        { src: 'assets/pottery/pottery-1.jpg', alt: 'Four clay cups drying on boards on a pottery wheel' },
        { src: 'assets/pottery/pottery-6.jpg', alt: 'A clay vase with a wavy ridge, on a turntable' },
        { src: 'assets/pottery/pottery-2.jpg', alt: 'A curving clay candle holder, propped up with a sponge' },
        { src: 'assets/pottery/pottery-5.jpg', alt: 'A white clay corner with a window and steps' },
      ],
    },
  },
  travelVignette: {
    src: 'assets/art/basketball-date.webp',
    peopleSize: 1.15, // so the two of us come out the same size as in the coffee date
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
    // (a new file name, so browsers don't keep showing the old drawing)
    src: 'assets/art/indian-outfit-v2.webp',
    ratio: '626 / 1104',
    tint: true,
    note: 'The two of us dressed for the Indian wedding, in flower garlands',
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
    peopleSize: 1.09, // so the two of us come out the same size as in the coffee date
    ratio: '799 / 1104',
    tint: true,
    note: 'The two of us out on a hike',
    nugget: {
      gap: 40,
      width: '21em', // wide enough for each park on one line
      heading: 'national parks we’ve explored',
      // Each park's own name stands out; "thin" is the rest, in lighter
      // letters. No links yet: an empty href shows the name as plain text.
      links: [
        { label: 'Zion', thin: 'National Park', href: '' },
        { label: 'Bryce Canyon', thin: 'National Park', href: '' },
        { label: 'Joshua Tree', thin: 'National Park', href: '' },
        { label: 'Yosemite', thin: 'National Park', href: '' },
        { label: 'Patagonia', thin: 'National Park', href: '' },
        { label: 'Rocky Mountain', thin: 'National Park', href: '' },
        { label: 'Acadia', thin: 'National Park', href: '' },
        { label: 'Olympic', thin: 'National Park', href: '' },
        { label: 'Redwood', thin: 'National and State Parks', href: '' },
        { label: 'Manuel Antonio', thin: 'National Park', href: '' },
      ],
    },
  },

}

export default art
