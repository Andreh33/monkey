// Genera los iconos PWA (192/512 + maskable) a partir de src/app/icon.jpg
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = path.join(root, "src", "app", "icon.jpg");
const out = path.join(root, "public", "icons");

import { mkdirSync } from "node:fs";
mkdirSync(out, { recursive: true });

const bg = { r: 10, g: 10, b: 12, alpha: 1 }; // --color-bg-primary

async function square(size, file) {
  await sharp(src)
    .resize(size, size, { fit: "cover", position: "centre" })
    .png()
    .toFile(path.join(out, file));
  console.log("✓", file);
}

// Maskable: imagen con padding (safe zone) sobre fondo del tema
async function maskable(size, file) {
  const inner = Math.round(size * 0.78);
  const pad = Math.round((size - inner) / 2);
  const logo = await sharp(src)
    .resize(inner, inner, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(path.join(out, file));
  console.log("✓", file);
}

await square(192, "icon-192.png");
await square(512, "icon-512.png");
await maskable(512, "icon-maskable-512.png");
await maskable(192, "icon-maskable-192.png");
console.log("Listo.");
