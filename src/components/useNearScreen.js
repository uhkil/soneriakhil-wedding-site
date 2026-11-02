// True once the element is within about a screen and a half of being
// scrolled into view (and stays true). Used to start downloading drawings just
// before the guest reaches them, instead of all at once when the page opens.
import { useEffect, useState } from 'react'

export function useNearScreen(ref, margin = '1200px') {
  const [near, setNear] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (near || !element) return
    // Very old browsers without this feature just load everything right away.
    if (!('IntersectionObserver' in window)) return setNear(true)
    const observer = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && setNear(true),
      { rootMargin: `${margin} 0px` }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, margin, near])

  return near
}
