// The whole site is one long scrolling page.
// The nav bar stays pinned at the top; each section below has an "id"
// that the nav links jump to (e.g. clicking "Events" jumps to id="events").
import NavBar from './components/NavBar.jsx'
import HomeSection from './sections/HomeSection.jsx'
import OurStorySection from './sections/OurStorySection.jsx'
import MemoriesSection from './sections/MemoriesSection.jsx'
import EventsSection from './sections/EventsSection.jsx'
import TravelSection from './sections/TravelSection.jsx'
import RegistrySection from './sections/RegistrySection.jsx'
import FaqSection from './sections/FaqSection.jsx'
import RsvpSection from './sections/RsvpSection.jsx'

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <HomeSection />
        <OurStorySection />
        <MemoriesSection />
        <EventsSection />
        <TravelSection />
        <RegistrySection />
        <FaqSection />
        <RsvpSection />
      </main>
    </>
  )
}
