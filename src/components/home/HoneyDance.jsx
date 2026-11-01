// The Home picture for the House of Honey design: Soneri and Akhil, drawn in
// navy, dancing a few steps, then turning to wave hello. When the last frame
// lands, each says hello in a speech bubble.
//
// There are two versions to choose between (the preview switch in the corner
// flips them; see useHoneyHero in design/useDesign.js):
//
//   1 — the first set of six drawings (public/assets/hero-honey/), with
//       outlined chat bubbles.
//   2 — the newer set of seven drawings (public/assets/hero-honey-2/), with
//       filled navy bubbles.
//
// Both sets were prepared so the frames match: cropped to the same window
// around the couple, lined up so their heads and feet don't jump, and every
// light area (skin, eyes, highlights) made see-through, so the page's blue
// shows through. In version 1, frame 6 is frame 5 with only the waving arm
// swapped in. In version 2, frames 5, 6 and 7 share frame 6's faces and body
// and differ only in his arm, and frame 1 borrows frame 2's closed eye, so
// every frame has the same dash-style eyes.
// The couple is drawn in the page's text color (--ink in index.css): each
// frame's shape is filled with that color, so they always match the text.
import { useFrameSequence } from './useFrameSequence.js'

function frameFiles(folder, count, version) {
  const base = import.meta.env.BASE_URL + `assets/${folder}/`
  return Object.fromEntries(
    Array.from({ length: count }, (_, i) => [`frame-${i + 1}`, `${base}frame-${i + 1}.svg?v=${version}`])
  )
}

// Each version: its frames, and the order to play them in.
// Sequence steps are [frame, how long it stays up (ms), how long it fades in
// over the last one (ms)]. Edit these to change the pacing.
// Bump the last number in frameFiles(...) whenever that set's files change, so
// browsers fetch the new ones instead of reusing old saved copies.
const VERSIONS = {
  1: {
    sources: frameFiles('hero-honey', 6, 3),
    sequence: [
      ['frame-1', 560, 160], // dancing
      ['frame-2', 560, 160], // stepping out
      ['frame-3', 620, 160], // the big step
      ['frame-2', 560, 160], // stepping back
      ['frame-1', 600, 160],
      // From here the poses change more, so the fades are short: a long fade
      // would briefly show both poses at once.
      ['frame-4', 720, 100], // a close moment
      ['frame-5', 640, 80], // turning toward you
      ['frame-6', 520, 70], // waving
      ['frame-5', 460, 70],
      ['frame-6', 0, 70], // waving again, and stopping here
    ],
  },
  2: {
    sources: frameFiles('hero-honey-2', 7, 1),
    sequence: [
      ['frame-1', 600, 170], // dancing
      ['frame-2', 580, 170], // stepping out
      ['frame-3', 660, 170], // the big step
      ['frame-2', 580, 170], // stepping back
      ['frame-1', 640, 170],
      // Bigger changes from here, so shorter fades (a long one would show
      // both poses at once).
      ['frame-4', 820, 110], // a close moment, eyes closed
      ['frame-5', 700, 100], // turning toward you, hand coming up
      // Only his arm moves in these, so a slightly softer fade reads as motion.
      ['frame-6', 560, 110], // waving
      ['frame-5', 460, 110],
      ['frame-7', 0, 140], // arm down, settled, and stopping here
    ],
  },
}

export default function HoneyDance({ version = 2 }) {
  const { sources, sequence } = VERSIONS[version] ?? VERSIONS[2]
  const talkAt = sequence.length - 1 // the bubbles appear with the last frame
  const { frame, previous, fade, talking } = useFrameSequence(sources, sequence, talkAt)

  return (
    <div className={`honey-stage-wrap honey-hero-${version}`}>
      <div className={talking ? 'honey-stage talking' : 'honey-stage'}>
        <div
          className="honey-frames"
          role="img"
          aria-label="An illustration of Soneri and Akhil dancing, then turning to wave hello"
        >
          {Object.entries(sources).map(([name, src]) => {
            const state = name === frame ? 'current' : name === previous ? 'previous' : ''
            return (
              <div
                key={name}
                className={state}
                style={{ '--fade': `${fade}ms`, WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
              />
            )
          })}
        </div>

        {/* Real text, so it's crisp and read by screen readers. Soneri is on
            the left, Akhil on the right. */}
        <p className="honey-bubble honey-bubble-her">we’re excited to celebrate with you :-)</p>
        <p className="honey-bubble honey-bubble-him">welcome to our wedding website!</p>
      </div>
    </div>
  )
}
