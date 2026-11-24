import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const allowed = new Set([
  "#1d2b30", // text ink
  "#183a46", // deep petroleum
  "#244c5a", // petroleum
  "#acc3c3", // silver sage accent
  "#aeb8b7", // medium stone
  "#c4cdca", // raised mineral surface
  "#192226", // graphite
  "#36464e", // body slate
  "#d8e0da", // light text
  "#b7c3bd", // dark muted text
  "#303d41", // dark raised surface
]);
const extensions = new Set([".css", ".html", ".js", ".jsx", ".mjs", ".svg"]);
const ignoredDirectories = new Set(["node_modules", "dist", ".git"]);
const files = [];

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue;
    const absolute = join(directory, entry);
    const stats = statSync(absolute);
    if (stats.isDirectory()) {
      walk(absolute);
      continue;
    }
    if (extensions.has(extname(entry))) files.push(absolute);
  }
}

walk(root);

const violations = [];
const hexPattern = /#[0-9a-fA-F]{6}\b/g;

for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(hexPattern)) {
    const color = match[0].toLowerCase();
    if (allowed.has(color)) continue;
    const line = content.slice(0, match.index).split("\n").length;
    violations.push(`${relative(root, file)}:${line}  ${match[0]}`);
  }
}

if (violations.length > 0) {
  console.error("Colors outside the approved palette were found:\n");
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("Palette audit passed: all literal interface colors use the approved eleven-color system.");
