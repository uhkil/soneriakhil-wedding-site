// Makes web-sized copies of photos, for scripts/sync-memories.sh.
//
//   swift scripts/web-photo.swift <original> <copy.jpg> [<original> <copy.jpg> ...]
//
// For each photo: turns it the right way up, shrinks it to at most 1600px on
// its longest side (or WEB_PHOTO_MAX), converts its colors to sRGB (what every screen expects),
// and saves it as a JPEG. The copy holds only the picture: no location (GPS),
// camera details, dates or other hidden information, because only the pixels
// are copied across. Reads anything the Mac can open (JPEG, PNG, HEIC, ...).
// Uses Apple's built-in ImageIO, so nothing needs installing.
import Foundation
import ImageIO
import CoreGraphics
import UniformTypeIdentifiers

// Longest side, in pixels: 1600 unless WEB_PHOTO_MAX says otherwise
// (e.g. WEB_PHOTO_MAX=1000 for photos shown small, like the pop-up cards').
let maxSide = Int(ProcessInfo.processInfo.environment["WEB_PHOTO_MAX"] ?? "") ?? 1600
let quality = 0.8

func convert(_ input: String, _ output: String) -> Bool {
  guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: input) as CFURL, nil) else { return false }
  let options: [CFString: Any] = [
    kCGImageSourceCreateThumbnailFromImageAlways: true,
    kCGImageSourceCreateThumbnailWithTransform: true, // the right way up
    kCGImageSourceThumbnailMaxPixelSize: maxSide,
  ]
  guard let image = CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary) else { return false }

  // Redraw it in sRGB, on white (in case of see-through parts, e.g. a PNG).
  let srgb = CGColorSpace(name: CGColorSpace.sRGB)!
  guard let context = CGContext(
    data: nil, width: image.width, height: image.height, bitsPerComponent: 8, bytesPerRow: 0,
    space: srgb, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue
  ) else { return false }
  let rect = CGRect(x: 0, y: 0, width: image.width, height: image.height)
  context.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
  context.fill(rect)
  context.draw(image, in: rect)
  guard let clean = context.makeImage() else { return false }

  // Save only the picture and its quality setting: no other information.
  guard let destination = CGImageDestinationCreateWithURL(
    URL(fileURLWithPath: output) as CFURL, UTType.jpeg.identifier as CFString, 1, nil
  ) else { return false }
  CGImageDestinationAddImage(destination, clean, [kCGImageDestinationLossyCompressionQuality: quality] as CFDictionary)
  return CGImageDestinationFinalize(destination)
}

let args = Array(CommandLine.arguments.dropFirst())
var failed = false
for i in stride(from: 0, to: args.count - 1, by: 2) {
  if !convert(args[i], args[i + 1]) {
    FileHandle.standardError.write("Couldn't convert: \(args[i])\n".data(using: .utf8)!)
    failed = true
  }
}
exit(failed ? 1 : 0)
