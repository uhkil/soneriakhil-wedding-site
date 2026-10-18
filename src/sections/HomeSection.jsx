// The top of the site after login: the Central Park photo (which dissolves
// into a line drawing and back) with the names and date over it, then a
// welcome and the RSVP button.
import Section from '../components/Section.jsx'
import PhotoDrawingSwap from '../components/home/PhotoDrawingSwap.jsx'
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

  return (
    <Section id="home" className="hero">
      <PhotoDrawingSwap />
      <div className="hero-text">
        <p className="hero-welcome">Welcome, {welcomeNames(party)}!</p>
        <a className="button" href="#rsvp">RSVP</a>
      </div>
    </Section>
  )
}
