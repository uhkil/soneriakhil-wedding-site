// Where to stay, getting there, and what to do: a pill toggle (like
// Memories') picks a topic, shown in one big dark-blue card that grows to
// fit its text.
import { useState } from 'react'
import Section from '../components/Section.jsx'
import SideDrawing from '../components/SideDrawing.jsx'
import ActivityIcon from '../components/ActivityIcons.jsx'

// ----- The details. -----
const ROOM_BLOCK = 'https://www.loewshotels.com/arlington-hotel/wedding-soneri-akhil-patel-wedding-room-block'

// "What to do": one card each, in this order (two across, one across on
// phones). icon is one of the drawings in components/ActivityIcons.jsx.
// link (optional): { words, href } turns those words of the text into a
// link, opening in a new tab. The words must appear in the text exactly.
const activities = [
  {
    title: 'Dallas Mavericks Game',
    icon: 'basketball',
    link: { words: 'Watch the Mavs', href: 'https://www.ticketmaster.com/dallas-mavericks-vs-memphis-grizzlies-dallas-texas-04-11-2027/event/0C00650C8E933CF3?landing=c' },
    text: 'Watch the Mavs take on the Memphis Grizzlies on Sunday, April 11 at 7:30\u00a0PM.',
  },
  {
    title: 'Perot Museum of Nature and Science',
    icon: 'dinosaur',
    link: { words: 'first date', href: 'https://maps.app.goo.gl/EzDT61jkJxUEaKHK9' },
    text: 'Where we had our first date, with stunning architecture and panoramic skyline views.',
  },
  {
    title: 'Pecan Hollow Golf Course',
    icon: 'golf',
    link: { words: 'high school course', href: 'https://maps.app.goo.gl/ySVPSC7A3zVH666f9' },
    text: 'Akhil’s high school course, and where Soneri threw her Sweet 16.',
  },
  {
    title: 'Dallas Arboretum',
    icon: 'flower',
    link: { words: '66 acres of gardens', href: 'https://maps.app.goo.gl/uW5kiWaXhUTPigA36' },
    text: 'Wander 66 acres of gardens on White Rock Lake, right in the middle of their spring bloom.',
  },
  {
    title: 'Deep Ellum & Bishop Arts',
    icon: 'palette',
    link: { words: 'Two vibrant neighborhoods', href: 'https://www.wander-lust.nl/dallas-deep-ellum-and-bishop-arts-district/' },
    text: 'Two vibrant neighborhoods with all things we luv: art galleries, shopping, and good food.',
  },
  {
    title: 'Six Flags Over Texas',
    icon: 'coaster',
    link: { words: 'Six Flags', href: 'https://maps.app.goo.gl/Eb3dWwjpczrC7Dwr7' },
    text: 'A day of roller coasters at the original Six Flags, just a 10\u2011minute drive from the hotel.',
  },
]

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
          <div>
            <dt>Room block dates</dt>
            <dd>April 8–11, 2027</dd>
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
  {
    id: 'what-to-do',
    title: 'What to do',
    body: (
      <>
        <p>A few of our favorite things to do in and around Dallas while you’re in town.</p>
        <ul className="activity-grid">
          {activities.map((a) => (
            <li key={a.title} className="activity-card">
              <ActivityIcon name={a.icon} />
              <div>
                <h4>{a.title}</h4>
                <p>
                  <TextWithLink text={a.text} link={a.link} />
                </p>
              </div>
            </li>
          ))}
        </ul>
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

// Text with some of its words as a link (see "link" in activities above).
function TextWithLink({ text, link }) {
  const at = link ? text.indexOf(link.words) : -1
  if (at === -1) return text
  return (
    <>
      {text.slice(0, at)}
      <a href={link.href} target="_blank" rel="noreferrer">
        {link.words}
      </a>
      {text.slice(at + link.words.length)}
    </>
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
