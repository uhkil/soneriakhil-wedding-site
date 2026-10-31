// The Home picture for the "Cream" design: Soneri and Akhil, drawn as a short
// frame-by-frame animation.
//   1. They dance: swaying through frames 1–3, then leaning in (frame 4).
//   2. They turn toward you: frames 5, 6, 7.
//   3. They wave: frames 8 and 9 (back and forth), stopping on frame 9.
// As the wave starts, two speech bubbles fade in, one from each of them.
//
// All the frames are the same size with the couple in the same spot, so
// they're simply stacked on top of each other and shown one at a time.
// The frames are see-through around the couple, so any background works.
// With "reduce motion" on, guests see only frame 9, with both bubbles.
//
// To make it smoother, the frames in public/assets/hero-dance/ were prepared:
//   - Anything that shouldn't move (her skirt, their legs when still...) is
//     copied exactly from frame 1, so redrawn texture doesn't flicker.
//   - "tween-…" frames are blends between two close poses (1 and 3, 3 and 2,
//     8 and 9), so the sway and the wave move in smaller steps.
import { useFrameSequence } from './useFrameSequence.js'

const base = import.meta.env.BASE_URL + 'assets/hero-dance/'
const NAMES = [
  'frame-1', 'frame-2', 'frame-3', 'frame-4', 'frame-5', 'frame-6', 'frame-7', 'frame-8', 'frame-9',
  'tween-1-3-a', 'tween-1-3-b', 'tween-3-2-a', 'tween-3-2-b', 'tween-8-9-a', 'tween-8-9-b',
]
const SOURCES = Object.fromEntries(NAMES.map((name) => [name, `${base}${name}.webp`]))

// The order the frames play in: [frame, how long it stays up (ms), how long
// it takes to fade in over the last one (ms)]. Edit these to change the pacing.
// Main poses stay up a little longer; in-between frames pass quickly.
const KEY = 260 // a main pose
const STEP = 80 // an in-between frame
const QUICK = 50 // fade for small steps

// One sway: 1 → 3 → 2 → 3 → back toward 1, through the in-betweens.
const SWAY = [
  ['frame-1', KEY, QUICK],
  ['tween-1-3-a', STEP, QUICK],
  ['tween-1-3-b', STEP, QUICK],
  ['frame-3', KEY, QUICK],
  ['tween-3-2-a', STEP, QUICK],
  ['tween-3-2-b', STEP, QUICK],
  ['frame-2', KEY, QUICK],
  ['tween-3-2-b', STEP, QUICK],
  ['tween-3-2-a', STEP, QUICK],
  ['frame-3', KEY, QUICK],
  ['tween-1-3-b', STEP, QUICK],
  ['tween-1-3-a', STEP, QUICK],
]

// One wave: 8 → 9 → back toward 8, through the in-betweens.
const WAVE = [
  ['frame-8', 200, QUICK],
  ['tween-8-9-a', 70, QUICK],
  ['tween-8-9-b', 70, QUICK],
  ['frame-9', 200, QUICK],
  ['tween-8-9-b', 70, QUICK],
  ['tween-8-9-a', 70, QUICK],
]

const SEQUENCE = [
  ...SWAY,
  ...SWAY,
  ['frame-1', 360, QUICK],
  // The bigger moves can't be blended cleanly, so they fade in slowly instead.
  ['frame-4', 1100, 420], // leaning in
  ['frame-5', 380, 360], // turning toward you
  ['frame-6', 340, 200],
  ['frame-7', 420, 260],
  ['frame-8', 200, 280], // the wave starts (the bubbles appear here)
  ...WAVE.slice(1),
  ...WAVE,
  ...WAVE.slice(0, 3),
  ['frame-9', 0, QUICK], // stop here
]
// The bubbles appear as the wave starts: the first time frame 8 shows.
const TALK_AT = SEQUENCE.findIndex(([name]) => name === 'frame-8')

export default function HeroDance() {
  const { frame, previous, fade, talking } = useFrameSequence(SOURCES, SEQUENCE, TALK_AT)

  return (
    <div className={talking ? 'hero-dance talking' : 'hero-dance'}>
      <div
        className="hero-dance-frames"
        role="img"
        aria-label="An illustration of Soneri and Akhil dancing, then turning to wave hello"
      >
        {NAMES.map((name) => {
          const state = name === frame ? 'current' : name === previous ? 'previous' : ''
          return (
            <img
              key={name}
              src={SOURCES[name]}
              alt=""
              className={state}
              style={{ '--fade': `${fade}ms` }}
              draggable="false"
            />
          )
        })}
      </div>

      {/* Real text, so it's crisp, translatable, and read by screen readers. */}
      <p className="hero-bubble hero-bubble-him">Welcome to our wedding website</p>
      <p className="hero-bubble hero-bubble-her">We’re excited to celebrate with you</p>
    </div>
  )
}
