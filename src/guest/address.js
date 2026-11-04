// The mailing address on the RSVP form: one per invitation. The Google
// Sheet's script (apps-script/Code.gs) checks and formats it the same way.

// US states (plus DC, territories, and military mail), for the State menu.
export const US_STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'],
  ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
  ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'],
  ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
  ['AS', 'American Samoa'], ['GU', 'Guam'], ['MP', 'Northern Mariana Islands'], ['PR', 'Puerto Rico'],
  ['VI', 'U.S. Virgin Islands'], ['AA', 'Armed Forces Americas'], ['AE', 'Armed Forces Europe'],
  ['AP', 'Armed Forces Pacific'],
]

// country: 'US', or 'INTL' once the guest checks "I don't live in the
// United States" (then otherCountry is the country they type, if any).
export const blankAddress = () => ({ country: 'US', otherCountry: '', street: '', apt: '', city: '', state: '', zip: '' })

// Has the guest typed anything?
export const isStarted = (a) => ['otherCountry', 'street', 'apt', 'city', 'state', 'zip'].some((k) => a[k].trim())

export const ZIP = /^\d{5}(-\d{4})?$/

// What the Sheet says (party.addressOnFile) for an invitation that checked
// "I don't live in the United States". ('your country' is from an older
// version of the Sheet's script.)
export const livesAbroad = (onFile) => onFile === 'outside the US' || onFile === 'your country'

// What's sent for "I don't live in the United States" (no address).
export const ABROAD = { country: 'INTL', otherCountry: 'Outside the US', street: '', apt: '', city: '', state: '', zip: '' }

// The boxes as a guest first sees them: the checkbox already checked if
// they said before that they live outside the US.
export const startingAddress = (onFile) => ({ ...blankAddress(), country: livesAbroad(onFile) ? 'INTL' : 'US' })

// What's missing or wrong, in the order the boxes appear: [{ field, message }].
// "saved" is the address on file (partly hidden): a box left blank keeps its
// saved part, so it only needs filling in if nothing is saved there.
// Outside the US there's nothing to add.
export function addressProblems(a, saved = null) {
  if (a.country !== 'US') return []
  const list = []
  const missing = (k) => !a[k].trim() && !saved?.[k]
  if (missing('street')) list.push({ field: 'street', message: 'Please add the street address.' })
  if (missing('city')) list.push({ field: 'city', message: 'Please add the city.' })
  if (a.state ? !US_STATES.some(([code]) => code === a.state) : !saved?.state) {
    list.push({ field: 'state', message: 'Please choose the state.' })
  }
  if (a.zip.trim() && !ZIP.test(a.zip.trim())) list.push({ field: 'zip', message: 'Please check the ZIP code (5 digits).' })
  else if (missing('zip')) list.push({ field: 'zip', message: 'Please add the ZIP code.' })
  return list
}

// The full name of a state code ("TX" → "Texas").
export const stateName = (code) => US_STATES.find(([c]) => c === code)?.[1] ?? code

// Looks up the city and state for a US ZIP code (a free service, zippopotam.us;
// it only ever sees the ZIP code). Returns { city, state } or null.
export async function lookUpZip(zip, signal) {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zip.slice(0, 5)}`, { signal })
    if (!response.ok) return null
    const place = (await response.json()).places?.[0]
    return place ? { city: place['place name'], state: place['state abbreviation'] } : null
  } catch {
    return null // offline, or the service is down: the guest just types them
  }
}
