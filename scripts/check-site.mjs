import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const load = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
const json = (name) => JSON.parse(load(name));
const hero = load("src/components/sections/Hero.jsx");
const constants = load("src/constants.js");
const styles = ["src/styles/components.css", "src/styles/enhancements.css", "src/styles/hero.css"].map(load);
const spanish = json("src/i18n/es/es.json");
const english = json("src/i18n/en/en.json");

const hash = (str) => {
  let value = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    value = Math.imul(value ^ str.charCodeAt(i), 16777619) >>> 0;
  }
  return value.toString(16).padStart(8, "0");
};

test("technology carousel structure is unchanged", () => {
  const start = hero.indexOf('      <div\n        className="tech-strip reveal-up delay-2"');
  const end = hero.lastIndexOf("    </section>");
  assert.ok(start >= 0 && end > start, "carousel must remain in Hero");
  assert.equal(hash(hero.slice(start, end)), "460411eb", "do not alter the carousel without approval");
});

test("only the three approved projects are listed", () => {
  const start = constants.indexOf("export const PROJECTS = [");
  const end = constants.indexOf("export const CERTIFICATIONS = [");
  const block = constants.slice(start, end);
  const ids = [...block.matchAll(/\bid: "([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, ["scrabble", "petshop", "distributed-library"]);
});

test("all credential cards provide verified destinations and badge assets", () => {
  const start = constants.indexOf("export const CERTIFICATIONS = [");
  const block = constants.slice(start);
  assert.equal([...block.matchAll(/\bcredentialUrl:/g)].length, 3);
  assert.equal([...block.matchAll(/\bbadgeImage:/g)].length, 3);
  assert.match(block, /credentials\/2dc1174f7d2f1f1b/);
});

test("both translations preserve page sections and accessible navigation", () => {
  for (const section of ["hero", "about", "skills", "projects", "certifications", "contact"]) {
    assert.ok(spanish[section] && english[section], `missing ${section} translations`);
  }
  const navbar = load("src/components/layout/Navbar.jsx");
  for (const id of ["home", "about", "skills", "projects", "certifications", "contact"]) {
    assert.ok(constants.includes(`href: "#${id}"`), `missing ${id} navigation link`);
  }
  assert.match(navbar, /handleNavClick\(event, item.id\)/);
  assert.match(load("src/components/sections/Contact.jsx"), /id="contact"/);
});

test("footer and app contain one accessible contact region", () => {
  const footer = load("src/components/layout/Footer.jsx");
  const app = load("src/App.jsx");
  assert.match(footer, /<Contact \/>/);
  assert.doesNotMatch(app, /<Contact \/>/);
});

test("styles remain structurally balanced and do not force placeholder section heights", () => {
  for (const css of styles) {
    let depth = 0;
    for (const char of css) {
      if (char === "{") depth += 1;
      if (char === "}") depth -= 1;
      assert.ok(depth >= 0, "unexpected closing CSS block");
    }
    assert.equal(depth, 0, "unbalanced CSS rules");
  }
  const base = load("src/styles/base.css");
  assert.doesNotMatch(base, /contain-intrinsic-size:\s*720px/);
  assert.match(base, /scroll-behavior:\s*auto/);
});

test("page includes canonical metadata and deploy configuration permits credential and project images", () => {
  const html = load("index.html");
  const config = load("netlify.toml");
  for (const tag of ["canonical", "og:image", "twitter:card", "application/ld+json"]) {
    assert.ok(html.includes(tag), `missing SEO metadata: ${tag}`);
  }
  assert.match(config, /img-src [^;]*https:\/\/images\.credly\.com/);
  assert.match(config, /img-src [^;]*https:\/\/raw\.githubusercontent\.com/);
});
