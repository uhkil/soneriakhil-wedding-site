// The Home banner for the "Dance floor" design: the date and place, the names,
// then the illustration of the two of them dancing under string lights, then
// the welcome and the RSVP button.
//
// The illustration is cut into layers (public/assets/illustrations/dance/):
// the couple, each friend, the string lights, the confetti, and the floor
// marks. Every layer is the full picture's size, so they line up exactly, and
// each one moves a little on its own (the moves are in index.css, look for
// "dance-"):
//   - the couple sways side to side and bounces on the beat
//   - each friend bobs along, a little out of step with the others
//   - the string lights swing gently; the confetti floats
// The layers are shapes only, colored by the CSS (--cobalt in index.css), so
// changing the blue is a one-line change.

const base = import.meta.env.BASE_URL + 'assets/illustrations/dance/'

// "origin" is the point each layer turns around (its feet), as % of the
// picture's width and height. "delay" (seconds) puts friends out of step;
// "tilt" is which way (and how far) each friend leans.
const LAYERS = [
  { name: 'floor' },
  { name: 'left1', move: 'bob', origin: '9.7% 83%', delay: 0, tilt: 1.2 },
  { name: 'left2', move: 'bob', origin: '16.3% 85%', delay: -0.3, tilt: -1 },
  { name: 'left3', move: 'bob', origin: '26.1% 83%', delay: -0.75, tilt: 1 },
  { name: 'right1', move: 'bob', origin: '74.6% 81%', delay: -0.45, tilt: -1.2 },
  { name: 'right2', move: 'bob', origin: '81.7% 85%', delay: -0.9, tilt: 1 },
  { name: 'right3', move: 'bob', origin: '91.1% 85%', delay: -0.15, tilt: -1 },
  { name: 'couple', move: 'sway', origin: '52.4% 95.5%' },
  { name: 'confetti-a', move: 'float' },
  { name: 'confetti-b', move: 'float', delay: -1.6 },
]

// Where each bulb hangs, as % of the picture's width and height.
const BULBS = [
  [6.3, 14.3], [11.7, 16.8], [17.5, 18.6], [23.7, 18.6], [29.7, 16.5], [35, 13.6], [40.8, 9],
  [48.3, 10.4], [58.3, 17.5], [64.4, 19.7], [71.5, 20.9], [78.8, 20.9], [86.1, 19.1], [93.4, 14.3],
]

// One layer: a cobalt fill cut into that layer's shape.
function Layer({ name, move, origin, delay = 0, tilt = 0 }) {
  const shape = `url(${base}${name}.webp)`
  return (
    <div
      className={move ? `dance-layer dance-${move}` : 'dance-layer'}
      style={{
        WebkitMaskImage: shape,
        maskImage: shape,
        transformOrigin: origin,
        animationDelay: `${delay}s`,
        '--tilt': `${tilt}deg`,
      }}
    />
  )
}

export default function DanceFloorBanner({ welcome }) {
  return (
    <div className="dance">
      <p className="dance-details">
        April 9–10, 2027 <span aria-hidden="true">·</span> Dallas, Texas
      </p>
      <h1 className="dance-names">
        Soneri <span className="dance-and">&amp;</span> Akhil
      </h1>

      <div
        className="dance-art"
        role="img"
        aria-label="An illustration of Soneri and Akhil dancing under string lights, surrounded by friends"
      >
        {/* The string lights and their warm glows swing together. */}
        <div className="dance-lights">
          {BULBS.map(([x, y], i) => (
            <span
              key={i}
              className="dance-glow"
              style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i * 0.37) % 2.6}s` }}
            />
          ))}
          <Layer name="lights" />
        </div>
        {LAYERS.map((layer) => (
          <Layer key={layer.name} {...layer} />
        ))}
      </div>

      <p className="dance-welcome">Welcome, {welcome}</p>
      <a className="button" href="#rsvp">RSVP</a>
    </div>
  )
}
