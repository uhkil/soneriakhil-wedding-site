// The mailing address on the RSVP form: one per invitation. The Google
// Sheet's script (apps-script/Code.gs) checks and formats it the same way.

export const COUNTRIES = [
  ['US', 'United States'],
  ['CA', 'Canada'],
  ['IN', 'India'],
  ['GB', 'United Kingdom'],
  ['OTHER', 'Another country'],
]

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

export const blankAddress = () => ({ country: 'US', otherCountry: '', street: '', apt: '', city: '', state: '', zip: '' })

// Has the guest typed anything (other than picking a country)?
export const isStarted = (a) => ['otherCountry', 'street', 'apt', 'city', 'state', 'zip'].some((k) => a[k].trim())

export const ZIP = /^\d{5}(-\d{4})?$/

// What's missing or wrong, in the order the boxes appear: [{ field, message }].
export function addressProblems(a) {
  const list = []
  const us = a.country === 'US'
  if (a.country === 'OTHER' && !a.otherCountry.trim()) list.push({ field: 'otherCountry', message: 'Please add the country.' })
  if (!a.street.trim()) list.push({ field: 'street', message: 'Please add the street address.' })
  if (us) {
    if (!a.zip.trim()) list.push({ field: 'zip', message: 'Please add the ZIP code.' })
    else if (!ZIP.test(a.zip.trim())) list.push({ field: 'zip', message: 'Please check the ZIP code (5 digits).' })
  }
  if (!a.city.trim()) list.push({ field: 'city', message: 'Please add the city.' })
  if (us && !US_STATES.some(([code]) => code === a.state)) list.push({ field: 'state', message: 'Please choose the state.' })
  return list
}

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
