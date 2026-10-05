// Getting there and where to stay.
import Section from '../components/Section.jsx'
import Doodle from '../components/Doodle.jsx'
import PhotoSlot from '../components/PhotoSlot.jsx'

export default function TravelSection() {
  return (
    <Section id="travel">
      <h2>Travel &amp; Accommodations</h2>

      {/* A dotted flight path with a little plane at the end (decorative). */}
      <div className="travel-route" aria-hidden="true">
        <svg className="route-line" viewBox="0 0 400 60" preserveAspectRatio="none">
          <path d="M5 50 C 80 50, 110 10, 190 25 S 320 45, 370 18" />
        </svg>
        <Doodle type="plane" size={48} className="travel-plane" />
      </div>

      <div className="travel-columns">
        <div>
          <h3>
            <Doodle type="plane" size={30} /> Getting There
          </h3>
          <p>Placeholder: nearest airport and transportation info.</p>
        </div>

        <div>
          <h3>
            <Doodle type="suitcase" size={30} /> Where to Stay
          </h3>
          <PhotoSlot label="Hotel photo" tilt={1.5} className="hotel-photo" />
          <p>Placeholder: hotel name, room block details, booking link.</p>
        </div>
      </div>
    </Section>
  )
}
