// The Home banner for the House of Honey design: huge bold names with a
// flowing script ampersand, the date and place on the left, a welcome on the
// right, then the animation of the two of them dancing and waving hello.
// Further down (after some space): a countdown to the wedding with a butterfly.
// (The photo carousel it used before is still in PhotoCarousel.jsx.)
import HoneyDance from './HoneyDance.jsx'
import Countdown from './Countdown.jsx'
import { useHoneyHero } from '../../design/useDesign.js'

export default function HoneyBanner({ welcome }) {
  const [hero] = useHoneyHero()

  return (
    <div className="honey">
      {/* The first screen: the names, then the dancing couple filling the rest. */}
      <div className="honey-screen">
        <div className="honey-banner">
          <h1 className="honey-names">
            <span>Soneri</span>
            <span className="honey-and" aria-label="and">
              &amp;
            </span>
            <span>Akhil</span>
          </h1>
          <div className="honey-details">
            <p>
              April 9–10, 2027
              <br />
              Arlington, TX
            </p>
            <p className="honey-welcome">
              Welcome,
              <br />
              {welcome}
            </p>
          </div>
        </div>
        {/* key: switching versions starts the new one from the beginning. */}
        <HoneyDance key={hero} version={hero} />
      </div>
      {/* Below the first screen: some breathing room, then the countdown. */}
      <Countdown />
    </div>
  )
}
