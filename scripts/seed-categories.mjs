#!/usr/bin/env node
// Crea las categorias iniciales en Turso a partir de las categorias que ya
// usan los productos. Idempotente: no duplica (INSERT OR IGNORE por slug).
// Sin subcategorias: se anaden desde /admin/categorias. Uso: node scripts/seed-categories.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@libsql/client";

try {
  const env = readFileSync(join(process.cwd(), ".env"), "utf8");
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) {
  console.error("TURSO_DATABASE_URL no definida.");
  process.exit(1);
}

// Nombres y orden bonitos para las categorias conocidas.
const KNOWN = [
  ["patinete", "Patinetes"],
  ["moto", "Motos"],
  ["bicicleta", "Bicicletas"],
  ["vehiculo-electrico", "Vehículos eléctricos"],
  ["movilidad-reducida", "Movilidad reducida"],
  ["accesorio", "Accesorios"],
  ["recambio", "Recambios"],
];

const now = () => new Date().toISOString().replace("Z", "+00:00");
const titleCase = (slug) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const client = createClient({ url, authToken });

async function run() {
  // Categorias usadas por productos existentes.
  const res = await client.execute(
    `SELECT DISTINCT category FROM "Product" WHERE category IS NOT NULL AND category != ''`
  );
  const used = res.rows.map((r) => String(r.category));

  // Union: conocidas (en su orden) + cualquier otra usada por productos.
  const slugs = [];
  for (const [slug] of KNOWN) slugs.push(slug);
  for (const s of used) if (!slugs.includes(s)) slugs.push(s);

  const nameFor = (slug) => {
    const k = KNOWN.find(([s]) => s === slug);
    return k ? k[1] : titleCase(slug);
  };

  let created = 0;
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const r = await client.execute({
      sql: `INSERT OR IGNORE INTO "Category" ("id","slug","name","order","createdAt","updatedAt") VALUES (?,?,?,?,?,?)`,
      args: [randomUUID(), slug, nameFor(slug), i, now(), now()],
    });
    if (r.rowsAffected > 0) {
      created++;
      console.log(`  + ${slug} -> ${nameFor(slug)}`);
    } else {
      console.log(`  = ${slug} (ya existe)`);
    }
  }
  console.log(`✅ Seed completado. ${created} categorias nuevas.`);
}

run()
  .catch((err) => {
    console.error("❌ Error en seed:", err);
    process.exit(1);
  })
  .finally(() => client.close());
