// Plays a frame-by-frame animation: shows one picture at a time, in order,
// each for its own length of time, then stops on the last one.
// Shared by the hero animations (Cream and House of Honey).
//
//   sources   — every frame's file, by name: { 'frame-1': '/…/frame-1.svg', … }
//   sequence  — [name, how long it stays up (ms), how long it fades in (ms)], in order
//   talkAt    — the step (0 = first) at which the speech bubbles appear
//
// Returns:
//   frame     — the frame showing now
//   previous  — the frame underneath, while the new one fades in over it (or null)
//   fade      — how long the current frame's fade-in lasts (ms)
//   talking   — true once the speech bubbles should show
//
// With "reduce motion" on, it jumps straight to the last frame, bubbles showing.
import { useEffect, useState } from 'react'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useFrameSequence(sources, sequence, talkAt) {
  const [stillOnly] = useState(prefersReducedMotion)
  const lastFrame = sequence[sequence.length - 1][0]
  const [frame, setFrame] = useState(stillOnly ? lastFrame : sequence[0][0])
  const [previous, setPrevious] = useState(null)
  const [fade, setFade] = useState(sequence[0][2])
  const [talking, setTalking] = useState(stillOnly)

  useEffect(() => {
    if (stillOnly) return

    let cancelled = false
    const timers = []

    // Load every frame before starting, so nothing flickers mid-animation.
    const loads = Object.values(sources).map((src) => {
      const img = new Image()
      img.src = src
      return img.decode().catch(() => {}) // if one fails, play anyway
    })

    Promise.all(loads).then(() => {
      let elapsed = 0
      let shown = sequence[0][0]
      sequence.forEach(([name, duration, fadeMs], i) => {
        if (i > 0) {
          timers.push(
            setTimeout(() => {
              if (cancelled) return
              setPrevious(shown)
              setFade(fadeMs)
              setFrame(name)
              shown = name
              if (i === talkAt) setTalking(true)
            }, elapsed)
          )
        }
        elapsed += duration
      })
    })

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [stillOnly, sources, sequence, talkAt])

  // Once the new frame has faded in, hide the old one underneath.
  useEffect(() => {
    if (previous === null) return
    const t = setTimeout(() => setPrevious(null), fade + 20)
    return () => clearTimeout(t)
  }, [previous, frame, fade])

  return { frame, previous, fade, talking }
}
