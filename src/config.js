// Site-wide settings.

// The RSVP back end: the Google Apps Script web app inside the private
// wedding Sheet (see apps-script/SETUP.md). This address is meant to be
// public; it only answers specific questions and needs the wedding passcode
// before it shares anything about a guest.
// For a trial run on this computer only (npm run dev), a test copy's address
// can go in a file called .env.local:  VITE_TEST_RSVP_API_URL=https://…/exec
// (that file is never uploaded, and the live site always uses the one below).
const TEST_URL = import.meta.env.DEV ? import.meta.env.VITE_TEST_RSVP_API_URL : ''
export const RSVP_API_URL =
  TEST_URL ||
  'https://script.google.com/macros/s/AKfycbxJvo0IFqrcgc_0Y9vBAGt11jPOLovI0g-u3ua8aU2ikQozCCAHZL3oi7_VdyRzQIWG/exec'
