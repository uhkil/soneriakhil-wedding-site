// The nav bar pinned to the top of the screen.
//   - On laptops and bigger screens: a row of links.
//   - On phones (and small tablets, up to 768px): a menu button (three lines)
//     that opens a full-screen menu of the same links, in the big bold title
//     letters, with RSVP as a button and Log out at the bottom.
// It also underlines the link for whichever section you're currently looking at,
// and has a "Log out" button (onLogout) at the end.
import { useState, useEffect, useRef } from 'react'

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

export default function NavBar({ onLogout }) {
  // Is the phone menu open? Starts closed.
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)

  // Which section is on screen right now (so we can underline its link).
  const [activeId, setActiveId] = useState('home')

  // useEffect runs code after the page has been drawn.
  // Here we set up an "IntersectionObserver": a built-in browser tool that
  // tells us when a section crosses a line near the top of the screen.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      // Shrink the "watch zone" to a thin line near the top of the screen,
      // just below where a section's title lands after a nav jump (so even a
      // short section like Registry gets underlined when you jump to it).
      { rootMargin: '-12% 0px -87% 0px' }
    )

    links.forEach((link) => {
      const section = document.getElementById(link.id)
      if (section) observer.observe(section)
    })

    // Clean up when the nav bar is removed from the page.
    return () => observer.disconnect()
  }, [])

  // While the phone menu is open: the page behind it doesn't scroll, and the
  // Escape key closes it (so does widening the screen past 768px, where the
  // menu button goes away).
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    const onKey = (e) => e.key === 'Escape' && close()
    const wide = window.matchMedia('(min-width: 769px)')
    document.addEventListener('keydown', onKey)
    wide.addEventListener('change', close)
    document.body.style.overflow = 'hidden'
    // The menu fills the screen from just below the nav bar (wherever that is,
    // e.g. under the practice-mode strip) to the bottom.
    const nav = navRef.current
    nav.style.setProperty('--menu-top', `${nav.getBoundingClientRect().bottom}px`)
    return () => {
      document.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', close)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <nav ref={navRef} className="navbar">
      <a className="navbar-brand" href="#home">
        {/* The "&" has its own tag so a design can style it (House of Honey uses its script "&"). */}
        S <span className="navbar-and">&amp;</span> A
      </a>

      {/* Only visible on phones (the CSS hides it on bigger screens). */}
      <button
        className={menuOpen ? 'menu-button open' : 'menu-button'}
        aria-label={menuOpen ? 'Close menu' : 'Menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {/* Three lines that turn into an × while the menu is open (see .menu-icon in index.css). */}
        <span className="menu-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
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
        <button type="button" className="navbar-logout" onClick={onLogout}>
          Log out
        </button>
      </div>
    </nav>
  )
}
