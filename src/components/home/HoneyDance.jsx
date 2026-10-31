// The Home picture for the House of Honey design: Soneri and Akhil, drawn in
// navy, dancing a few steps, then turning to wave hello. When the last wave
// lands, each says hello in a speech bubble.
//
// The six frames are vector drawings (public/assets/hero-honey/). They were
// prepared so they match: cropped to the same window around the couple,
// frames 5 and 6 nudged so their heads and feet line up with the dancing
// frames, and every light area (skin, eyes, highlights) made see-through, so
// the page's blue shows through in every frame.
import { useFrameSequence } from './useFrameSequence.js'

const base = import.meta.env.BASE_URL + 'assets/hero-honey/'
const SOURCES = Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [`frame-${n}`, `${base}frame-${n}.svg`]))

// [frame, how long it stays up (ms), how long it fades in over the last one (ms)].
// The dance steps are quick; the turn and the wave are a little slower.
// Edit these to change the pacing.
const SEQUENCE = [
  ['frame-1', 420, 140], // dancing
  ['frame-2', 420, 140], // stepping out
  ['frame-3', 460, 140], // the big step
  ['frame-2', 420, 140], // stepping back
  ['frame-1', 440, 140],
  // From here the poses change more, so the fades are short: a long fade
  // would briefly show both poses at once.
  ['frame-4', 520, 100], // a close moment
  ['frame-5', 480, 80], // turning toward you
  ['frame-6', 380, 70], // waving
  ['frame-5', 340, 70],
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
              <img
                key={name}
                src={src}
                alt=""
                className={state}
                style={{ '--fade': `${fade}ms` }}
                draggable="false"
              />
            )
          })}
        </div>

        {/* Real text, so it's crisp and read by screen readers. Soneri is on
            the left, Akhil on the right. */}
        <p className="honey-bubble honey-bubble-her">We’re excited to celebrate with you</p>
        <p className="honey-bubble honey-bubble-him">Welcome to our wedding website</p>
      </div>
    </div>
  )
}
