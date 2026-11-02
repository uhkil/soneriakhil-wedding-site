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

const whereToStay = [
  ['Hotel', 'Details to come'],
  ['Room block', 'Details to come'],
  ['Book by', 'Details to come'],
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
          {/* The hotel's photo: add it as src="assets/travel/hotel.jpg". */}
          <PhotoSlot label="Hotel photo" alt="The hotel" className="travel-photo" />
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
