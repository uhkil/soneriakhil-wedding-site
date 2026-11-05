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
// "nugget" is a little extra about us, shown beside a side drawing when it's
// scrolled to the middle of the screen (see SideDrawing.jsx): an optional
// heading, some text, and an optional list of links. A link with an empty href shows as plain text until it has one;
// a link's optional "before" and "note" are plain text shown before and
// after it (so only part of the line is the link), and "thin" is text shown
// after it in lighter letters (e.g. Zion + "National Park").
// "peopleSize" (side drawings only): makes the drawing bigger or smaller so
// the two of us come out the same size in every drawing (the coffee date is
// the 1). Measured by eye from Akhil's head; nudge it if one looks off.
// "gallery" (photos shown one at a time, with arrows and dots to step through
// them: { src: 'assets/...', alt: '...' }; a plain label string shows a
// placeholder instead).

const art = {
  coffeeDate: {
    src: 'assets/art/coffee-date.webp',
    ratio: '963 / 754',
    tint: true,
    note: 'The two of us on a coffee date, playing cards',
    nugget: {
      heading: 'games we luv',
      links: [
        { label: 'NYT Crossword', href: 'https://www.nytimes.com/crosswords' },
        {
          label: 'Overcooked2',
          href: 'https://www.nintendo.com/au/games/nintendo-switch/overcooked-2/?srsltid=AYCX9vIhG5JQEgwUudRMf7g765dCAPRvgemQCakkltnwtautu24y6BYe',
        },
        { label: 'Phase 10', href: 'https://www.amazon.com/dp/B01N3489RH?plpRedirect=mhFallback&ref=clp_hp_h_pc&th=1' },
        {
          label: 'Tailspin',
          href: 'https://www.amazon.in/Tailspin-Word-Game-Intelligent-Building/dp/B09HSL5W4W',
        },
        { label: 'Anthropeum', href: 'https://anthropeum.com/' },
      ],
    },
  },
  museumDate: {
    src: 'assets/art/museum-date.webp',
    peopleSize: 1.34, // so the two of us come out the same size as in the coffee date
    ratio: '597 / 784',
    tint: true,
    note: 'The two of us at a museum, looking at a painting',
    nugget: {
      heading: 'museums we’ve enjoyed',
      // (the smiley never splits or starts a line on its own)
      text: 'go check them out for yourself\u00a0:\u2011)',
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
  potteryDate: {
    src: 'assets/art/pottery-date.webp',
    peopleSize: 0.94, // 20% bigger than matching the coffee date exactly (0.78), at our request
    ratio: '885 / 1017',
    tint: true,
    note: 'The two of us at a pottery class',
    nugget: {
      heading: 'some pieces we’ve made',
      text: 'we love taking on creative hobbies together!',
      // Shown one at a time, in this order (web-sized copies in
      // public/assets/pottery/, 1600px, for full screen; and 600px copies in
      // public/assets/pottery/small/, which the card shows).
      gallery: [
        { src: 'assets/pottery/pottery-01.jpg', alt: 'A black glazed jug carved with a cat' },
        { src: 'assets/pottery/pottery-02.jpg', alt: 'A small red glazed pouring cup' },
        { src: 'assets/pottery/pottery-03.jpg', alt: 'A cup with a smiling clown face' },
        { src: 'assets/pottery/pottery-04.jpg', alt: 'A clay vase with a wavy ridge, on a turntable' },
        { src: 'assets/pottery/pottery-05.jpg', alt: 'A white clay house with purple trim' },
        { src: 'assets/pottery/pottery-06.jpg', alt: 'A white clay corner with a window and steps' },
        { src: 'assets/pottery/pottery-07.jpg', alt: 'Two curving black candle holders' },
        { src: 'assets/pottery/pottery-08.jpg', alt: 'A bowl glazed half blue, half cream' },
        { src: 'assets/pottery/pottery-09.jpg', alt: 'Soneri at the wheel, with a clay mug in front' },
        { src: 'assets/pottery/pottery-10.jpg', alt: 'The two of us at a pottery class' },
      ],
    },
  },
  basketballDate: {
    src: 'assets/art/basketball-date.webp',
    peopleSize: 1.15, // so the two of us come out the same size as in the coffee date
    ratio: '1015 / 775',
    tint: true,
    note: 'The two of us playing basketball',
    nugget: {
      heading: 'fun fact',
      // (non-breaking hyphens keep “p-i-g” on one line)
      text: 'soneri has beaten akhil in p\u2011i\u2011g 3 times!',
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
    src: 'assets/art/indian-outfit-v3.webp',
    ratio: '626 / 1124',
    // His safa (turban) makes this drawing taller than the couple: shown a
    // little taller (1124 / 1104), so the two of us come out the same size as
    // at the other events.
    peopleSize: 1.018,
    tint: true,
    note: 'The two of us dressed for the Indian wedding, in flower garlands (him in a safa)',
  },
  'event-reception': {
    src: 'assets/art/reception-outfit.webp',
    ratio: '561 / 1140',
    tint: true,
    note: 'The two of us dressed for the reception, raising a toast',
  },
  poolDate: {
    src: 'assets/art/pool-date-v2.webp', // (dash eyes for both of us)
    peopleSize: 1.06, // so the two of us come out the same size as in the coffee date
    ratio: '1171 / 800',
    tint: true,
    note: 'The two of us playing pool',
    nugget: {
      heading: 'date night',
      text: 'one of our most frequented date night activities is playing a game of pool!',
    },
  },
  hikingDate: {
    src: 'assets/art/hiking-date.webp',
    peopleSize: 1.09, // so the two of us come out the same size as in the coffee date
    ratio: '799 / 1104',
    tint: true,
    note: 'The two of us out on a hike',
    nugget: {
      heading: 'national parks we’ve explored',
      // Just each park's name. No links yet: an empty href shows the name
      // as plain text.
      links: [
        { label: 'Zion', href: '' },
        { label: 'Bryce Canyon', href: '' },
        { label: 'Joshua Tree', href: '' },
        { label: 'Yosemite', href: '' },
        { label: 'Patagonia', href: '' },
        { label: 'Rocky Mountain', href: '' },
        { label: 'Acadia', href: '' },
        { label: 'Olympic', href: '' },
        { label: 'Redwood', href: '' },
        { label: 'Manuel Antonio', href: '' },
      ],
    },
  },

}

export default art
