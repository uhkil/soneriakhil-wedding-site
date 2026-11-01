// Which visual design the site uses. The designs share all the same content
// and RSVP logic; only the look (and the Home banner) differs:
//   'pressed' — Pressed paper: warm gray paper, rust ink, fine Didone capitals,
//               the photo that dissolves into a line drawing.
//   'honey'   — House of Honey: light blue and dark blue, huge bold names
//               with a script ampersand, and an animation of the two of them
//               dancing and waving (two versions; see useHoneyHero below).
//   'cobalt'  — Dance floor: warm ivory and cobalt blue, an elegant serif,
//               and the illustration of the two of them dancing.
//   'cream'   — Cream: Pressed paper's layout and type on a light cream
//               background, with an animation of the two of them dancing,
//               turning, and waving hello.
//
// The choice is stored on the <html> element as data-design="...", which the
// CSS uses to switch styles, and remembered in this browser.
import { useEffect, useState } from 'react'

// hidden: true leaves a design out of the preview switch (its code and styles
// stay, so it can come back by removing the flag).
export const DESIGNS = [
  { id: 'pressed', label: 'Pressed paper', hidden: true },
  { id: 'honey', label: 'House of Honey' },
  { id: 'cobalt', label: 'Dance floor', hidden: true },
  { id: 'cream', label: 'Cream', hidden: true },
]
export const SHOWN_DESIGNS = DESIGNS.filter((d) => !d.hidden)

// The design the public site uses. (Only the local preview shows a switch.)
const DEFAULT_DESIGN = 'pressed'
const KEY = 'wedding-design'

function savedDesign() {
  // On the local preview, only the designs in the switch can be chosen; if
  // the default is hidden, start on the first one shown.
  const choices = import.meta.env.DEV ? SHOWN_DESIGNS : DESIGNS
  const fallback = choices.some((d) => d.id === DEFAULT_DESIGN) ? DEFAULT_DESIGN : choices[0].id
  try {
    const value = localStorage.getItem(KEY)
    return choices.some((d) => d.id === value) ? value : fallback
  } catch {
    return fallback
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

// House of Honey has two versions of its Home animation (HoneyDance.jsx).
// Which one shows is remembered in this browser, like the design.
export const HONEY_HEROES = [
  { id: 1, label: 'Animation 1' },
  { id: 2, label: 'Animation 2' },
]
const DEFAULT_HONEY_HERO = 2
const HERO_KEY = 'wedding-honey-hero'

function savedHoneyHero() {
  try {
    const value = Number(localStorage.getItem(HERO_KEY))
    return HONEY_HEROES.some((h) => h.id === value) ? value : DEFAULT_HONEY_HERO
  } catch {
    return DEFAULT_HONEY_HERO
  }
}

export function useHoneyHero() {
  const [hero, setHero] = useState(savedHoneyHero)

  useEffect(() => {
    try {
      localStorage.setItem(HERO_KEY, String(hero))
    } catch {
      // Not remembered; it'll start on the default next time.
    }
    window.dispatchEvent(new CustomEvent('honeyherochange', { detail: hero }))
  }, [hero])

  // Keep every component that uses this hook in step.
  useEffect(() => {
    const onChange = (e) => setHero(e.detail)
    window.addEventListener('honeyherochange', onChange)
    return () => window.removeEventListener('honeyherochange', onChange)
  }, [])

  return [hero, setHero]
}
