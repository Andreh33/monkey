#!/usr/bin/env node
// Vuelca todas las tablas de la BD Turso (libSQL) a un JSON con marca de tiempo
// en backups/. Lee credenciales de .env. Uso: node scripts/backup-turso.mjs
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@libsql/client";

// Cargar .env manualmente (mismo enfoque que prisma/push-turso.ts)
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
  console.error("TURSO_DATABASE_URL no definida; nada que respaldar.");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function run() {
  console.log("📡 Conectando a Turso:", url);
  const tablesRes = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
  );
  const tables = tablesRes.rows.map((r) => String(r.name));

  const dump = { exportedAt: new Date().toISOString(), url, tables: {} };
  for (const t of tables) {
    const res = await client.execute(`SELECT * FROM "${t}"`);
    dump.tables[t] = res.rows;
    console.log(`  • ${t}: ${res.rows.length} filas`);
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dir = join(process.cwd(), "backups");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `turso-backup-${ts}.json`);
  writeFileSync(file, JSON.stringify(dump, null, 2), "utf8");
  console.log(`✅ Backup guardado en ${file}`);
}

run()
  .catch((err) => {
    console.error("❌ Error en backup:", err);
    process.exit(1);
  })
  .finally(() => client.close());
