// A small message that slides up at the bottom of the screen for a few
// seconds (e.g. "Moodboard coming soon!").
// Anywhere on the site: showToast('message'). <Toaster /> (in App.jsx) shows it.
import { useEffect, useState } from 'react'

export function showToast(message) {
  window.dispatchEvent(new CustomEvent('toast', { detail: message }))
}

export default function Toaster() {
  const [toast, setToast] = useState(null) // { message, key }

  useEffect(() => {
    const onToast = (e) => setToast({ message: e.detail, key: Date.now() })
    window.addEventListener('toast', onToast)
    return () => window.removeEventListener('toast', onToast)
  }, [])

  // Hide it again after a few seconds (a new message restarts the clock).
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  // role="status": screen readers announce the message politely.
  return (
    <div className="toast-area" role="status" aria-live="polite">
      {toast && (
        <p key={toast.key} className="toast">
          {toast.message}
        </p>
      )}
    </div>
  )
}
