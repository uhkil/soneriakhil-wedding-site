// Gently fades its contents in when they scroll into view.
// People who have "reduce motion" turned on in their device settings
// just see the content right away (handled in index.css).
// Usage: <ScrollReveal> ...anything... </ScrollReveal>
// "as" picks the kind of element it is (a <div> unless you say otherwise, e.g. as="li").
import { useEffect, useRef, useState } from 'react'

export default function ScrollReveal({ children, className = '', as: Tag = 'div' }) {
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
      // as soon as any of it is within 150px of the bottom of the screen, so
      // it's already fading in by the time it scrolls into view
      { threshold: 0, rootMargin: '0px 0px 150px 0px' }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag ref={ref} className={`reveal ${revealed ? 'revealed' : ''} ${className}`}>
      {children}
    </Tag>
  )
}
