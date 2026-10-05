// Link out to the gift registry.
import Section from '../components/Section.jsx'
import Doodle from '../components/Doodle.jsx'

export default function RegistrySection() {
  return (
    <Section id="registry" className="quiet">
      <Doodle type="gift" size={56} />
      <h2>Registry</h2>
      <p>Placeholder text about the registry.</p>
      {/* Replace "#" with the real registry URL later. */}
      <a className="button button-outline" href="#">View our registry</a>
    </Section>
  )
}
