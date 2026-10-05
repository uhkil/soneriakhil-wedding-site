// The opening of the site: names, date, and a big illustration.
import Section from '../components/Section.jsx'
import IllustrationSlot from '../components/IllustrationSlot.jsx'
import Doodle from '../components/Doodle.jsx'

export default function HomeSection() {
  return (
    <Section id="home" className="hero">
      <div className="hero-text">
        <h1>
          Soneri &amp; Akhil
          <Doodle type="heart" size={36} className="hero-heart" />
        </h1>
        <p className="hero-details">April 9–10 · Dallas, TX</p>
        <a className="button" href="#rsvp">RSVP</a>
      </div>
      <IllustrationSlot name="heroCouple" size="large" className="hero-art" />
    </Section>
  )
}
