// Frequently asked questions. Each question can be clicked to show its answer.
// This uses the built-in HTML <details> and <summary> tags, which handle
// opening and closing on their own (no extra code needed).
import Section from '../components/Section.jsx'

// Edit this list to add, remove, or change questions.
const faqs = [
  { question: 'What should I wear?', answer: 'Placeholder: attire for each event is listed in the Events section.' },
  { question: 'Can I bring a plus-one?', answer: 'Placeholder answer.' },
  { question: 'Are kids welcome?', answer: 'Placeholder answer.' },
  { question: 'Where should I park?', answer: 'Placeholder answer.' },
  { question: 'What will the weather be like in April?', answer: 'Placeholder answer about Dallas weather in April.' },
  { question: 'When is the RSVP deadline?', answer: 'Placeholder answer.' },
]

export default function FaqSection() {
  return (
    <Section id="faq">
      <h2>FAQ</h2>
      <div className="faq-list">
        {faqs.map((faq) => (
          <details key={faq.question} className="faq-item">
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
