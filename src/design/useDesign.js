// Which visual design the site uses. The designs share all the same content
// and RSVP logic; only the look (and the Home banner) differs:
//   'pressed' — Pressed paper: warm gray paper, rust ink, fine Didone capitals,
//               the photo that dissolves into a line drawing.
//   'honey'   — House of Honey: blush pink and dark chocolate, huge bold names
//               with a script ampersand, and a photo carousel.
//   'cobalt'  — Dance floor: warm ivory and cobalt blue, an elegant serif,
//               and the illustration of the two of them dancing.
//
// The choice is stored on the <html> element as data-design="...", which the
// CSS uses to switch styles, and remembered in this browser.
import { useEffect, useState } from 'react'

export const DESIGNS = [
  { id: 'pressed', label: 'Pressed paper' },
  { id: 'honey', label: 'House of Honey' },
  { id: 'cobalt', label: 'Dance floor' },
]

// The design the public site uses. (Only the local preview shows a switch.)
const DEFAULT_DESIGN = 'pressed'
const KEY = 'wedding-design'

function savedDesign() {
  try {
    const value = localStorage.getItem(KEY)
    return DESIGNS.some((d) => d.id === value) ? value : DEFAULT_DESIGN
  } catch {
    return DEFAULT_DESIGN
  }
}

// Set it before the page first draws, so there's no flash of the other design.
document.documentElement.dataset.design = savedDesign()

export function useDesign() {
  const [design, setDesign] = useState(savedDesign)

  useEffect(() => {
    document.documentElement.dataset.design = design
    try {
      localStorage.setItem(KEY, design)
    } catch {
      // Not remembered; it'll start on the default next time.
    }
    // Let other parts of the page (e.g. Home) know the design changed.
    window.dispatchEvent(new CustomEvent('designchange', { detail: design }))
  }, [design])

  // Keep every component that uses this hook in step.
  useEffect(() => {
    const onChange = (e) => setDesign(e.detail)
    window.addEventListener('designchange', onChange)
    return () => window.removeEventListener('designchange', onChange)
  }, [])

  return [design, setDesign]
}
