// The pop-up that opens after an RSVP is saved.
//
// If anyone in the party is coming to anything: a burst of confetti (in the
// site's blues) flies out from behind the card, and a disco ball swings and
// sparkles at the top. Tapping the disco ball sends another burst (a little
// surprise; nothing on the card points it out).
// If everyone declined: a softer thank-you with the heart hands, no confetti.
//
// It closes with the ×, the Escape key, or a tap on the overlay around it.
// Guests who've asked their device for less motion get no confetti or swinging.
import { useEffect, useRef, useState } from 'react'
import Art from './Art.jsx'

const COLORS = ['#003459', '#2f6690', '#6d9cc0', '#93c3e4', '#ffffff']
const PIECES = 90 // confetti pieces per burst

// A fresh set of confetti pieces, each with its own direction, size, color,
// spin, and speed (all random, so every burst looks different).
function makeBurst() {
  const random = (min, max) => min + Math.random() * (max - min)
  return Array.from({ length: PIECES }, (_, i) => {
    const size = random(6, 11)
    const shape = i % 5 === 0 ? 'circle' : 'strip'
    return {
      '--dx': `${random(-48, 48)}vw`, // how far sideways it flies
      '--dy': `${random(-55, -18)}vh`, // how high it flies before falling
      '--rot': `${random(-900, 900)}deg`, // how much it spins
      '--dur': `${random(2.6, 4.2)}s`,
      '--delay': `${random(0, 0.18)}s`,
      width: `${size}px`,
      height: `${shape === 'circle' ? size : size * 0.45}px`,
      borderRadius: shape === 'circle' ? '50%' : '1px',
      background: COLORS[i % COLORS.length],
    }
  })
}

export default function RsvpCelebration({ open, attending, onClose }) {
  const dialog = useRef(null)
  const card = useRef(null)
  // Each burst gets a new number, so React draws a brand-new set of confetti.
  const [burst, setBurst] = useState(0)

  useEffect(() => {
    if (open && !dialog.current?.open) {
      dialog.current?.showModal()
      // The card takes focus (rather than the ×, so it doesn't show a focus ring).
      card.current?.focus()
      setBurst((n) => n + 1)
    }
  }, [open])

  const close = () => dialog.current?.close()

  return (
    <dialog
      ref={dialog}
      className="celebration"
      aria-labelledby="celebration-title"
      onClose={onClose}
      onClick={(e) => {
        // A tap on the overlay (outside the card) closes it.
        if (e.target === e.currentTarget) close()
      }}
    >
      {/* Behind the card: the confetti (decorative, so screen readers skip it). */}
      {open && attending && <Confetti key={burst} />}

      <div className="celebration-card" tabIndex={-1} ref={card}>
        <button type="button" className="dialog-close" aria-label="Close" onClick={close}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        {attending ? (
          <>
            {/* The disco ball: swings, sparkles, and sends more confetti when tapped. */}
            <button
              type="button"
              className="celebration-disco"
              aria-label="More confetti!"
              onClick={() => setBurst((n) => n + 1)}
            >
              <Art file="discoball.webp" />
              <Sparkle className="sparkle-1" />
              <Sparkle className="sparkle-2" />
              <Sparkle className="sparkle-3" />
            </button>
            <p className="celebration-title" id="celebration-title" role="heading" aria-level={2}>
              You’re on the list!
            </p>
            <p className="celebration-line">Your RSVP was saved — get ready to celebrate!</p>
          </>
        ) : (
          <>
            <Art file="heart-hands.webp" className="celebration-hearts" />
            <p className="celebration-title" id="celebration-title" role="heading" aria-level={2}>
              Thanks for letting us know
            </p>
            <p className="celebration-line">Your RSVP was saved — we’ll miss you!</p>
          </>
        )}
        <p className="celebration-small">Changes to your RSVP can be made any time before January 15.</p>
      </div>
    </dialog>
  )
}

function Confetti() {
  const [pieces] = useState(makeBurst)
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((style, i) => (
        <span key={i} style={style} />
      ))}
    </div>
  )
}

// A little four-pointed twinkle.
function Sparkle({ className }) {
  return (
    <svg className={`sparkle ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c.9 6.6 4.4 10.6 12 12-7.6 1.4-11.1 5.4-12 12-.9-6.6-4.4-10.6-12-12 7.6-1.4 11.1-5.4 12-12z" />
    </svg>
  )
}
