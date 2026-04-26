import { writeFileSync } from "fs";

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateSvg(size) {
  const fontSize = Math.round(size * 0.65);
  const y = Math.round(size * 0.75);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ec4899"/>
      <stop offset="50%" style="stop-color:#a855f7"/>
      <stop offset="100%" style="stop-color:#6366f1"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#bg)"/>
  <text x="${size / 2}" y="${y}" font-size="${fontSize}" text-anchor="middle" font-family="Arial">🧮</text>
</svg>`;
}

for (const size of sizes) {
  writeFileSync(`public/icons/icon-${size}x${size}.svg`, generateSvg(size));
}

console.log("Icons generated:", sizes.map(s => `icon-${s}x${s}.svg`).join(", "));
