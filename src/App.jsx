// The whole site is one long scrolling page.
// Before a guest finds their invitation, only the Home section shows.
// After, the nav bar and every other section appear.
// DecorativeTransitions are small illustrated pauses BETWEEN sections.
// They aren't in the nav; delete a line to remove one.
import NavBar from './components/NavBar.jsx'
import DecorativeTransition from './components/DecorativeTransition.jsx'
import HomeSection from './sections/HomeSection.jsx'
import OurStorySection from './sections/OurStorySection.jsx'
import MemoriesSection from './sections/MemoriesSection.jsx'
import EventsSection from './sections/EventsSection.jsx'
import TravelSection from './sections/TravelSection.jsx'
import RegistrySection from './sections/RegistrySection.jsx'
import FaqSection from './sections/FaqSection.jsx'
import RsvpSection from './sections/RsvpSection.jsx'
import { useGuest } from './guest/GuestProvider.jsx'
import { isPractice } from './api/rsvpApi.js'

export default function App() {
  const { status, party, logout } = useGuest()
  const loggedIn = status === 'in'

  return (
    <>
      {loggedIn && <NavBar onLogout={logout} />}
      {isPractice && (
        <p className="practice-banner">
          Practice mode: fake guests. Try “Jordan Lee” with code PEONY.
        </p>
      )}
      <main>
        <HomeSection />
        {loggedIn && (
          <>
            <OurStorySection />
            <MemoriesSection />
            <DecorativeTransition art="transitionWalk" motion="walk" />
            {/* Only the events this party is invited to. */}
            <EventsSection invitedEventIds={party.events.map((e) => e.id)} />
            <DecorativeTransition art="indianAttire" size="medium" />
            <TravelSection />
            <RegistrySection />
            <FaqSection />
            <RsvpSection />
          </>
        )}
      </main>
    </>
  )
}
