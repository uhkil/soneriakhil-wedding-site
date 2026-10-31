// The Home picture for the House of Honey design: Soneri and Akhil, drawn in
// navy, dancing a few steps, then turning to wave hello. When the last wave
// lands, each says hello in a speech bubble.
//
// The six frames are vector drawings (public/assets/hero-honey/). They were
// prepared so they match: cropped to the same window around the couple,
// frames 5 and 6 nudged so their heads and feet line up with the dancing
// frames, and every light area (skin, eyes, highlights) made see-through, so
// the page's blue shows through in every frame. Frame 6 is frame 5 with only
// the waving arm swapped in, so nothing but the arm moves during the wave.
// The couple is drawn in the page's text color (--ink in index.css): each
// frame's shape is filled with that color, so they always match the text.
import { useFrameSequence } from './useFrameSequence.js'

const base = import.meta.env.BASE_URL + 'assets/hero-honey/'
// Bump VERSION whenever the frame files change, so browsers fetch the new
// ones instead of reusing old saved copies.
const VERSION = 3
const SOURCES = Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [`frame-${n}`, `${base}frame-${n}.svg?v=${VERSION}`]))

// [frame, how long it stays up (ms), how long it fades in over the last one (ms)].
// The dance steps are quick; the turn and the wave are a little slower.
// Edit these to change the pacing.
const SEQUENCE = [
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
]
const TALK_AT = SEQUENCE.length - 1 // the bubbles appear with the last wave

export default function HoneyDance() {
  const { frame, previous, fade, talking } = useFrameSequence(SOURCES, SEQUENCE, TALK_AT)

  return (
    <div className="honey-stage-wrap">
      <div className={talking ? 'honey-stage talking' : 'honey-stage'}>
        <div
          className="honey-frames"
          role="img"
          aria-label="An illustration of Soneri and Akhil dancing, then turning to wave hello"
        >
          {Object.entries(SOURCES).map(([name, src]) => {
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
