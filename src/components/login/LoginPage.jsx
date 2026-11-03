// What visitors see before they log in: just an invitation card with the
// "Find your invitation" form. Nothing else on the site shows until then.
import FindInvitation from './FindInvitation.jsx'
import Art from '../Art.jsx'
import { useGuest } from '../../guest/GuestProvider.jsx'

// The line repeated behind the card.
const PHRASE = 'we can’t wait to celebrate with you'

export default function LoginPage() {
  const { status } = useGuest()

  return (
    <main className="login-page">
      {/* Behind the card: one line repeated across every row of the screen. */}
      <div className="login-backdrop" aria-hidden="true">
        {Array.from({ length: 40 }, (_, row) => (
          <p key={row}>{`${PHRASE} · `.repeat(8)}</p>
        ))}
      </div>
      <div className="invitation-card">
        {/* One line, like the names at the top of the site: bold capitals with
            a flowing script "&". */}
        <p className="invitation-names">
          Soneri{' '}
          <span className="invitation-and" aria-label="and">
            &amp;
          </span>{' '}
          Akhil
        </p>
        <p className="invitation-details">April 9–10, 2027 · Arlington, TX</p>
        {/* The two hands making a heart (the same drawing as beside the Registry title). */}
        <Art file="heart-hands.webp" className="invitation-hands" />

        {/* While a saved login is being checked, show a short message instead of the form. */}
        {status === 'checking' ? (
          <p className="invitation-status">Opening your invitation…</p>
        ) : (
          <FindInvitation />
        )}
      </div>
    </main>
  )
}
