// The top of the site after login: the Central Park photo (which dissolves
// into a line drawing and back), then the names, date, a welcome, and the
// RSVP button. (In the House of Honey design, a bold banner and carousel instead.)
import Section from '../components/Section.jsx'
import PhotoDrawingSwap from '../components/home/PhotoDrawingSwap.jsx'
import HoneyBanner from '../components/home/HoneyBanner.jsx'
import { useDesign } from '../design/useDesign.js'
import { useGuest } from '../guest/GuestProvider.jsx'

// "Jordan, Sam & Max": first names of everyone on the invitation
// (plus-ones once they've been named).
function welcomeNames(party) {
  const names = party.guests
    .map((g) => (g.isPlusOne ? (party.answers[g.guestId]?.name || '').split(' ')[0] : g.firstName))
    .filter(Boolean)
  if (names.length <= 1) return names[0] || 'friends'
  return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1]
}

export default function HomeSection() {
  const { party } = useGuest()
  const [design] = useDesign()

  // House of Honey design: a bold banner with the names, then a photo carousel.
  if (design === 'honey') {
    return (
      <Section id="home" className="hero hero-honey">
        <HoneyBanner welcome={welcomeNames(party)} />
      </Section>
    )
  }

  return (
    <Section id="home" className="hero">
      <PhotoDrawingSwap />
      <div className="hero-text">
        <h1>Soneri &amp; Akhil</h1>
        <p className="hero-details">April 9–10, 2027 · Dallas, TX</p>
        <p className="hero-welcome">Welcome, {welcomeNames(party)}!</p>
        <a className="button" href="#rsvp">RSVP</a>
      </div>
    </Section>
  )
}
