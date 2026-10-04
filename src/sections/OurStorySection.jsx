// Our story, told in short moments. Each moment has some text and a photo.
import Section from '../components/Section.jsx'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'

// Edit this list to add, remove, or reorder moments.
const moments = [
  { title: 'How we met', text: 'Placeholder text about how we met.' },
  { title: 'First date', text: 'Placeholder text about our first date.' },
  { title: 'The proposal', text: 'Placeholder text about the proposal.' },
]

export default function OurStorySection() {
  return (
    <Section id="story">
      <h2>Our Story</h2>
      {moments.map((moment) => (
        <div key={moment.title} className="story-moment">
          <ImagePlaceholder label={`${moment.title} photo`} height={200} />
          <div>
            <h3>{moment.title}</h3>
            <p>{moment.text}</p>
          </div>
        </div>
      ))}
    </Section>
  )
}
