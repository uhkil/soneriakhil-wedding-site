// The top of the site after login: the names in big bold letters, the date,
// place, and a welcome, then the animation of the two of them dancing and
// waving hello, and further down, the countdown. The dates shown are this
// guest's own (see src/data/schedule.js).
import Section from '../components/Section.jsx'
import HoneyBanner from '../components/home/HoneyBanner.jsx'
import { useGuest } from '../guest/GuestProvider.jsx'
import { dateRange, firstEvent, rsvpClosed } from '../data/schedule.js'

// Who the welcome names:
//   1 or 2 people on the invitation: both first names, e.g. "Priya & Sam"
//     (a plus-one once they've been named)
//   3 or more: the first name of whoever logged in, "& family", e.g.
//     "Jordan & family" (so it always fits, even on phones)
function welcomeNames(party, guestId) {
  const firstName = (g) => (g.isPlusOne ? (party.answers[g.guestId]?.name || '').split(' ')[0] : g.firstName)
  if (party.guests.length > 2) {
    // Whoever logged in; for logins saved before that was remembered, the
    // first person on the invitation.
    const me = party.guests.find((g) => g.guestId === guestId && !g.isPlusOne) ?? party.guests.find((g) => !g.isPlusOne)
    return me?.firstName ? `${me.firstName} & family` : 'friends'
  }
  const names = party.guests.map(firstName).filter(Boolean)
  if (names.length <= 1) return names[0] || 'friends'
  return names.join(' & ')
}

export default function HomeSection() {
  const { party, guestId } = useGuest()
  return (
    <Section id="home" className="hero hero-honey">
      {/* Only this guest's dates: e.g. "April 10, 2027" if all their events are
          that day, and the countdown runs to their first event. */}
      <HoneyBanner welcome={welcomeNames(party, guestId)} dates={dateRange(party.events)} countdownTo={firstEvent(party.events)?.start.getTime()} showRsvp={!rsvpClosed(party)} />
    </Section>
  )
}
