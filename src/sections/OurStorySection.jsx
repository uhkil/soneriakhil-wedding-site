// Our story, told in short moments. Each moment has a number, a title, some
// text, and a photo; the photo and text swap sides from one moment to the next.
import Section from '../components/Section.jsx'
import PhotoSlot from '../components/PhotoSlot.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'
import Art from '../components/Art.jsx'

// Edit this list to add, remove, or reorder moments.
// "photo" is the image file (e.g. 'assets/story/how-we-met.jpg'); empty = placeholder.
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
        <Art file="blueberry.webp" className="title-berry" />
        Our Story
        <Art file="blueberry.webp" className="title-berry mirrored" />
      </h2>
      <ol className="story-list">
        {moments.map((moment, index) => (
          // Each moment fades in as you scroll to it.
          <ScrollReveal key={moment.title} as="li" className="story-moment">
            <PhotoSlot src={moment.photo} label={`${moment.title} photo`} alt={moment.title} className="story-photo" />
            <div className="story-text">
              <p className="story-number">{String(index + 1).padStart(2, '0')}</p>
              <h3>{moment.title}</h3>
              <p>{moment.text}</p>
            </div>
          </ScrollReveal>
        ))}
      </ol>
    </Section>
  )
}
