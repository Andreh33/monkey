import { createClient } from "@libsql/client";
import { readFileSync, readdirSync } from "fs";
import path from "path";

try {
  const env = readFileSync(path.join(process.cwd(), ".env"), "utf8");
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) throw new Error("TURSO_DATABASE_URL missing");

const client = createClient({ url, authToken });

function splitSql(sql: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inString = false;
  for (const ch of sql) {
    if (ch === "'") inString = !inString;
    if (ch === ";" && !inString) {
      const trimmed = cur.trim();
      if (trimmed) out.push(trimmed);
      cur = "";
    } else {
      cur += ch;
    }
  }
  const trimmed = cur.trim();
  if (trimmed) out.push(trimmed);
  return out
    .map((s) =>
      s
        .split(/\r?\n/)
        .filter((l) => !l.trim().startsWith("--"))
        .join("\n")
        .trim()
    )
    .filter((s) => s.length > 0);
}

async function run() {
  console.log("📡 Conectando a Turso:", url);

  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  const dirs = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const dir of dirs) {
    const sqlFile = path.join(migrationsDir, dir, "migration.sql");
    const sql = readFileSync(sqlFile, "utf8");
    console.log(`📂 Aplicando migración: ${dir}`);
    const statements = splitSql(sql);
    console.log(`   ${statements.length} sentencias detectadas`);

    for (const stmt of statements) {
      try {
        await client.execute(stmt);
        const head = stmt.split(/\s+/).slice(0, 4).join(" ");
        console.log(`  ✓ ${head}...`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("already exists")) {
          console.log(`  ⚠ Ya existe`);
        } else {
          console.error(`  ❌ ${msg}\n  SQL: ${stmt.slice(0, 200)}`);
          throw err;
        }
      }
    }
  }

  console.log("✅ Schema sincronizado con Turso");
  client.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
