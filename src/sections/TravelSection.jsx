// Getting there and where to stay.
import Section from '../components/Section.jsx'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'

export default function TravelSection() {
  return (
    <Section id="travel">
      <h2>Travel &amp; Accommodations</h2>

      <div className="box">
        <h3>Getting There</h3>
        <p>Placeholder: nearest airport and transportation info.</p>
      </div>

      <div className="box">
        <h3>Where to Stay</h3>
        <ImagePlaceholder label="Hotel photo" height={150} />
        <p>Placeholder: hotel name, room block details, booking link.</p>
      </div>
    </Section>
  )
}
