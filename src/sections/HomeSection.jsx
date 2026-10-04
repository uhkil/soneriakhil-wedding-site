// The landing area at the very top: names, date, and a big hero image.
import Section from '../components/Section.jsx'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'

export default function HomeSection() {
  return (
    <Section id="home">
      <ImagePlaceholder label="Hero artwork" height={400} />
      <h1>Soneri &amp; Akhil</h1>
      <p>April 9–10 · Dallas, TX</p>
      <p>
        <a className="button" href="#rsvp">RSVP</a>
      </p>
    </Section>
  )
}
