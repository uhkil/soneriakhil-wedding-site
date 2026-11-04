// Our story, in four rows: some text beside a photo. The first row has the
// text on the left and the photo on the right; each row after that swaps
// sides. Some words open a photo in a pop-up window (see PhotoLink.jsx).
import Section from '../components/Section.jsx'
import PhotoSlot from '../components/PhotoSlot.jsx'
import PhotoLink from '../components/PhotoLink.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'
import Art from '../components/Art.jsx'

// Edit this list to change the story. Each row: its paragraphs, and "photo"
// (an image file, e.g. 'assets/story/farm.jpg'; empty = a placeholder).
// For the pop-up photos, add photo="assets/story/…" to a <PhotoLink>.
const rows = [
  {
    photo: '',
    alt: 'Soneri and Akhil at the blueberry farm',
    paragraphs: [
      <>
        Soneri and Akhil should have met earlier. They went to the same middle, junior high, and senior high schools,
        spent years just 1 block away from another (Soneri practically lived at Diyaanka’s house in the same
        neighborhood as Akhil), attended the same university (Hook ‘Em), and both moved to San Francisco to start
        their careers.
      </>,
      <>
        But it wasn’t until the fateful sunny Texas pandemic day, when Soneri parked her Jeep in the gravel lot of the{' '}
        <PhotoLink alt="The blueberry farm">blueberry farm</PhotoLink>, that their parallel lines converged. She was
        going to meet her friend Karan, who invited his cute SF roommate, Akhil. “You would get along,” he told them
        both.
      </>,
    ],
  },
  {
    photo: '',
    alt: 'Soneri and Akhil during the pandemic',
    paragraphs: [
      <>
        They spent the next many weeks sending each other Spotify links until Akhil finally mustered the courage to
        ask Soneri out. He wanted to hang out with her so bad, he presented{' '}
        <PhotoLink alt="Akhil’s 5 options">5 options</PhotoLink>, surely she’d be enticed by at least one.
      </>,
      <>
        It was a crush for the ages, one that would make <PhotoLink alt="David Archuletta">David Archuletta</PhotoLink>{' '}
        proud. Akhil read Soneri’s favorite books and watched her favorite TV shows, Soneri asked her brother to give
        her a crash course on the NBA. They spent many cozy pandemic days embroidering sweatshirts, biking, painting
        leaves, and having picnics. Soneri fell in love with Akhil’s giving nature, shared creativity, and ability to
        make her laugh like no one else ever had, and Akhil fell in love with her warmth, whimsy, and passion for
        living.
      </>,
    ],
  },
  {
    photo: '',
    alt: 'Soneri and Akhil in Central Park',
    paragraphs: [
      <>
        Since then, their two paths have fused together, through the cities they’ve called home (NY&gt;SF&gt;NY&gt;SF&gt;??),
        huge life transitions, moped joyrides, bad haircuts, <PhotoLink alt="One of their hikes">hikes</PhotoLink> that
        terrify their mothers, begrudgingly shared <PhotoLink alt="A shared affogato">affogatos</PhotoLink>, and many,
        many thai massages.
      </>,
      <>
        Last spring, Akhil got down on one knee in <PhotoLink alt="The proposal in Central Park">Central Park</PhotoLink>{' '}
        and asked Soneri to marry him (Soneri would like you to know that she too proposed to Akhil). While they could
        have met earlier, they will happily accept the lifetime ahead! And now, these two cannot wait to get married
        and celebrate their love for each other and the community that supports them.
      </>,
    ],
  },
  {
    photo: '',
    alt: 'The Blueberry Babes',
    paragraphs: [<>The many adventures of the Blueberry Babes continue…</>],
  },
]

export default function OurStorySection() {
  return (
    <Section id="story">
      <h2>
        {/* The words stay centered on the page, with a little cluster of
            blueberries on either side (see .title-berry in index.css). */}
        <span className="title-word">
          <Art file="blueberry.webp" className="title-berry" />
          Our Story
          <Art file="blueberry.webp" className="title-berry mirrored" />
        </span>
      </h2>
      <div className="story-list">
        {rows.map((row, index) => (
          // Each row fades in as you scroll to it.
          <ScrollReveal key={index} className="story-moment">
            <PhotoSlot src={row.photo} label="Photo" alt={row.alt} className="story-photo" />
            <div className="story-text">
              {row.paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </Section>
  )
}
