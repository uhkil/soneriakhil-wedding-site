// The RSVP section: the pool date drawing in its strip, the title, and the
// form (RsvpByEvent.jsx): two tabs, "Who's coming?" (Yes / No for each
// person at each event, or Accept / Decline for an invitation of one) and
// "Your details" (emails, phones, dietary restrictions, one mailing address, one
// note). Answers save to the Google Sheet; guests can come back and change
// them, and a pop-up celebrates each save (RsvpCelebration.jsx).
import Section from '../components/Section.jsx'
import SideDrawing from '../components/SideDrawing.jsx'
import RsvpByEvent from './RsvpByEvent.jsx'

export default function RsvpSection() {
  return (
    <Section id="rsvp" className="rsvp">
      {/* A side drawing just above the title, in its dark strip (see SideDrawing.jsx). */}
      <SideDrawing name="poolDate" side="left" />
      {/* Everything from the title down. It's always at least a screen tall
          (see .rsvp-body in index.css), so a link to RSVP can bring the
          title right up to the top of the screen. */}
      <div className="rsvp-body">
        <h2>RSVP</h2>
        <RsvpByEvent />
      </div>
    </Section>
  )
}
