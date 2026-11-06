// The whole site is one long scrolling page.
// Before a guest finds their invitation, they only see the invitation-card
// login page. After, the nav bar and every section appear.
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
import Toaster from './components/Toast.jsx'
import { useGuest } from './guest/GuestProvider.jsx'
import { isPractice } from './api/rsvpApi.js'
import { useTitleJumps } from './components/useTitleJumps.js'

export default function App() {
  const { status, party, logout } = useGuest()
  const loggedIn = status === 'in'
  // Links to a section bring its title to the top of the screen.
  useTitleJumps(loggedIn)

  return (
    <>
      <Toaster />
      {isPractice && (
        <p className="practice-banner">
          Practice mode: fake guests. Try “Jordan Lee” with CELEBRATE (all four events), “Sam Rivera” with TOAST, “Lena Park” with BLESSED (Wedding only).
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
            {/* The same script "&" as the big names at the top, sized to the text. */}
            <p>
              &lt;3&nbsp;this website was designed with luv by soneri{' '}
              <span className="footer-and" aria-label="and">
                &amp;
              </span>{' '}
              akhil&nbsp;&lt;3
            </p>
          </footer>
        </>
      )}
    </>
  )
}
