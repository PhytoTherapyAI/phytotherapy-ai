// © 2026 DoctoPal — All Rights Reserved
//
// PWA placeholder icon generator. Reads public/icon.svg, writes five
// PNGs into public/. Run via `npm run pwa:icons` whenever the source
// SVG changes (e.g. when the real logo finally lands).
//
// All output files are committed to the repo so Vercel builds don't
// have to run sharp at deploy time. sharp itself stays in
// devDependencies — production never imports it.

import sharp from "sharp"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, "..", "public")
const SVG_PATH = join(PUBLIC_DIR, "icon.svg")

// #059669 emerald-600 — brand color. Kept in sync with manifest.json
// theme_color and the SVG's <rect fill>. If the brand color ever
// changes, update all three together.
const EMERALD = { r: 5, g: 150, b: 105, alpha: 1 }

async function main() {
  const svg = await readFile(SVG_PATH)

  // 1. Standard PWA icons. The source SVG carries rounded corners
  // (rx=96), so the resulting PNGs have transparent corners outside
  // the rounded rect. Chrome / Edge / Safari handle this correctly
  // in the install card — they treat the transparent area as
  // background.
  await sharp(svg)
    .resize(192, 192)
    .png({ quality: 90 })
    .toFile(join(PUBLIC_DIR, "icon-192.png"))
  console.log("✓ icon-192.png (192×192)")

  await sharp(svg)
    .resize(512, 512)
    .png({ quality: 90 })
    .toFile(join(PUBLIC_DIR, "icon-512.png"))
  console.log("✓ icon-512.png (512×512)")

  // 2. Maskable icon. Spec requires the entire 512×512 to be filled
  // because Android can apply circle / squircle / rounded-square
  // masks that chew up to 20% of the edges. We render the source SVG
  // at 408×408 (so the visible logo lives inside the 80% safe zone)
  // and composite it onto a solid emerald 512×512 canvas — that way
  // the masked-off region stays brand-colored regardless of which
  // mask shape Android picks.
  const innerBuffer = await sharp(svg).resize(408, 408).png().toBuffer()
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: EMERALD,
    },
  })
    .composite([{ input: innerBuffer, top: 52, left: 52 }])
    .png({ quality: 90 })
    .toFile(join(PUBLIC_DIR, "icon-maskable.png"))
  console.log("✓ icon-maskable.png (512×512, 80% safe zone)")

  // 3. apple-touch-icon. iOS rounds the corners automatically when
  // the icon lands on the home screen, so we square the icon by
  // FLATTENING transparent regions onto emerald. If we shipped our
  // SVG's rounded corners directly, iOS would round the already-
  // rounded shape and leave visible white triangles in the cutoff.
  await sharp(svg)
    .resize(180, 180)
    .flatten({ background: EMERALD })
    .png({ quality: 90 })
    .toFile(join(PUBLIC_DIR, "apple-touch-icon.png"))
  console.log("✓ apple-touch-icon.png (180×180, square + emerald flatten)")

  // 4. Favicon. 32×32 single PNG — modern browsers (Chrome / Safari /
  // Edge / modern Firefox) accept this without a multi-size .ico.
  // Old IE / pre-2018 Firefox fall back to whatever the browser
  // generates from the <link> chain in layout.tsx; we accept the
  // tradeoff for one fewer dev dependency.
  await sharp(svg)
    .resize(32, 32)
    .png({ quality: 90 })
    .toFile(join(PUBLIC_DIR, "favicon.png"))
  console.log("✓ favicon.png (32×32)")

  console.log("\nPWA icon set generated successfully.")
}

main().catch((err) => {
  console.error("Icon generation failed:", err)
  process.exit(1)
})
