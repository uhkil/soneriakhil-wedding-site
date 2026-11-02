// The gift registry. For now, just a note that details are coming.
import Section from '../components/Section.jsx'
import IllustrationSlot from '../components/IllustrationSlot.jsx'
import Art from '../components/Art.jsx'

export default function RegistrySection() {
  return (
    <Section id="registry" className="quiet">
      {/* Corner art just above the title (see "corner-art" in index.css). */}
      <IllustrationSlot name="registryVignette" size="small" className="corner-art corner-art-left" />
      <h2>
        {/* The word stays centered on the page; the drawing of two hands
            making a heart hangs off its right side (see .title-hands). */}
        <span className="title-word">
          Registry
          <Art file="heart-hands.webp" className="title-hands" />
        </span>
      </h2>
      <p className="registry-note">More details to come.</p>
    </Section>
  )
}
