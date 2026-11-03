// Rules for the email and phone boxes on the RSVP form. The Google Sheet's
// script (apps-script/Code.gs) has its own copy of these, so keep them in step.

// An email: something@something.ending, where the ending is 2+ letters.
export const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i
// Common slips on ".com" that would otherwise look like a real ending.
export const COM_TYPO = /\.(con|cmo|ocm|vom|xom|cpm|comm|coom|om)$/i

// Tidies a phone number as it's typed: only digits are kept, plus a "+" at
// the very start for numbers outside the US.
//   US (no "+"):   214-555-1234      (a pasted leading 1 is dropped)
//   +1 (US/Canada): +1 214-555-1234
//   +91 (India):   +91 98765 43210
//   +44 (UK):      +44 7911 123456   (the 0 people often type first is dropped)
//   anywhere else: +33612345678
export function formatPhone(text) {
  const raw = String(text).trim()
  let d = raw.replace(/\D/g, '')
  if (!raw.startsWith('+')) {
    if (d.length === 11 && d[0] === '1') d = d.slice(1)
    return usStyle(d.slice(0, 10))
  }
  d = d.slice(0, 15) // the longest phone numbers in the world
  if (d.startsWith('1')) return joinParts('+1', [usStyle(d.slice(1, 11))])
  if (d.startsWith('91')) return joinParts('+91', groups(d.slice(2, 12), [5, 5]))
  if (d.startsWith('44')) {
    const rest = d.slice(2).replace(/^0/, '')
    return joinParts('+44', groups(rest.slice(0, 10), [4, 6]))
  }
  return '+' + d
}

// Is it a whole phone number (after formatPhone)?
export function isValidPhone(phone) {
  return (
    /^\d{3}-\d{3}-\d{4}$/.test(phone) || // US
    /^\+1 \d{3}-\d{3}-\d{4}$/.test(phone) || // US / Canada
    /^\+91 \d{5} \d{5}$/.test(phone) || // India
    /^\+44 \d{4} \d{5,6}$/.test(phone) || // UK
    (/^\+\d{8,15}$/.test(phone) && !/^\+(1|91|44)/.test(phone)) // anywhere else
  )
}

function usStyle(d) {
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6)].filter(Boolean).join('-')
}
function groups(d, sizes) {
  const parts = []
  let i = 0
  for (const n of sizes) {
    if (i < d.length) parts.push(d.slice(i, i + n))
    i += n
  }
  return parts
}
function joinParts(code, parts) {
  return [code, ...parts.filter(Boolean)].join(' ')
}

// Partly hidden versions of saved contact info, so guests can check what's on
// file without the whole thing being shown:
//   priya.shah@gmail.com → p•••h@gmail.com
//   214-555-1234         → •••-•••-1234
//   +91 98765 43210      → +91 ••••• •3210
export function maskEmail(email) {
  const at = email.lastIndexOf('@')
  if (at < 1) return '•••'
  const local = email.slice(0, at)
  const shown = local.length <= 2 ? local[0] + '•••' : local[0] + '•••' + local.slice(-1)
  return shown + email.slice(at)
}
export function maskPhone(phone) {
  const [, code = '', rest] = String(phone).match(/^(\+\d+ )?(.*)$/)
  let keep = 4 // digits to leave showing, counted from the end
  const hidden = [...rest]
    .reverse()
    .map((ch) => (/\d/.test(ch) ? (keep-- > 0 ? ch : '•') : ch))
    .reverse()
    .join('')
  return code + hidden
}
