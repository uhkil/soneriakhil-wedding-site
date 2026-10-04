// A wrapper used by every section of the page.
// It handles the shared layout (full-screen height, background, centered
// content) so each section file only has to worry about its own content.
// Usage: <Section id="travel"> ...content... </Section>
export default function Section({ id, children }) {
  return (
    <section id={id} className="section">
      <div className="section-inner">{children}</div>
    </section>
  )
}
