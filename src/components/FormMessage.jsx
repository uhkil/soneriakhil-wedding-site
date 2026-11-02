// A short message under a form: an error (what to fix) or a success (it worked),
// with a small icon so it reads at a glance. Screen readers announce it.
// Usage: <FormMessage id="login-error">That passcode doesn't match.</FormMessage>
//        <FormMessage kind="success">Your RSVP is saved.</FormMessage>
export default function FormMessage({ kind = 'error', id, children }) {
  const error = kind === 'error'
  return (
    <p id={id} className={error ? 'form-error' : 'form-success'} role={error ? 'alert' : 'status'}>
      <svg className="form-message-icon" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="9" />
        {error ? <path d="M10 5.5v5.5M10 14.2v.3" /> : <path d="M6 10.4l2.6 2.6L14 7.6" />}
      </svg>
      <span>{children}</span>
    </p>
  )
}
