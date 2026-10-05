// TEMPORARY: Soneri's arm reaching back to hold Akhil's hand.
// The reference art has no Soneri pose with a backward-reaching arm, so this
// draws a simple arm + hand from her back shoulder to Akhil's reaching hand.
// It moves with Akhil (they run at the same speed, so it stays connected).
// Delete this once final art includes the hand-hold.
import heroArt from '../../data/heroArt.js'

const { follow } = heroArt.akhil
const { lead1, scale } = heroArt.soneri

// Points measured from Akhil's anchor on the ground (negative y = upward).
const hand = { x: follow.hand.x - follow.anchorX, y: -(follow.h - follow.hand.y) }
const shoulder = { x: -heroArt.leadGap, y: -(lead1.h - lead1.shoulder.y) * scale }

// The drawing area, in artwork pixels.
const box = { x: shoulder.x - 15, y: shoulder.y - 15, w: hand.x - shoulder.x + 30, h: hand.y - shoulder.y + 30 }

export default function HandLink({ linkRef }) {
  return (
    <svg
      ref={linkRef}
      className="hero-frame hero-handlink"
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      style={{
        left: `calc(var(--s) * ${box.x}px)`,
        bottom: `calc(var(--s) * ${-(box.y + box.h)}px)`,
        width: `calc(var(--s) * ${box.w}px)`,
      }}
      aria-hidden="true"
    >
      <path
        className="arm-outline"
        d={`M ${shoulder.x} ${shoulder.y} C ${shoulder.x + 22} ${shoulder.y + 10}, ${hand.x - 28} ${hand.y + 2}, ${hand.x - 3} ${hand.y}`}
      />
      <path
        className="arm-skin"
        d={`M ${shoulder.x} ${shoulder.y} C ${shoulder.x + 22} ${shoulder.y + 10}, ${hand.x - 28} ${hand.y + 2}, ${hand.x - 3} ${hand.y}`}
      />
      <ellipse className="hand" cx={hand.x - 2} cy={hand.y + 1} rx="7" ry="5.5" />
    </svg>
  )
}
