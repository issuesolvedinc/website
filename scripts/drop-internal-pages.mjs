// Runs after `next build` (npm postbuild). The design system and flows pages are internal working pages, part of
// the AI workflow work, not the website: they stay available in `next dev` but are removed from the static export,
// so the live site never serves them. Founder rule, 2026-11-05: keep the machinery hidden.
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "build";
const INTERNAL = ["design-system", "flows"];

for (const route of INTERNAL) {
  for (const path of [route, `${route}.html`, `${route}.txt`]) {
    const full = join(OUT, path);
    if (existsSync(full)) {
      rmSync(full, { recursive: true, force: true });
      console.log(`removed ${full}`);
    }
  }
}
