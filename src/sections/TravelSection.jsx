// Getting there and where to stay: a pill toggle (like Memories') picks a
// topic, shown in one big dark-blue card that grows to fit its text.
import { useState } from 'react'
import Section from '../components/Section.jsx'
import IllustrationSlot from '../components/IllustrationSlot.jsx'
import SideDrawing from '../components/SideDrawing.jsx'

// ----- The details. -----
const ROOM_BLOCK = 'https://www.loewshotels.com/arlington-hotel/wedding-soneri-akhil-patel-wedding-room-block'

// ----- The topics (one tab each, in this order; the first shows first). -----
// A topic can hold as much as it needs: paragraphs, lists, boxes and links.
const topics = [
  {
    id: 'where-to-stay',
    title: 'Where to stay',
    body: (
      <>
        <p className="travel-lead">
          We recommend staying at <strong>Loews Arlington</strong>. It’s connected to Live! by Loews, where most of the
          wedding events will be held, and we’ve secured a discounted room rate for our guests.
        </p>

        {/* The key details, side by side (stacked on phones). */}
        <dl className="travel-stats">
          <div>
            <dt>Hotel</dt>
            <dd>Loews Arlington</dd>
          </div>
          <div>
            <dt>Book by</dt>
            <dd>March 1, 2027</dd>
          </div>
        </dl>

        {/* The one thing not to miss: book through the room block. */}
        <div className="travel-callout">
          <p className="travel-callout-title">Please book through our room block</p>
          <p>The discounted rate is only available through our link. Rooms booked any other way will cost more.</p>
          {/* Opens the hotel's booking page in a new tab. */}
          <a className="button travel-callout-button" href={ROOM_BLOCK} target="_blank" rel="noreferrer">
            Book with our room block
            <ExternalIcon />
          </a>
        </div>
      </>
    ),
  },
  {
    id: 'getting-there',
    title: 'Getting there',
    body: (
      <>
        <p>Arlington sits between Dallas and Fort Worth, so there are two airports to choose from.</p>
        <div className="travel-boxes">
          <div className="travel-box">
            <p className="travel-box-label">Likely your best option</p>
            <h4>DFW International</h4>
            <p>A 15-minute drive (12 miles) from the hotel.</p>
          </div>
          <div className="travel-box">
            <p className="travel-box-label">If you fly Southwest or Delta</p>
            <h4>Dallas Love Field</h4>
            <p>A 25-minute drive (21 miles) from the hotel.</p>
          </div>
        </div>
      </>
    ),
  },
]

export default function TravelSection() {
  return (
    <Section id="travel">
      {/* A side drawing just above the title, in its dark strip (see SideDrawing.jsx). */}
      <SideDrawing name="museumDate" side="right" />
      <h2>Travel &amp; Accommodations</h2>
      <TravelTabs />
    </Section>
  )
}

// The pill toggle (the same look as Memories') picks a topic; that topic
// fills one big dark-blue card.
function TravelTabs() {
  const [current, setCurrent] = useState(topics[0].id)
  const index = topics.findIndex((t) => t.id === current)
  const topic = topics[index]
  return (
    <div className="travel-tabs">
      <div className="view-toggle travel-toggle" role="tablist" aria-label="Travel topics" style={{ '--index': index, '--count': topics.length }}>
        {topics.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === current}
            className={t.id === current ? 'selected' : ''}
            onClick={() => setCurrent(t.id)}
          >
            {t.title}
          </button>
        ))}
      </div>
      <div className="travel-card travel-panel" role="tabpanel" aria-label={topic.title}>
        <h3 className="card-pill">{topic.title}</h3>
        <div className="travel-text">{topic.body}</div>
      </div>
    </div>
  )
}

// A small arrow out of a box: "this opens another website".
function ExternalIcon() {
  return (
    <svg className="external-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  )
}
