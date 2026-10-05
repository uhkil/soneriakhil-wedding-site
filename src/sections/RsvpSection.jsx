// RSVP placeholder, with a closing illustration.
// Milestone 2 will add the real version here: guest name search,
// a popup to pick the right person if names match, and an RSVP form
// showing only the events that guest is invited to.
import Section from '../components/Section.jsx'
import IllustrationSlot from '../components/IllustrationSlot.jsx'

export default function RsvpSection() {
  return (
    <Section id="rsvp" className="quiet">
      <h2>RSVP</h2>
      <p>Placeholder: RSVP form coming soon.</p>
      <IllustrationSlot name="rsvpCouple" size="large" className="rsvp-art" />
    </Section>
  )
}
