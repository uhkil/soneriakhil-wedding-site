// Getting there and where to stay: two dark-blue cards side by side (stacked
// on phones), each with its title in a light-blue pill and a few details.
import Section from '../components/Section.jsx'
import PhotoSlot from '../components/PhotoSlot.jsx'
import IllustrationSlot from '../components/IllustrationSlot.jsx'

// Edit these to fill in the details. Each line is [label, what to show].
const gettingThere = [
  ['Fly into', 'Details to come'],
  ['From the airport', 'Details to come'],
  ['Getting around', 'Details to come'],
]

const ROOM_BLOCK = 'https://www.loewshotels.com/arlington-hotel/wedding-soneri-akhil-patel-wedding-room-block'

const whereToStay = [
  ['Hotel', 'Loews Arlington'],
  [
    'Room block',
    // Opens the hotel's booking page in a new tab.
    <a className="external-link" href={ROOM_BLOCK} target="_blank" rel="noreferrer">
      Soneri &amp; Akhil room block
      <ExternalIcon />
    </a>,
  ],
  ['Book by', 'March 1, 2027'],
]

export default function TravelSection() {
  return (
    <Section id="travel">
      {/* Corner art just above the title (see "corner-art" in index.css). */}
      <IllustrationSlot name="travelVignette" size="small" className="corner-art corner-art-right" />
      <h2>Travel &amp; Accommodations</h2>

      <div className="travel-cards">
        <TravelCard title="Getting there" details={gettingThere} />
        <TravelCard title="Where to stay" details={whereToStay}>
          {/* A drawing of the hotel, Live! by Loews, on light blue. */}
          <PhotoSlot
            src="assets/travel/live-by-loews.webp"
            alt="A drawing of the Live! by Loews hotel in Arlington"
            className="travel-photo"
          />
        </TravelCard>
      </div>
    </Section>
  )
}

function TravelCard({ title, details, children }) {
  return (
    <article className="travel-card">
      <h3 className="card-pill">{title}</h3>
      {children}
      <dl className="travel-facts">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </article>
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
