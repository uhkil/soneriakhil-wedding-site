// What Soneri and Akhil say in the Home page's speech bubbles to the guest
// who's logged in. Written in the Guests tab of the Sheet (soneri_bubble and
// akhil_bubble columns); blank = the usual words below.
//
// Each bubble is two lines (on phones, one line each; wider screens join
// them). Where it breaks: a "/" or a new line in the cell, else near the
// middle. Smileys like ":-)" stay on the line with the word before them.

export const USUAL = {
  soneri: ['we’re excited to', 'celebrate with you :-)'],
  akhil: ['welcome to our', 'wedding website!'],
}

// Longer than this on one line and it might not fit a small phone side by
// side, so that bubble is allowed to wrap instead (see .bubble-long).
const LONGEST_LINE = 22

// "so glad you’re / coming, auntie!" → ['so glad you’re', 'coming, auntie!']
function twoLines(text) {
  const clean = String(text || '').trim()
  if (!clean) return null
  const marked = clean.split(/\s*(?:\n|\s\/\s|\/)\s*/).filter(Boolean)
  if (marked.length > 1) return [marked[0], marked.slice(1).join(' ')]
  // No break chosen: the space nearest the middle.
  const middle = clean.length / 2
  let best = -1
  for (let i = clean.indexOf(' '); i !== -1; i = clean.indexOf(' ', i + 1)) {
    if (best === -1 || Math.abs(i - middle) < Math.abs(best - middle)) best = i
  }
  return best === -1 ? [clean, ''] : [clean.slice(0, best), clean.slice(best + 1)]
}

// Keeps a smiley with the word before it (a space that never breaks), and
// its "-" from breaking too: "you :-)" never splits.
const keepSmileys = (line) => line.replace(/ (?=(?::|;)-?[)(DP]|<3)/g, ' ').replace(/([:;])-/g, '$1‑')

// The two bubbles for this guest: { soneri: [line1, line2, long?], akhil: [...] }.
// Uses the row of whoever logged in; if their cell is blank, another row of
// the household that has one; else the usual words.
export function bubblesFor(party, guestId) {
  const rows = party?.bubbles || {}
  const pick = (who) => {
    const own = rows[guestId]?.[who]
    const other = Object.values(rows).find((b) => b[who])?.[who]
    const lines = twoLines(own || other) || USUAL[who]
    return { lines: lines.map(keepSmileys), long: lines.some((l) => l.length > LONGEST_LINE) }
  }
  return { soneri: pick('soneri'), akhil: pick('akhil') }
}
