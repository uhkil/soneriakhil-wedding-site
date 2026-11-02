// Frequently asked questions. Each question can be clicked to show its answer.
// This uses the built-in HTML <details> and <summary> tags, which handle
// opening and closing on their own. Only one answer is open at a time:
// opening one closes the others.
import Section from '../components/Section.jsx'
import Doodle from '../components/Doodle.jsx'

// Edit this list to add, remove, or change questions. An answer can include
// links: <a href="#events">…</a> jumps to a section of this page.
const faqs = [
  {
    question: 'What should I wear?',
    answer: (
      <>
        Each event has its own dress code. You’ll find the attire for every event (and a moodboard for
        inspiration) in the <a href="#events">Events section</a>.
      </>
    ),
  },
  {
    question: 'Can I bring a plus-one?',
    answer: 'If your invitation includes an additional guest, you’ll see a spot for them on your RSVP form.',
  },
  {
    question: 'Are kids welcome?',
    answer: 'If your children are listed on your RSVP form, they’re invited, and we can’t wait to see them!',
  },
  {
    question: 'Where should I park?',
    answer: 'More details to come. We’ll share parking information here closer to the wedding.',
  },
  {
    question: 'What will the weather be like in Arlington, TX in April?',
    answer: (
      <>
        April in Arlington is usually warm and pleasant, with daytime highs in the upper 70s °F and evenings in
        the mid 50s. Spring showers and the occasional thunderstorm are common, so we’d suggest bringing a light
        layer and an umbrella, just in case. You can{' '}
        <a href="https://www.accuweather.com/en/us/arlington/76006/april-weather/331134?year=2027" target="_blank" rel="noreferrer">
          check April weather in Arlington on AccuWeather
        </a>
        .
      </>
    ),
  },
  {
    question: 'When is the RSVP deadline?',
    answer: (
      <>
        Please RSVP by <strong>January 15, 2027</strong>. You can update your answers anytime before then.
      </>
    ),
  },
]

export default function FaqSection() {
  return (
    <Section id="faq">
      <h2>
        FAQ <Doodle type="sprig" size={36} />
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
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
