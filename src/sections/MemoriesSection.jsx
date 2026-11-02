// A collection of photos, viewable three ways:
//   - "Film strip": all photos in a row across the whole page, scrolling sideways
//   - "Camera" (shown first): one photo at a time on the screen of a drawn
//     camera; its left and right arrows step through them
//   - "Grid": all photos at once, in rows
import Section from '../components/Section.jsx'
import { useState } from 'react'
import PhotoSlot from '../components/PhotoSlot.jsx'
import Doodle from '../components/Doodle.jsx'
import IllustrationSlot from '../components/IllustrationSlot.jsx'

// For now these are just labels. Later each will point to a real photo file
// (e.g. { label: 'Memory 1', src: 'assets/memories/first-date.jpg' }).
const photos = [
  'Memory 1', 'Memory 2', 'Memory 3', 'Memory 4',
  'Memory 5', 'Memory 6', 'Memory 7', 'Memory 8',
]

const VIEWS = [
  { id: 'filmstrip', label: 'Film strip' },
  { id: 'camera', label: 'Camera' },
  { id: 'grid', label: 'Grid' },
]

export default function MemoriesSection() {
  // "useState" lets a component remember something that can change.
  // view = which view is showing; setView = the function that changes it.
  const [view, setView] = useState('camera')
  const viewIndex = VIEWS.findIndex((v) => v.id === view)

  return (
    <Section id="memories">
      {/* Corner art just above the title (see "corner-art" in index.css). */}
      <IllustrationSlot name="storyVignette" size="small" className="corner-art corner-art-right" />
      <h2>
        Memories <Doodle type="heart" size={28} />
      </h2>

      {/* The toggle: one pill with a highlight that slides to the chosen view. */}
      <div className="view-toggle" role="group" aria-label="How to view the photos" style={{ '--index': viewIndex }}>
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={view === v.id ? 'selected' : ''}
            aria-pressed={view === v.id}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* All three views are stacked in the same spot, with only the chosen
          one visible. The box is as tall as the tallest view, so switching
          views never moves the title, the toggle, or anything else. */}
      <div className="memories-viewer">
        <View id="filmstrip" view={view}>
          <div className="filmstrip">
            {photos.map((photo) => (
              <div key={photo} className="filmstrip-frame">
                <PhotoSlot label={photo} className="memory-photo" />
              </div>
            ))}
          </div>
        </View>
        <View id="camera" view={view}>
          <Camera />
        </View>
        <View id="grid" view={view}>
          <div className="memory-grid">
            {photos.map((photo) => (
              <PhotoSlot key={photo} label={photo} className="memory-photo" />
            ))}
          </div>
        </View>
      </div>
    </Section>
  )
}

// One of the views. The hidden ones still take up room (so the box stays the
// same height) but can't be seen, clicked, or reached with the keyboard.
function View({ id, view, children }) {
  const shown = id === view
  return (
    <div className={`memories-view memories-view-${id}${shown ? ' shown' : ''}`} inert={!shown} aria-hidden={!shown}>
      {children}
    </div>
  )
}

// The drawn camera (public/assets/art/camera.svg, in the text color). The
// photo sits in the drawing's screen, and two invisible buttons sit over the
// arrows on its dial. The arrows pulse gently until the pointer is over the dial.
function Camera() {
  // Which photo is showing (0 = the first one).
  const [current, setCurrent] = useState(0)

  // Step back or forward, wrapping around at either end.
  const step = (by) => setCurrent((current + by + photos.length) % photos.length)

  return (
    <div className="camera">
      <div className="camera-body">
        {/* The photo, in the camera's screen. */}
        <div className="camera-screen" aria-live="polite">
          <PhotoSlot label={photos[current]} className="camera-photo" />
        </div>

        {/* The camera itself, drawn in the text color. */}
        <div
          className="camera-drawing"
          aria-hidden="true"
          style={{
            WebkitMaskImage: `url(${import.meta.env.BASE_URL}assets/art/camera.svg)`,
            maskImage: `url(${import.meta.env.BASE_URL}assets/art/camera.svg)`,
          }}
        />

        <div
          className="camera-dial"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') step(-1)
            if (e.key === 'ArrowRight') step(1)
          }}
        >
          <button type="button" className="camera-arrow camera-arrow-left" aria-label="Previous photo" onClick={() => step(-1)}>
            <svg viewBox="0 0 10 12" aria-hidden="true">
              <path d="M9 1 1 6l8 5z" />
            </svg>
          </button>
          <button type="button" className="camera-arrow camera-arrow-right" aria-label="Next photo" onClick={() => step(1)}>
            <svg viewBox="0 0 10 12" aria-hidden="true">
              <path d="M1 1l8 5-8 5z" />
            </svg>
          </button>
        </div>
      </div>

      <p className="camera-count">
        {current + 1} / {photos.length}
      </p>
    </div>
  )
}
