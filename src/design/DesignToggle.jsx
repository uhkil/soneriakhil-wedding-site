// A small switch in the corner for flipping between designs while previewing.
// It only appears on the local preview (npm run dev), never on the live site.
// With House of Honey chosen, it also flips between its two Home animations.
// (Designs marked hidden in useDesign.js are left out.)
import { HONEY_HEROES, SHOWN_DESIGNS, useDesign, useHoneyHero } from './useDesign.js'

export default function DesignToggle() {
  const [design, setDesign] = useDesign()
  const [hero, setHero] = useHoneyHero()

  // import.meta.env.DEV is true only on the local preview.
  if (!import.meta.env.DEV) return null

  return (
    <div className="design-toggle" role="group" aria-label="Preview design">
      {SHOWN_DESIGNS.length > 1 &&
        SHOWN_DESIGNS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={d.id === design ? 'selected' : ''}
            aria-pressed={d.id === design}
            onClick={() => setDesign(d.id)}
          >
            {d.label}
          </button>
        ))}
      {design === 'honey' &&
        HONEY_HEROES.map((h) => (
          <button
            key={h.id}
            type="button"
            className={h.id === hero ? 'selected' : ''}
            aria-pressed={h.id === hero}
            onClick={() => setHero(h.id)}
          >
            {h.label}
          </button>
        ))}
    </div>
  )
}
