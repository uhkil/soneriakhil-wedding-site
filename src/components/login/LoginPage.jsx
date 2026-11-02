// What visitors see before they log in: just an invitation card with the
// "Find your invitation" form. Nothing else on the site shows until then.
import FindInvitation from './FindInvitation.jsx'
import { useGuest } from '../../guest/GuestProvider.jsx'

export default function LoginPage() {
  const { status } = useGuest()

  return (
    <main className="login-page">
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
        <div className="invitation-rule" aria-hidden="true" />

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
