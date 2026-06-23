import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sharp = require("./node_modules/sharp/lib/index.js");

const srcDir = join(__dirname, "../../fi-forgot/public/humor-v2");
const outDir = join(__dirname, "../../fi-forgot/public/humor-v2/captioned");
mkdirSync(outDir, { recursive: true });

const cards = [
  {
    file: "lord_fluffington_v2.png",
    lines: ["I REGRET NOTHING."],
  },
  {
    file: "coffee_before_humanity_v2.png",
    lines: ["COFFEE.", "THEN WE CAN DISCUSS", "YOUR PROBLEMS."],
  },
  {
    file: "golf_goose_v2.png",
    lines: ["I'VE INVESTED TOO MUCH", "TO WALK AWAY NOW."],
  },
];

// Card dimensions after load: 1024 x 1536
const W = 1024;
const H = 1536;
const FONT_SIZE = 52;
const LINE_H = 68;
const PADDING_BOTTOM = 80;

for (const card of cards) {
  const totalTextH = card.lines.length * LINE_H;
  const textTop = H - PADDING_BOTTOM - totalTextH;

  // Build SVG overlay
  const textElements = card.lines.map((line, i) => {
    const y = textTop + i * LINE_H + FONT_SIZE;
    return `
      <text x="${W / 2}" y="${y + 4}" 
        font-family="Georgia, serif" font-size="${FONT_SIZE}" font-weight="bold"
        fill="black" opacity="0.55" text-anchor="middle"
        letter-spacing="3">${line}</text>
      <text x="${W / 2}" y="${y}" 
        font-family="Georgia, serif" font-size="${FONT_SIZE}" font-weight="bold"
        fill="white" text-anchor="middle"
        letter-spacing="3">${line}</text>`;
  }).join("\n");

  // Gradient rect height
  const gradH = totalTextH + PADDING_BOTTOM + 60;
  const gradY = H - gradH;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="black" stop-opacity="0"/>
        <stop offset="100%" stop-color="black" stop-opacity="0.72"/>
      </linearGradient>
    </defs>
    <rect x="0" y="${gradY}" width="${W}" height="${gradH}" fill="url(#g)"/>
    ${textElements}
  </svg>`;

  const src = join(srcDir, card.file);
  const out = join(outDir, card.file);

  await sharp(src)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toFile(out);

  console.log(`Done: ${out}`);
}

console.log("\nAll captioned images saved.");
