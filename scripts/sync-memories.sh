#!/bin/zsh
# Makes the Memories photos on the site match a folder of original photos
# (e.g. one on the Desktop).
#
#   scripts/sync-memories.sh ~/Desktop/"Wedding site memories"
#
#   - New photos (JPEG, PNG, HEIC from iPhones, WebP...) are converted to
#     JPEG and shrunk to at most 1600px on their longest side, so they look
#     sharp full screen but download quickly (about 200-400 KB each).
#   - The copies keep only the picture: location (GPS), camera details and
#     other hidden information are left out (see scripts/web-photo.swift).
#     The originals in your folder aren't changed.
#   - Photos that changed in the folder are converted again.
#   - Photos deleted from the folder are removed from the site.
# The web-sized copies go in src/assets/memories/, where the site finds them
# on its own (see MemoriesSection.jsx). File names can be anything.
# It also writes src/assets/memories/sizes.json (each photo's width and
# height), so the site knows which photos are portrait and which landscape.
#   scripts/sync-memories.sh --sizes-only   just rewrites sizes.json
# Uses "sips" and Swift, which come with macOS (Swift with Apple's free
# command line tools).
set -euo pipefail

source_dir="${1:?Give the folder of original photos, e.g. scripts/sync-memories.sh ~/Desktop/Memories}"
site_dir="$(cd "$(dirname "$0")/.." && pwd)/src/assets/memories"
mkdir -p "$site_dir"

# Each photo's width and height, as JSON: { "name.jpg": [width, height], ... }
write_sizes() {
  local out="$site_dir/sizes.json" first=1 w h
  {
    print "{"
    for copy in "$site_dir"/*.(jpg|jpeg|png|webp|avif)(N.); do
      w=$(sips -g pixelWidth "$copy" | awk '/pixelWidth/ {print $2}')
      h=$(sips -g pixelHeight "$copy" | awk '/pixelHeight/ {print $2}')
      (( first )) || print ","
      first=0
      printf '  "%s": [%s, %s]' "${copy:t}" "$w" "$h"
    done
    print "\n}"
  } > "$out"
}

if [[ "$source_dir" == "--sizes-only" ]]; then
  write_sizes
  echo "Rewrote sizes.json."
  exit 0
fi
[[ -d "$source_dir" ]] || { echo "No folder at: $source_dir"; exit 1 }

# A safe web file name: lowercase, spaces and odd characters → dashes.
web_name() {
  local base="${1:t:r}"
  base="${base:l}"
  base="$(print -r -- "$base" | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')"
  print -r -- "${base:-photo}.jpg"
}

typeset -A wanted
jobs=()
added=0 updated=0 removed=0
for original in "$source_dir"/*(N.); do
  case "${original:e:l}" in
    jpg|jpeg|png|heic|heif|webp|tif|tiff) ;;
    *) continue ;;
  esac
  name="$(web_name "$original")"
  wanted[$name]=1
  copy="$site_dir/$name"
  if [[ ! -e "$copy" ]]; then
    added=$((added + 1))
  elif [[ "$original" -nt "$copy" ]]; then
    updated=$((updated + 1))
  else
    continue
  fi
  jobs+=("$original" "$copy")
  echo "  + $name"
done

# Convert all the new and changed photos in one go.
if (( ${#jobs} )); then
  echo "Converting $(( ${#jobs} / 2 )) photo(s)..."
  swift "${0:A:h}/web-photo.swift" "${jobs[@]}"
fi

for copy in "$site_dir"/*.(jpg|jpeg|png|webp|avif)(N.); do
  if [[ -z "${wanted[${copy:t}]:-}" ]]; then
    rm "$copy"
    removed=$((removed + 1))
    echo "  - ${copy:t}"
  fi
done

write_sizes
total=$(ls "$site_dir" | grep -vc '^sizes.json$')
echo "Done: $added added, $updated updated, $removed removed. $total photos on the site ($(du -sh "$site_dir" | cut -f1))."
