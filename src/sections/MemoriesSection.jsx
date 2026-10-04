// A collection of photos, viewable two ways:
//   - "Film strip": all photos in a row you can scroll sideways
//   - "Camera": one photo at a time, like looking at a camera's playback screen
import Section from '../components/Section.jsx'
import { useState } from 'react'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'

// For now these are just labels. Later each will point to a real photo file.
const photos = [
  'Memory 1', 'Memory 2', 'Memory 3', 'Memory 4',
  'Memory 5', 'Memory 6', 'Memory 7', 'Memory 8',
]

export default function MemoriesSection() {
  // "useState" lets a component remember something that can change.
  // view = which view is showing; setView = the function that changes it.
  const [view, setView] = useState('filmstrip')

  // Which photo the camera view is showing (0 = the first one).
  const [current, setCurrent] = useState(0)

  // Go to the previous/next photo, wrapping around at either end.
  function showPrevious() {
    setCurrent((current - 1 + photos.length) % photos.length)
  }
  function showNext() {
    setCurrent((current + 1) % photos.length)
  }

  return (
    <Section id="memories">
      <h2>Memories</h2>

      {/* The toggle: two buttons that switch between the views. */}
      <div className="view-toggle">
        <button
          className={view === 'filmstrip' ? 'selected' : ''}
          onClick={() => setView('filmstrip')}
        >
          Film strip
        </button>
        <button
          className={view === 'camera' ? 'selected' : ''}
          onClick={() => setView('camera')}
        >
          Camera
        </button>
      </div>

      {/* Show one view or the other, depending on "view".
          The "memories-viewer" box has a fixed height, so switching views
          doesn't make the page (or the "Memories" title) jump around. */}
      <div className="memories-viewer">
        {view === 'filmstrip' ? (
          <div className="filmstrip">
            {photos.map((photo) => (
              <div key={photo} className="filmstrip-frame">
                <ImagePlaceholder label={photo} className="memory-photo" />
              </div>
            ))}
          </div>
        ) : (
          <div className="camera">
            <div className="camera-screen">
              <ImagePlaceholder label={photos[current]} className="memory-photo" />
            </div>
            <div className="camera-controls">
              <button onClick={showPrevious}>◀</button>
              <span>
                {current + 1} / {photos.length}
              </span>
              <button onClick={showNext}>▶</button>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}
