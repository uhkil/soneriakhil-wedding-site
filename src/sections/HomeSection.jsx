// The opening of the site: the animated scene, then names and date.
// Before login it shows "Find your invitation"; after, a welcome and RSVP button.
import Section from '../components/Section.jsx'
import HeroAnimation from '../components/hero/HeroAnimation.jsx'
import FindInvitation from '../components/login/FindInvitation.jsx'
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
  const { status, party } = useGuest()

  return (
    <Section id="home" className="hero">
      <HeroAnimation />
      <div className="hero-text">
        <h1>Soneri &amp; Akhil</h1>
        <p className="hero-details">April 9–10, 2027 · Dallas, TX</p>

        {status === 'checking' && <p className="hero-status">Opening your invitation…</p>}
        {status === 'guest' && <FindInvitation />}
        {status === 'in' && (
          <>
            <p className="hero-welcome">Welcome, {welcomeNames(party)}!</p>
            <a className="button" href="#rsvp">RSVP</a>
          </>
        )}
      </div>
    </Section>
  )
}
