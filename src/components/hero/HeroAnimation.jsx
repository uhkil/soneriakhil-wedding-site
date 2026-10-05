// The animated scene at the top of Home: Akhil spins a basketball and waits,
// Soneri runs in, takes his hand, and leads him off; the ball bounces into
// hearts and "Let's Celebrate!" settles in the middle.
//
// - Plays once each time the page loads, then shows a small replay button.
// - People with "reduce motion" turned on see the finished scene instead.
// - The choreography lives in heroTimeline.js; the artwork in src/data/heroArt.js.
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import heroArt from '../../data/heroArt.js'
import { playHero, HEART_COUNT } from './heroTimeline.js'
import HandLink from './HandLink.jsx'

// One character image. Its size and position come from the art's own
// measurements, scaled by --s (Akhil) or --ss (Soneri), set by the timeline.
function Frame({ frame, scaleVar, frameRef }) {
  return (
    <img
      ref={frameRef}
      className="hero-frame"
      src={import.meta.env.BASE_URL + frame.src}
      alt=""
      style={{
        width: `calc(var(${scaleVar}) * ${frame.w}px)`,
        left: `calc(var(${scaleVar}) * ${-frame.anchorX}px)`,
      }}
    />
  )
}

export default function HeroAnimation() {
  // useRef gives us handles on page elements without causing re-renders.
  const stage = useRef(null)
  const akhil = useRef(null)
  const akhilBody = useRef(null)
  const soneri = useRef(null)
  const soneriBody = useRef(null)
  const ball = useRef(null)
  const ballImg = useRef(null)
  const headline = useRef(null)
  const handLink = useRef(null)
  const akhilFrames = useRef({})
  const soneriFrames = useRef({})
  const hearts = useRef([])
  const running = useRef([])

  // Whether the animation has finished (shows the replay button).
  const [finished, setFinished] = useState(false)

  const stop = () => {
    running.current.forEach((a) => a.cancel())
    running.current = []
  }

  const play = useCallback(() => {
    stop()
    setFinished(false)
    // Respect the device's "reduce motion" setting: keep the still, final scene.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const anims = playHero(
      {
        stage: stage.current,
        akhil: akhil.current,
        akhilBody: akhilBody.current,
        soneri: soneri.current,
        soneriBody: soneriBody.current,
        ball: ball.current,
        ballImg: ballImg.current,
        headline: headline.current,
        handLink: handLink.current,
        akhilFrames: akhilFrames.current,
        soneriFrames: soneriFrames.current,
        hearts: hearts.current,
      },
      heroArt
    )
    running.current = anims
    // When every animation is done, show the replay button.
    // (If they're cancelled by a replay, this simply never fires.)
    Promise.all(anims.map((a) => a.finished))
      .then(() => setFinished(true))
      .catch(() => {})
  }, [])

  // useLayoutEffect starts the animation before the first paint,
  // so the finished scene never flashes on screen first.
  useLayoutEffect(() => {
    play()
    return stop
  }, [play])

  const { akhil: a, soneri: so } = heroArt

  return (
    <div className="hero-stage" ref={stage}>
      {/* The headline is real text, so it reads correctly everywhere. */}
      <div className="hero-headline-wrap">
        <p className="hero-headline" ref={headline}>
          Let’s Celebrate!
        </p>
      </div>

      {/* Characters and props are decorative: screen readers skip them. */}
      <div className="hero-actor" ref={akhil} style={{ zIndex: 2 }} aria-hidden="true">
        <div className="hero-body" ref={akhilBody}>
          <HandLink linkRef={handLink} />
          <Frame frame={a.wait} scaleVar="--s" frameRef={(n) => (akhilFrames.current.wait = n)} />
          <Frame frame={a.watch} scaleVar="--s" frameRef={(n) => (akhilFrames.current.watch = n)} />
          <Frame frame={a.follow} scaleVar="--s" frameRef={(n) => (akhilFrames.current.follow = n)} />
        </div>
      </div>

      <div className="hero-actor" ref={soneri} style={{ zIndex: 1 }} aria-hidden="true">
        <div className="hero-body" ref={soneriBody}>
          {['run1', 'run2', 'cross', 'lead1', 'lead2'].map((name) => (
            <Frame
              key={name}
              frame={so[name]}
              scaleVar="--ss"
              frameRef={(n) => (soneriFrames.current[name] = n)}
            />
          ))}
        </div>
      </div>

      <div className="hero-ball" ref={ball} aria-hidden="true">
        <img ref={ballImg} src={import.meta.env.BASE_URL + heroArt.ball.src} alt="" />
      </div>

      {Array.from({ length: HEART_COUNT }, (_, i) => (
        <img
          key={i}
          ref={(n) => (hearts.current[i] = n)}
          className="hero-heart"
          src={import.meta.env.BASE_URL + heroArt.hearts[i % heroArt.hearts.length]}
          alt=""
          aria-hidden="true"
        />
      ))}

      <button
        className="hero-replay"
        hidden={!finished}
        onClick={play}
        aria-label="Replay the opening animation"
      >
        ↻ replay
      </button>
    </div>
  )
}
