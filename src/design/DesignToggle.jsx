// A small switch in the corner for flipping between designs while previewing.
// It only appears on the local preview (npm run dev), never on the live site.
import { DESIGNS, useDesign } from './useDesign.js'

export default function DesignToggle() {
  const [design, setDesign] = useDesign()

  // import.meta.env.DEV is true only on the local preview.
  if (!import.meta.env.DEV) return null

  return (
    <div className="design-toggle" role="group" aria-label="Preview design">
      {DESIGNS.map((d) => (
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
    </div>
  )
}
