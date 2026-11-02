// The whole site is one long scrolling page.
// Before a guest finds their invitation, they only see the invitation-card
// login page. After, the nav bar and every section appear.
// DecorativeTransitions are small illustrated pauses BETWEEN sections.
// They aren't in the nav; delete a line to remove one.
import NavBar from './components/NavBar.jsx'
import HomeSection from './sections/HomeSection.jsx'
import OurStorySection from './sections/OurStorySection.jsx'
import MemoriesSection from './sections/MemoriesSection.jsx'
import EventsSection from './sections/EventsSection.jsx'
import TravelSection from './sections/TravelSection.jsx'
import RegistrySection from './sections/RegistrySection.jsx'
import FaqSection from './sections/FaqSection.jsx'
import RsvpSection from './sections/RsvpSection.jsx'
import LoginPage from './components/login/LoginPage.jsx'
import DesignToggle from './design/DesignToggle.jsx'
import Toaster from './components/Toast.jsx'
import { useGuest } from './guest/GuestProvider.jsx'
import { isPractice } from './api/rsvpApi.js'

export default function App() {
  const { status, party, logout } = useGuest()
  const loggedIn = status === 'in'

  return (
    <>
      <DesignToggle />
      <Toaster />
      {isPractice && (
        <p className="practice-banner">
          Practice mode: fake guests. Try “Jordan Lee” with passcode CELEBRATE.
        </p>
      )}
      {!loggedIn ? (
        <LoginPage />
      ) : (
        <>
          <NavBar onLogout={logout} />
          <main>
            <HomeSection />
            <OurStorySection />
            <MemoriesSection />
            {/* Only the events this party is invited to, with details from the Sheet. */}
            <EventsSection events={party.events} />
            <TravelSection />
            <RegistrySection />
            <FaqSection />
            <RsvpSection />
          </main>
          <footer className="site-footer">
            <p>&lt;3&nbsp;this website was designed with luv by soneri and akhil&nbsp;&lt;3</p>
          </footer>
        </>
      )}
    </>
  )
}
