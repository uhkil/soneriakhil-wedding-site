// The Home banner: huge bold names with a
// flowing script ampersand, the date and place on the left, a welcome on the
// right, then the animation of the two of them dancing and waving hello.
// Further down (after some space): a countdown to the wedding, and an RSVP button.
import HoneyDance from './HoneyDance.jsx'
import Countdown from './Countdown.jsx'

export default function HoneyBanner({ welcome, dates, countdownTo }) {
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
              {dates}
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
        <HoneyDance />
      </div>
      {/* Below the first screen: some breathing room, then the countdown. */}
      <Countdown to={countdownTo} />
      {/* A shortcut to the RSVP form at the bottom of the page. */}
      <a className="button countdown-rsvp" href="#rsvp">
        RSVP
      </a>
    </div>
  )
}
