// The Home picture: Soneri and Akhil, drawn in navy, dancing a few steps,
// then turning to wave hello. When the last frame lands, each says hello in a
// speech bubble.
//
// The seven drawings (public/assets/hero/, rendered from the SVG masters in
// art-source/hero/) were prepared so the frames match:
// cropped to the same window around the couple, lined up so their heads and
// feet don't jump, and every light area (skin, eyes, highlights) made
// see-through, so the page's blue shows through. Frames 5, 6 and 7 share
// frame 6's faces and body and differ only in his arm, and frame 1 borrows
// frame 2's closed eye, so every frame has the same dash-style eyes.
// The drawings are in the page's dark blue (#003459, the --ink color in
// index.css), as sharp WebP images (SVGs with cut-outs blur on iPhones).
import { useEffect, useRef, useState } from 'react'
import { useFrameSequence } from './useFrameSequence.js'

function frameFiles(folder, count, version) {
  const base = import.meta.env.BASE_URL + `assets/${folder}/`
  return Object.fromEntries(
    Array.from({ length: count }, (_, i) => [`frame-${i + 1}`, `${base}frame-${i + 1}.webp?v=${version}`])
  )
}

// The frames, and the order to play them in.
// Sequence steps are [frame, how long it stays up (ms), how long it fades in
// over the last one (ms), and optionally a blur (px)]. Edit these to change
// the pacing. The blur briefly softens the picture during that change, which
// makes a big jump in pose (arms moving somewhere new) read as quick movement
// instead of a glitch.
// Bump the last number in frameFiles(...) whenever the files change, so
// browsers fetch the new ones instead of reusing old saved copies.
const SOURCES = frameFiles('hero', 7, 6)

// The dissolves are fairly long (see .honey-frames in index.css): the new
// pose fades in over the first half, the old one fades out over the second,
// so moving limbs blend instead of jumping.
const SEQUENCE = [
  ['frame-1', 640, 280], // dancing
  ['frame-2', 620, 280], // stepping out
  ['frame-3', 700, 280], // the big step
  ['frame-2', 620, 280], // stepping back
  ['frame-1', 680, 280],
  ['frame-4', 880, 300, 1.2], // a close moment, eyes closed
  ['frame-5', 760, 360, 2], // turning toward you, hand coming up (the biggest change)
  ['frame-6', 620, 220], // waving (only his arm moves in these)
  ['frame-5', 520, 220],
  ['frame-7', 0, 260], // arm down, settled, and stopping here
]

export default function HoneyDance() {
  // Each replay remounts the animation, so it starts again from frame 1.
  const [runs, setRuns] = useState(0)
  return <Dance key={runs} onReplay={() => setRuns((n) => n + 1)} />
}

function Dance({ onReplay }) {
  const sources = SOURCES
  const sequence = SEQUENCE
  // The bubbles appear with the second wave, just before the last frame.
  const talkAt = sequence.length - 2
  const { frame, previous, fade, talking, step } = useFrameSequence(sources, sequence, talkAt)
  const framesRef = useRef(null)

  // A quick blur that rises and falls during the change, for steps that ask for one.
  useEffect(() => {
    const blur = sequence[step][3]
    if (!blur || step === 0) return
    const fx = framesRef.current?.animate(
      [{ filter: 'blur(0px)' }, { filter: `blur(${blur}px)` }, { filter: 'blur(0px)' }],
      { duration: sequence[step][2], easing: 'ease-in-out' }
    )
    return () => fx?.cancel()
  }, [step, sequence])
  // With "reduce motion" on, there's only the still picture, so nothing to replay.
  const [stillOnly] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  return (
    <div className="honey-stage-wrap">
      <div className={talking ? 'honey-stage talking' : 'honey-stage'}>
        <div
          ref={framesRef}
          className="honey-frames"
          role="img"
          aria-label="An illustration of Soneri and Akhil dancing, then turning to wave hello"
        >
          {Object.entries(sources).map(([name, src]) => {
            const state = name === frame ? 'current' : name === previous ? 'previous' : ''
            return (
              <img key={name} className={state} src={src} alt="" draggable="false" style={{ '--fade': `${fade}ms` }} />
            )
          })}
        </div>

        {/* Real text, so it's crisp and read by screen readers. Soneri is on
            the left, Akhil on the right. On phones, each "bubble-line" starts
            a second line, so the bubble can hug the words (see index.css). */}
        <p className="honey-bubble honey-bubble-her">
          we’re excited to <span className="bubble-line">celebrate with you{'\u00a0:\u2011)'}</span>
        </p>
        <p className="honey-bubble honey-bubble-him">
          welcome to our <span className="bubble-line">wedding website!</span>
        </p>
      </div>

      {/* A replay (circular arrow) icon, once the animation has finished: shows in the bottom-right corner
          while the pointer is over this area (always, on touch screens). */}
      {!stillOnly && step === sequence.length - 1 && (
        <button type="button" className="honey-replay" aria-label="Play the animation again" onClick={onReplay}>
          <svg className="honey-replay-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 12a8 8 0 1 1-2.34-5.66" />
            <path d="M20 4v5h-5" />
          </svg>
        </button>
      )}
    </div>
  )
}
