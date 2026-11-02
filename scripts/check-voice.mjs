// Fails when an em dash or a banned word appears in src/ or DESIGN.md.
// The banned list lives here, not in DESIGN.md, so the docs pass their own check.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const banned = [
  "—",
  "leverage",
  "seamless",
  "cutting edge",
  "unlock",
  "empower",
  "revolutionize",
  "revolutionise",
  "robust",
  "synergy",
  "state of the art",
  "game changing",
];

function files(path) {
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).flatMap((name) => files(join(path, name)));
}

let found = 0;
for (const file of [...files("src"), "DESIGN.md"]) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      for (const term of banned) {
        if (line.toLowerCase().includes(term)) {
          found++;
          console.log(`${file}:${i + 1}: ${term === "—" ? "em dash" : term}`);
        }
      }
    });
}

if (found) process.exit(1);
console.log("Voice check passed.");
