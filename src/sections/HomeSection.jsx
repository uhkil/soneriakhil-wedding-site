// The opening of the site: the animated scene, then names, date, and RSVP.
import Section from '../components/Section.jsx'
import HeroAnimation from '../components/hero/HeroAnimation.jsx'

export default function HomeSection() {
  return (
    <Section id="home" className="hero">
      <HeroAnimation />
      <div className="hero-text">
        <h1>Soneri &amp; Akhil</h1>
        <p className="hero-details">April 9–10, 2027 · Dallas, TX</p>
        <a className="button" href="#rsvp">RSVP</a>
      </div>
    </Section>
  )
}
