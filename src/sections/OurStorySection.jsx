// Our story, told in short moments. Each moment has some text and a photo.
import Section from '../components/Section.jsx'
import PhotoSlot from '../components/PhotoSlot.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'

// Edit this list to add, remove, or reorder moments.
// "photo" is the image file (e.g. 'images/how-we-met.jpg'); empty = placeholder.
const moments = [
  { title: 'How we met', text: 'Placeholder text about how we met.', photo: '' },
  { title: 'First date', text: 'Placeholder text about our first date.', photo: '' },
  { title: 'The proposal', text: 'Placeholder text about the proposal.', photo: '' },
]

export default function OurStorySection() {
  return (
    <Section id="story">
      <h2>
        {/* Little blueberry sprigs on either side (see .title-berry in index.css). */}
        <span className="title-berry" aria-hidden="true" />
        Our Story
        <span className="title-berry mirrored" aria-hidden="true" />
      </h2>
      {moments.map((moment, index) => (
        // Each moment fades in as you scroll to it.
        <ScrollReveal key={moment.title} className="story-moment">
          <PhotoSlot
            src={moment.photo}
            label={`${moment.title} photo`}
            alt={moment.title}
            // Tilt alternate photos in opposite directions.
            tilt={index % 2 === 0 ? -2 : 2}
          />
          <div className="story-text">
            <h3>{moment.title}</h3>
            <p>{moment.text}</p>
          </div>
        </ScrollReveal>
      ))}
    </Section>
  )
}
