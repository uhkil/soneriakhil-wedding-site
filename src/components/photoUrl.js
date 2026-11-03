// The web address for a photo.
//   - A path inside public/ (like 'assets/photos/x.jpg') gets the site's
//     folder added in front, so it works wherever the site is hosted.
//   - An address that's already complete (from a file imported in the code,
//     like the Memories photos) is used as is.
export function photoUrl(src) {
  return /^(\/|\.|[a-z]+:)/i.test(src) ? src : import.meta.env.BASE_URL + src
}
