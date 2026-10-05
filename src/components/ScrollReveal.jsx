// Gently fades its contents in when they scroll into view.
// People who have "reduce motion" turned on in their device settings
// just see the content right away (handled in index.css).
// Usage: <ScrollReveal> ...anything... </ScrollReveal>
import { useEffect, useRef, useState } from 'react'

export default function ScrollReveal({ children, className = '' }) {
  // useRef gives us a handle on the actual element on the page.
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect() // only needs to happen once
        }
      },
      { threshold: 0.2 } // when 20% of it is visible
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${revealed ? 'revealed' : ''} ${className}`}>
      {children}
    </div>
  )
}
