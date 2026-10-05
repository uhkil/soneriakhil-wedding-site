// The Home hero choreography.
//
// Everything is built with the browser's built-in Web Animations API
// (element.animate), so there's no extra library. All moments are listed
// in TIMING below, in milliseconds from the start. Change a number here to
// retime that moment.
//
// Positions are measured from the stage's left edge (x) and up from the
// ground line (y), in screen pixels. "s" converts the artwork's own pixels
// into screen pixels, so the whole scene scales with the screen size.

export const TIMING = {
  watchCheck: 1100,   // Akhil glances at his watch (still spinning the ball)
  soneriEnters: 1500, // Soneri runs in from the right
  soneriReaches: 2450, // Soneri reaches out as she passes in front of him
  grab: 2800,         // hands meet; Akhil is pulled into a run, ball drops
  bounce: [400, 420, 280, 180], // ball: fall, then three shrinking bounces
  exit: 4200,         // both are fully offscreen to the left
  headlineStart: 3000, // "Let's Celebrate!" slides out from behind Akhil
  headlineEnd: 4700,
  ballFade: 280,      // ball fades after its last bounce
  hearts: 4150,       // hearts start rising from where the ball rested
  total: 6000,
}

// The hearts: sideways drift, how high they float (share of the stage
// height; above 1 reaches up toward the nav), timing, spin, and size.
const HEARTS = [
  { dx: -70, rise: 0.95, delay: 0, duration: 1450, spin: -18, size: 34, img: 0 },
  { dx: 30, rise: 1.15, delay: 120, duration: 1650, spin: 14, size: 28, img: 1 },
  { dx: 95, rise: 0.75, delay: 60, duration: 1250, spin: 22, size: 24, img: 2 },
  { dx: -25, rise: 0.6, delay: 220, duration: 1100, spin: -10, size: 20, img: 0 },
  { dx: 60, rise: 1.3, delay: 260, duration: 1550, spin: -24, size: 30, img: 1 },
  { dx: -105, rise: 0.8, delay: 180, duration: 1350, spin: 12, size: 22, img: 2 },
]

export const HEART_COUNT = HEARTS.length

// Shows an element only between two moments (it's hidden otherwise).
function showDuring(el, start, end) {
  return el.animate([{ opacity: 1 }, { opacity: 1 }], {
    delay: start,
    duration: Math.max(end - start, 1),
  })
}

// Alternates between running frames every "interval" ms (a simple run cycle).
function runCycle(frames, start, end, interval = 130) {
  const anims = []
  let i = 0
  for (let t = start; t < end; t += interval) {
    anims.push(showDuring(frames[i % frames.length], t, Math.min(t + interval, end)))
    i++
  }
  return anims
}

// A small up-and-down bob while running.
function bob(el, start, end, height) {
  return el.animate(
    [{ translate: '0 0' }, { translate: `0 ${-height}px` }, { translate: '0 0' }],
    { delay: start, duration: 260, iterations: (end - start) / 260 }
  )
}

// Builds and starts the whole animation. "el" holds the page elements;
// "art" is src/data/heroArt.js. Returns the running animations.
export function playHero(el, art) {
  const t = TIMING
  const T = t.total
  const at = (ms) => ms / T // turns a moment into a 0–1 keyframe "offset"

  // ----- Measure the stage and pick a scale -----
  const W = el.stage.clientWidth
  const H = el.stage.clientHeight
  const isPhone = W < 640
  // Characters are a bit larger, relative to the screen, on phones.
  const akhilHeight = Math.min(H * 0.78, W * (isPhone ? 0.6 : 0.3))
  const s = akhilHeight / art.akhil.wait.h
  const ss = s * art.soneri.scale
  el.stage.style.setProperty('--s', s)
  el.stage.style.setProperty('--ss', ss)

  // ----- Key positions -----
  const { wait, watch, follow } = art.akhil
  const akhilStart = W * (isPhone ? 0.6 : 0.4) // center-left (centered-ish on phones)
  const akhilEnd = -(follow.w - follow.anchorX) * s - 30 // just past the left edge
  const soneriStart = W + 140 * ss // just past the right edge
  const soneriGrab = akhilStart - art.leadGap * s // ahead of Akhil, hand in hand
  const soneriEnd = soneriGrab + (akhilEnd - akhilStart)
  const runEasing = 'cubic-bezier(0.45, 0, 0.85, 0.6)' // starts gently, speeds up

  const anims = []

  // ----- Akhil: stand, check watch, get pulled offscreen -----
  anims.push(
    el.akhil.animate(
      [
        { transform: `translateX(${akhilStart}px)`, offset: 0 },
        { transform: `translateX(${akhilStart}px)`, offset: at(t.grab), easing: runEasing },
        { transform: `translateX(${akhilEnd}px)`, offset: at(t.exit) },
        { transform: `translateX(${akhilEnd}px)`, offset: 1 },
      ],
      { duration: T, fill: 'both' }
    )
  )
  anims.push(showDuring(el.akhilFrames.wait, 0, t.watchCheck))
  anims.push(showDuring(el.akhilFrames.watch, t.watchCheck, t.grab))
  anims.push(showDuring(el.akhilFrames.follow, t.grab, t.exit + 100))
  anims.push(showDuring(el.handLink, t.grab, t.exit + 100))
  anims.push(bob(el.akhilBody, t.grab, t.exit, 6 * s))

  // ----- Soneri: run in from the right, pass in front, lead him off -----
  anims.push(
    el.soneri.animate(
      [
        { transform: `translateX(${soneriStart}px)`, offset: 0 },
        { transform: `translateX(${soneriStart}px)`, offset: at(t.soneriEnters) },
        { transform: `translateX(${soneriGrab}px)`, offset: at(t.grab), easing: runEasing },
        { transform: `translateX(${soneriEnd}px)`, offset: at(t.exit) },
        { transform: `translateX(${soneriEnd}px)`, offset: 1 },
      ],
      { duration: T, fill: 'both' }
    )
  )
  // While crossing, she's drawn in front of Akhil; after the grab, behind his hand.
  anims.push(el.soneri.animate([{ zIndex: 3 }, { zIndex: 3 }], { delay: t.soneriEnters, duration: t.grab - t.soneriEnters }))
  anims.push(...runCycle([el.soneriFrames.run1, el.soneriFrames.run2], t.soneriEnters, t.soneriReaches))
  anims.push(showDuring(el.soneriFrames.cross, t.soneriReaches, t.grab))
  anims.push(...runCycle([el.soneriFrames.lead1, el.soneriFrames.lead2], t.grab, t.exit + 100))
  anims.push(bob(el.soneriBody, t.soneriEnters, t.exit, 5 * ss))

  // ----- Basketball: spins on his finger, drops, bounces 3 times, fades -----
  const r = (art.ball.diameter / 2) * s
  // Where the ball's center sits on his fingertip, for each pose.
  const fingerPos = (pose) => ({
    x: akhilStart + (pose.finger.x - pose.anchorX) * s,
    y: (pose.h - pose.finger.y) * s + r * 0.85,
  })
  const onWait = fingerPos(wait)
  const onWatch = fingerPos(watch)
  const restX = onWatch.x - 40 * s // drifts a little as it bounces
  const ballAt = (x, y) => `translate(${x}px, ${-y}px)`
  const [fall, b1, b2, b3] = t.bounce
  const land1 = t.grab + fall
  const land2 = land1 + b1
  const land3 = land2 + b2
  const land4 = land3 + b3
  const drift = (ms) => onWatch.x + (restX - onWatch.x) * ((ms - t.grab) / (land4 - t.grab))
  const up = 'cubic-bezier(0.2, 0.6, 0.4, 1)' // slows near the top
  const down = 'cubic-bezier(0.6, 0, 0.8, 0.4)' // speeds up falling
  anims.push(
    el.ball.animate(
      [
        { transform: ballAt(onWait.x, onWait.y), offset: 0 },
        { transform: ballAt(onWait.x, onWait.y), offset: at(t.watchCheck - 1) },
        { transform: ballAt(onWatch.x, onWatch.y), offset: at(t.watchCheck) },
        { transform: ballAt(onWatch.x, onWatch.y), offset: at(t.grab), easing: down },
        { transform: ballAt(drift(land1), r), offset: at(land1), easing: up },
        { transform: ballAt(drift(land1 + b1 / 2), r + onWatch.y * 0.4), offset: at(land1 + b1 / 2), easing: down },
        { transform: ballAt(drift(land2), r), offset: at(land2), easing: up },
        { transform: ballAt(drift(land2 + b2 / 2), r + onWatch.y * 0.16), offset: at(land2 + b2 / 2), easing: down },
        { transform: ballAt(drift(land3), r), offset: at(land3), easing: up },
        { transform: ballAt(drift(land3 + b3 / 2), r + onWatch.y * 0.06), offset: at(land3 + b3 / 2), easing: down },
        { transform: ballAt(restX, r), offset: at(land4) },
        { transform: ballAt(restX, r), offset: 1 },
      ],
      { duration: T, fill: 'both' }
    )
  )
  // Visible from the start until it fades (shrinking slightly) after the last bounce.
  anims.push(
    el.ball.animate(
      [
        { opacity: 1, scale: 1, offset: 0 },
        { opacity: 1, scale: 1, offset: at(land4) },
        { opacity: 0, scale: 0.6, offset: at(land4 + t.ballFade) },
        { opacity: 0, scale: 0.6, offset: 1 },
      ],
      { duration: T, fill: 'both' }
    )
  )
  // Spin: fast on his finger, then a slower roll as it bounces away.
  const spinTurns = t.grab / 420
  anims.push(
    el.ballImg.animate(
      [
        { rotate: '0deg', offset: 0 },
        { rotate: `${spinTurns * 360}deg`, offset: at(t.grab), easing: 'ease-out' },
        { rotate: `${spinTurns * 360 - 400}deg`, offset: at(land4) },
        { rotate: `${spinTurns * 360 - 400}deg`, offset: 1 },
      ],
      { duration: T, fill: 'both' }
    )
  )

  // ----- Hearts: float up from where the ball rested -----
  HEARTS.forEach((h, i) => {
    const x0 = restX
    const y0 = r
    const rise = H * h.rise
    anims.push(
      el.hearts[i].animate(
        [
          { transform: `translate(${x0}px, ${-y0}px) scale(0.4) rotate(0deg)`, opacity: 0 },
          { transform: `translate(${x0 + h.dx * 0.15}px, ${-(y0 + rise * 0.12)}px) scale(1) rotate(${h.spin * 0.3}deg)`, opacity: 1, offset: 0.15 },
          { transform: `translate(${x0 + h.dx * 0.75 + 12}px, ${-(y0 + rise * 0.65)}px) scale(1) rotate(${h.spin * 0.7}deg)`, opacity: 0.9, offset: 0.65 },
          { transform: `translate(${x0 + h.dx}px, ${-(y0 + rise)}px) scale(0.9) rotate(${h.spin}deg)`, opacity: 0 },
        ],
        { delay: t.hearts + h.delay, duration: h.duration, easing: 'ease-out' }
      )
    )
    el.hearts[i].style.width = `${h.size * s}px`
    el.hearts[i].style.marginLeft = `${(-h.size * s) / 2}px`
  })

  // ----- "Let's Celebrate!": slides out from behind Akhil and settles centered -----
  const stageBox = el.stage.getBoundingClientRect()
  const finalLeft = el.headline.getBoundingClientRect().left - stageBox.left
  const startLeft = akhilStart + 40 * s // just behind (to the right of) his back
  const shift = Math.max(startLeft - finalLeft, 40)
  anims.push(
    el.headline.animate(
      [
        { transform: `translateX(${shift}px)`, opacity: 0 },
        { opacity: 1, offset: 0.3 },
        { transform: 'translateX(0)', opacity: 1 },
      ],
      {
        delay: t.headlineStart,
        duration: t.headlineEnd - t.headlineStart,
        easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)',
        fill: 'backwards', // stays hidden until its moment
      }
    )
  )

  // A timer that marks the end of the whole sequence.
  anims.push(el.stage.animate([{}, {}], { duration: T }))

  return anims
}
