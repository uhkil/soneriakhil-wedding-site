// Frequently asked questions. Each question can be clicked to show its answer.
// This uses the built-in HTML <details> and <summary> tags, which handle
// opening and closing on their own. Only one answer is open at a time:
// opening one closes the others.
import Section from '../components/Section.jsx'
import Art from '../components/Art.jsx'

// Edit this list to add, remove, or change questions. Each answer is a short
// list of points (shown as bullets). A point can include links:
// <a href="#events">…</a> jumps to a section of this page.
const faqs = [
  {
    question: 'What should I wear?',
    answer: [
      'Each event has its own dress code.',
      <>
        You’ll find the attire for every event (and a moodboard for inspiration) in the{' '}
        <a href="#events">Events section</a>.
      </>,
    ],
  },
  {
    question: 'Can I bring a plus-one?',
    answer: ['If your invitation includes an additional guest, you’ll see a spot for them on your RSVP form.'],
  },
  {
    question: 'Are kids welcome?',
    answer: ['If your children are listed on your RSVP form, they’re invited.', 'We can’t wait to see them!'],
  },
  {
    question: 'Where should I park?',
    answer: ['More details to come.', 'We’ll share parking information here closer to the wedding.'],
  },
  {
    question: 'What will the weather be like in Arlington, TX in April?',
    answer: [
      'April is usually warm and pleasant: daytime highs in the upper 70s °F, evenings in the mid 50s.',
      'Spring showers and the occasional thunderstorm are common.',
      'We’d suggest bringing a light layer and an umbrella, just in case.',
      <>
        <a href="https://www.accuweather.com/en/us/arlington/76006/april-weather/331134?year=2027" target="_blank" rel="noreferrer">
          Check April weather in Arlington on AccuWeather
        </a>
        .
      </>,
    ],
  },
  {
    question: 'When is the RSVP deadline?',
    answer: [
      <>
        Please RSVP by <strong>January 15, 2027</strong>.
      </>,
      'You can update your answers anytime before then.',
    ],
  },
]

export default function FaqSection() {
  return (
    <Section id="faq">
      <h2>
        {/* The word stays centered on the page, between the two of us (sized
            and placed like the Memories title): Akhil on the left being
            silly, Soneri on the right looking his way through binoculars at
            a hummingbird behind his head. */}
        <span className="title-word">
          {/* A hummingbird hiding behind Akhil's head: what Soneri is trying
              to see, with Akhil in the way (see .title-hummingbird). */}
          <Art file="hummingbird.webp" className="title-hummingbird" />
          <Art file="faq-boy.webp" className="title-side title-left title-faq-boy" />
          FAQ
          <Art file="faq-girl.webp" className="title-side title-right title-faq-girl" />
        </span>
      </h2>
      <div className="faq-list">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="faq-item"
            name="faq" // newer browsers keep just one open on their own
            onToggle={(e) => {
              // Older browsers: close the others when this one opens.
              if (!e.currentTarget.open) return
              document.querySelectorAll('.faq-item[open]').forEach((d) => d !== e.currentTarget && (d.open = false))
            }}
          >
            <summary>{faq.question}</summary>
            <ul className="faq-answer">
              {faq.answer.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </Section>
  )
}
