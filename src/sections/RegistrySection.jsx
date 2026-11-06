// The registry: one fund, for our honeymoon. Its card has a short line and a
// "Give to our honeymoon" button, which opens a small pop-up: "Choose a way
// to send your gift", with a button for each way (credit card through a
// registry cash fund, PayPal, Venmo). Each opens that site in a new tab; no
// payment happens on this website.
//
// PLACEHOLDERS: the links below are made up for now. Before this goes live,
// they should come from the Sheet after login (like the event details), so
// they aren't in the website's public code.
import { useRef } from 'react'
import Section from '../components/Section.jsx'
import Art from '../components/Art.jsx'
import SideDrawing from '../components/SideDrawing.jsx'

const GIVE = [
  {
    label: 'Credit card',
    tip: 'Through our registry fund · a small card fee',
    href: 'https://example.com/your-registry-cash-fund', // e.g. a Joy or Zola cash fund
  },
  {
    label: 'PayPal',
    tip: 'Choose “Friends & Family” · no fee from your bank',
    href: 'https://www.paypal.com/paypalme/your-paypal-name',
  },
  {
    label: 'Venmo',
    tip: 'Choose “Friends” · no fee from your bank or debit card',
    href: 'https://venmo.com/u/your-venmo-handle',
  },
]

export default function RegistrySection() {
  const dialog = useRef(null)
  const close = () => dialog.current?.close()

  return (
    <Section id="registry" className="quiet">
      {/* A side drawing just above the title, in its dark strip (see SideDrawing.jsx). */}
      <SideDrawing name="coffeeDate" side="left" />
      <h2>
        {/* The word stays centered on the page; the drawing of two hands
            making a heart hangs off its right side (see .title-hands). */}
        <span className="title-word">
          Registry
          <Art file="heart-hands.webp" className="title-hands" />
        </span>
      </h2>
      <p className="registry-note">
        Having you there to celebrate with us is the greatest gift. If you’d still like to give, a contribution toward
        our honeymoon would mean the world to us.
      </p>

      <div className="travel-card registry-card">
        <h3 className="card-pill">Honeymoon fund</h3>
        <p className="registry-fund-text">
          Help us kick off married life with a trip to remember: a few lazy beach days, a lot of good food, and plenty
          of passport stamps.
        </p>
        <button type="button" className="button registry-give" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
          Give to our honeymoon <span aria-hidden="true">→</span>
        </button>
      </div>

      {/* The pop-up (the same look as "Which one is you?" on the login page).
          A tap outside it, the ×, or Escape closes it. */}
      <dialog
        ref={dialog}
        className="choose-dialog gift-dialog"
        aria-labelledby="gift-title"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <button type="button" className="dialog-close" aria-label="Close" onClick={close}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <h2 id="gift-title">Give to our honeymoon</h2>
        <p>Choose a way to send your gift.</p>
        <div className="choose-list">
          {GIVE.map((way) => (
            <a key={way.label} className="choose-option gift-option" href={way.href} target="_blank" rel="noreferrer">
              <span className="choose-name">
                {way.label}
                <ExternalIcon />
              </span>
              <span className="choose-party">{way.tip}</span>
            </a>
          ))}
        </div>
      </dialog>
    </Section>
  )
}

// A small arrow out of a box: "this opens another website".
function ExternalIcon() {
  return (
    <svg className="external-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  )
}
