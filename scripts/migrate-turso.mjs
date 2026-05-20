#!/usr/bin/env node
// Aplica las migraciones de prisma/migrations contra Turso (libSQL).
// Se ejecuta en el build de Vercel. Si no hay TURSO_DATABASE_URL, no hace nada
// (en local Prisma maneja la BD SQLite directamente via `prisma migrate dev`).
import { readdir, readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@libsql/client";

// Cargar .env si las variables no estan ya en el entorno (uso local).
// En Vercel las variables vienen inyectadas y .env no existe -> no-op.
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
  console.log("[migrate-turso] TURSO_DATABASE_URL no definida, saltando.");
  process.exit(0);
}

const client = createClient({ url, authToken });

async function run() {
  await client.execute(`CREATE TABLE IF NOT EXISTS "_app_migrations" (
    "name" TEXT PRIMARY KEY,
    "applied_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  const dir = join(process.cwd(), "prisma", "migrations");
  const entries = (await readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const appliedRes = await client.execute(`SELECT name FROM "_app_migrations"`);
  const applied = new Set(appliedRes.rows.map((r) => String(r.name)));

  // Bootstrap: si la BD ya tiene el esquema (tabla Product existe) pero no
  // hay entradas en _app_migrations, asumimos que el init ya esta aplicado
  // (caso de la primera vez que corremos este script sobre una BD existente).
  if (applied.size === 0) {
    const existsRes = await client.execute(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='Product'`
    );
    if (existsRes.rows.length > 0) {
      for (const name of entries) {
        if (name.endsWith("_init")) {
          console.log(`[migrate-turso] BD ya inicializada, marcando ${name} como aplicada`);
          await client.execute({
            sql: `INSERT OR IGNORE INTO "_app_migrations" ("name") VALUES (?)`,
            args: [name],
          });
          applied.add(name);
        }
      }
    }
  }

  for (const name of entries) {
    if (applied.has(name)) {
      console.log(`[migrate-turso] ya aplicada: ${name}`);
      continue;
    }
    const sqlPath = join(dir, name, "migration.sql");
    let sql;
    try {
      sql = await readFile(sqlPath, "utf8");
    } catch {
      console.log(`[migrate-turso] sin migration.sql en ${name}, saltando`);
      continue;
    }
    console.log(`[migrate-turso] aplicando ${name}...`);
    await client.executeMultiple(sql);
    await client.execute({
      sql: `INSERT INTO "_app_migrations" ("name") VALUES (?)`,
      args: [name],
    });
    console.log(`[migrate-turso] ok ${name}`);
  }

  console.log("[migrate-turso] todas las migraciones aplicadas.");
}

run()
  .catch((err) => {
    console.error("[migrate-turso] error:", err);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
