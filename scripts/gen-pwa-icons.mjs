// Genera el favicon y los iconos PWA a partir de la imagen del mono (brand asset).
// Uso: node scripts/gen-pwa-icons.mjs [rutaImagenOrigen]
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdirSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// La imagen maestra vive en el repo para que sea reproducible.
const master = path.join(root, "src", "app", "icon.jpg");
const src = process.argv[2] || master;
const appDir = path.join(root, "src", "app");
const out = path.join(root, "public", "icons");
mkdirSync(out, { recursive: true });

const bg = { r: 0, g: 0, b: 0, alpha: 1 }; // fondo negro de la imagen

async function square(size, file, dir = out) {
  await sharp(src)
    .resize(size, size, { fit: "cover", position: "centre" })
    .png()
    .toFile(path.join(dir, file));
  console.log("✓", file);
}

// Maskable: imagen con padding (safe zone) sobre fondo negro.
async function maskable(size, file) {
  const inner = Math.round(size * 0.8);
  const pad = Math.round((size - inner) / 2);
  const logo = await sharp(src)
    .resize(inner, inner, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(path.join(out, file));
  console.log("✓", file);
}

// Favicon + apple-icon (consumidos por Next como app/icon.* y app/apple-icon.*).
await sharp(src).resize(512, 512, { fit: "cover", position: "centre" }).jpeg({ quality: 92 }).toFile(path.join(appDir, "icon.jpg"));
console.log("✓ src/app/icon.jpg (favicon)");
await sharp(src).resize(180, 180, { fit: "cover", position: "centre" }).jpeg({ quality: 92 }).toFile(path.join(appDir, "apple-icon.jpg"));
console.log("✓ src/app/apple-icon.jpg");

// Iconos PWA
await square(192, "icon-192.png");
await square(512, "icon-512.png");
await maskable(512, "icon-maskable-512.png");
await maskable(192, "icon-maskable-192.png");
console.log("Listo.");
