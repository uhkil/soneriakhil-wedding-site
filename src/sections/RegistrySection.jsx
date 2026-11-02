// Link out to the gift registry.
import Section from '../components/Section.jsx'
import IllustrationSlot from '../components/IllustrationSlot.jsx'

export default function RegistrySection() {
  return (
    <Section id="registry" className="quiet">
      {/* Corner art just above the title (see "corner-art" in index.css). */}
      <IllustrationSlot name="registryVignette" size="small" className="corner-art corner-art-left" />
      <h2>
        Registry
        {/* Two hands making a heart (see .title-hands in index.css). */}
        <span className="title-hands" aria-hidden="true" />
      </h2>
      <p>Placeholder text about the registry.</p>
      {/* Replace "#" with the real registry URL later. */}
      <a className="button button-outline" href="#">View our registry</a>
    </Section>
  )
}
