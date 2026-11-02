// The top of the site after login: the names in big bold letters, the date,
// place, and a welcome, then the animation of the two of them dancing and
// waving hello, and further down, the countdown.
import Section from '../components/Section.jsx'
import HoneyBanner from '../components/home/HoneyBanner.jsx'
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
    <Section id="home" className="hero hero-honey">
      <HoneyBanner welcome={welcomeNames(party)} />
    </Section>
  )
}
