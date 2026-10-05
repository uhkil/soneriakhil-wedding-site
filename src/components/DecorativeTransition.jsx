// A breathing-room moment BETWEEN sections: a hand-drawn line with a small
// illustration. It's purely decorative, so it isn't in the nav and screen
// readers skip it.
// Usage: <DecorativeTransition art="transitionWalk" motion="walk" />
// motion="walk" makes the illustration stroll in from the left when it
// scrolls into view (a proof-of-concept for future animation).
import IllustrationSlot from './IllustrationSlot.jsx'
import ScrollReveal from './ScrollReveal.jsx'

export default function DecorativeTransition({ art, size = 'small', motion }) {
  return (
    <div className="decorative-transition" aria-hidden="true">
      <ScrollReveal className={motion === 'walk' ? 'walk-in' : ''}>
        <IllustrationSlot name={art} size={size} />
      </ScrollReveal>
      {/* A gently wavy dotted line, like a path. */}
      <svg className="transition-path" viewBox="0 0 800 40" preserveAspectRatio="none">
        <path d="M0 20 C 100 5, 200 35, 300 20 S 500 5, 600 20 S 750 35, 800 18" />
      </svg>
    </div>
  )
}
