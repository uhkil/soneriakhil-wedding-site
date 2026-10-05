// A wrapper used by every section of the page.
// It handles the shared layout (full-screen height, spacing, centered
// content) so each section file only has to worry about its own content.
// Usage: <Section id="travel"> ...content... </Section>
// Add className="section-field" for a light sand background.
export default function Section({ id, className = '', children }) {
  return (
    <section id={id} className={`section ${className}`}>
      <div className="section-inner">{children}</div>
    </section>
  )
}
