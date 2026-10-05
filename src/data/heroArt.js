// Artwork for the Home hero animation.
//
// These are TEMPORARY prototype cutouts taken from the reference sheet.
// To swap in final art: replace the image files in
// public/assets/prototype/hero/ and update the numbers below.
//
// All numbers are in the image's own pixels:
//   w, h      the image's width and height
//   anchorX   the point (from the left edge) that stands on the character's
//             "spot" — roughly the middle of the body. The image's bottom
//             edge always sits on the ground line.
//   finger    where Akhil's spinning fingertip is (the ball sits on it)
//   hand      where Akhil's reaching hand is (Soneri's hand meets it)
//   shoulder  where Soneri's back shoulder is (her arm starts there)

const folder = 'assets/prototype/hero/'

const heroArt = {
  akhil: {
    wait: { src: folder + 'akhil-wait.png', w: 110, h: 268, anchorX: 64, finger: { x: 5, y: 55 } },
    watch: { src: folder + 'akhil-watch.png', w: 137, h: 264, anchorX: 64, finger: { x: 1, y: 51 } },
    follow: { src: folder + 'akhil-follow-02.png', w: 232, h: 263, anchorX: 100, hand: { x: 6, y: 100 } },
  },
  soneri: {
    // Soneri's cutouts are drawn a bit smaller than Akhil's, so she is
    // scaled up by this amount to keep their heights believable.
    scale: 1.08,
    run1: { src: folder + 'soneri-run-01.png', w: 175, h: 229, anchorX: 85 },
    run2: { src: folder + 'soneri-run-02.png', w: 164, h: 229, anchorX: 80 },
    cross: { src: folder + 'soneri-cross-reach.png', w: 218, h: 222, anchorX: 135 },
    lead1: { src: folder + 'soneri-lead-01.png', w: 168, h: 227, anchorX: 78, shoulder: { x: 78, y: 55 } },
    lead2: { src: folder + 'soneri-lead-02.png', w: 172, h: 230, anchorX: 78, shoulder: { x: 78, y: 57 } },
  },
  // How far ahead of Akhil Soneri runs while holding his hand
  // (from his body's anchor to her back shoulder).
  leadGap: 165,
  ball: { src: folder + 'basketball.png', diameter: 54 },
  hearts: [folder + 'heart-1.png', folder + 'heart-2.png', folder + 'heart-3.png'],
}

export default heroArt
