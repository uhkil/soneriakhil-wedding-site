// The Home banner for the House of Honey design: huge bold names with a
// flowing script ampersand, the date and place on the left, a welcome on the
// right, then a full-width photo carousel.
import PhotoCarousel from './PhotoCarousel.jsx'

export default function HoneyBanner({ welcome }) {
  return (
    <div className="honey">
      <div className="honey-banner">
        <h1 className="honey-names">
          <span>Soneri</span>
          <span className="honey-and" aria-label="and">
            &amp;
          </span>
          <span>Akhil</span>
        </h1>
        <div className="honey-details">
          <p>
            April 9–10, 2027
            <br />
            Dallas, Texas
          </p>
          <p className="honey-welcome">
            Welcome,
            <br />
            {welcome}
          </p>
        </div>
      </div>
      <PhotoCarousel />
    </div>
  )
}
