import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("legacy workshop and renamed Vortex pages redirect to their actual equivalents", () => {
  const { redirects } = JSON.parse(readFileSync("vercel.json", "utf8"));
  for (const [source, destination] of [
    ["/tienda/taller", "/reparaciones"],
    ["/tienda/patinete-electrico-etric-vortex", "/tienda/patinete-electrico-etric-vortex-un-motor"],
  ]) assert.ok(redirects.some((r: {source: string; destination: string; permanent: boolean}) =>
    r.source === source && r.destination === destination && r.permanent));
});
