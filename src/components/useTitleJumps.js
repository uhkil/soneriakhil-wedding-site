// Links to a section of the page (the nav bar, the RSVP button under the
// countdown, "Events section" in the FAQ, ...) scroll so that the section's
// title sits at the top of the screen, just below the nav bar, instead of
// the top of the section (which, for sections with a drawing above the
// title, left the title down at the bottom of the screen).
// Sections without a title (Home) still go to the top of the section.
// The space kept above the title is "scroll-margin-top" on .section h2 in
// index.css.
import { useEffect } from 'react'

export function useTitleJumps(enabled) {
  useEffect(() => {
    if (!enabled) return
    const onClick = (e) => {
      // Ignore clicks meant to open a new tab or window.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = e.target.closest?.('a[href^="#"]')
      const id = link?.getAttribute('href').slice(1)
      const section = id && document.getElementById(id)
      if (!section) return
      e.preventDefault()
      const target = section.querySelector('h2') ?? section
      // Smooth unless the guest has asked for less motion (see "scroll-behavior" in index.css).
      target.scrollIntoView({ block: 'start' })
      history.pushState(null, '', `#${id}`)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [enabled])
}
