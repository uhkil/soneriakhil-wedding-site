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
import { useEffect, useRef, useState } from 'react'
import { useFrameSequence } from './useFrameSequence.js'

function frameFiles(folder, count, version) {
  const base = import.meta.env.BASE_URL + `assets/${folder}/`
  return Object.fromEntries(
    Array.from({ length: count }, (_, i) => [`frame-${i + 1}`, `${base}frame-${i + 1}.svg?v=${version}`])
  )
}

// Each version: its frames, and the order to play them in.
// Sequence steps are [frame, how long it stays up (ms), how long it fades in
// over the last one (ms), and optionally a blur (px)]. Edit these to change
// the pacing. The blur briefly softens the picture during that change, which
// makes a big jump in pose (arms moving somewhere new) read as quick movement
// instead of a glitch.
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
    sources: frameFiles('hero-honey-2', 7, 3),
    // The dissolves are fairly long (see .honey-frames in index.css): the new
    // pose fades in over the first half, the old one fades out over the second,
    // so moving limbs blend instead of jumping.
    sequence: [
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
    ],
  },
}

export default function HoneyDance({ version = 2 }) {
  // Each replay remounts the animation, so it starts again from frame 1.
  const [runs, setRuns] = useState(0)
  return <Dance key={runs} version={version} onReplay={() => setRuns((n) => n + 1)} />
}

function Dance({ version, onReplay }) {
  const { sources, sequence } = VERSIONS[version] ?? VERSIONS[2]
  const talkAt = sequence.length - 1 // the bubbles appear with the last frame
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
    <div className={`honey-stage-wrap honey-hero-${version}`}>
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

      {/* Once the animation has finished: shows in the bottom-right corner
          while the pointer is over this area (always, on touch screens). */}
      {!stillOnly && talking && (
        <button type="button" className="honey-replay" aria-label="Play the animation again" onClick={onReplay}>
          <svg className="honey-replay-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 12a8 8 0 1 1-2.34-5.66" />
            <path d="M20 4v5h-5" />
          </svg>
          <span className="honey-replay-label" aria-hidden="true">play again</span>
        </button>
      )}
    </div>
  )
}
