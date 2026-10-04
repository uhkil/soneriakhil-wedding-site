// The nav bar pinned to the top of the screen.
//   - On laptops and bigger screens: a row of links.
//   - On phones: a ☰ button that opens a dropdown list of the same links.
// It also underlines the link for whichever section you're currently looking at.
import { useState, useEffect } from 'react'

// The list of sections in the nav. To add, remove, or reorder links, edit this list.
// Each "id" must match the id of a section on the page.
const links = [
  { id: 'home', label: 'Home' },
  { id: 'story', label: 'Our Story' },
  { id: 'memories', label: 'Memories' },
  { id: 'events', label: 'Events' },
  { id: 'travel', label: 'Travel' },
  { id: 'registry', label: 'Registry' },
  { id: 'faq', label: 'FAQ' },
  { id: 'rsvp', label: 'RSVP' },
]

export default function NavBar() {
  // Is the phone menu open? Starts closed.
  const [menuOpen, setMenuOpen] = useState(false)

  // Which section is on screen right now (so we can underline its link).
  const [activeId, setActiveId] = useState('home')

  // useEffect runs code after the page has been drawn.
  // Here we set up an "IntersectionObserver": a built-in browser tool that
  // tells us when a section crosses the middle of the screen.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      // Shrink the "watch zone" to a thin line across the middle of the screen.
      { rootMargin: '-50% 0px -50% 0px' }
    )

    links.forEach((link) => {
      const section = document.getElementById(link.id)
      if (section) observer.observe(section)
    })

    // Clean up when the nav bar is removed from the page.
    return () => observer.disconnect()
  }, [])

  return (
    <nav className="navbar">
      <a className="navbar-brand" href="#home">
        S &amp; A
      </a>

      {/* Only visible on phones (the CSS hides it on bigger screens). */}
      <button
        className="menu-button"
        aria-label="Menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* On phones, these links only show when the menu is open. */}
      <div className={menuOpen ? 'navbar-links open' : 'navbar-links'}>
        {links.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={link.id === activeId ? 'active' : ''}
            // Close the phone menu after a link is tapped.
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
