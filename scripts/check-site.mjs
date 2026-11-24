import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const load = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const json = (path) => JSON.parse(load(path));

function translationKeys(object, prefix = "") {
  return Object.entries(object).flatMap(([key, value]) => {
    const name = prefix ? prefix + "." + key : key;
    return value && typeof value === "object" && !Array.isArray(value)
      ? translationKeys(value, name)
      : [name];
  }).sort();
}

test("Spanish and English expose the same translation keys", () => {
  const spanish = json("src/i18n/es/es.json");
  const english = json("src/i18n/en/en.json");
  assert.deepEqual(translationKeys(spanish), translationKeys(english));
  for (const section of ["hero", "about", "skills", "projects", "certifications", "contact", "seo"]) {
    assert.ok(spanish[section] && english[section], "Missing translation section: " + section);
  }
});

test("navigation and contact retain accessible landmarks and keyboard handling", () => {
  const app = load("src/App.jsx");
  const nav = load("src/components/layout/Navbar.jsx");
  const contact = load("src/components/sections/Contact.jsx");
  const footer = load("src/components/layout/Footer.jsx");
  assert.match(app, /className="skip-link" href="#main-content"/);
  assert.match(app, /<main id="main-content" tabIndex="-1">/);
  assert.match(nav, /<ul className="nav-links">/);
  assert.match(nav, /aria-current=\{isActive \? "location" : undefined\}/);
  assert.match(nav, /aria-expanded=\{open\}/);
  assert.match(nav, /aria-controls="mobile-menu"/);
  assert.match(nav, /role="dialog"/);
  assert.match(nav, /event\.key === "Escape"/);
  assert.match(nav, /addEventListener\("popstate", restoreHash\)/);
  assert.match(nav, /addEventListener\("hashchange", restoreHash\)/);
  assert.match(contact, /id="contact"/);
  assert.match(footer, /<Contact \/>/);
  assert.doesNotMatch(app, /<Contact \/>/);
});

test("hero carousel stays accessible without duplicated announcements", () => {
  const hero = load("src/components/sections/Hero.jsx");
  const css = load("src/styles/components.css") + load("src/styles/enhancements.css");
  assert.match(hero, /className="tech-carousel" tabIndex=\{0\}/);
  assert.match(hero, /className="tech-track"/);
  assert.ok(hero.includes("-clone"));
  assert.match(hero, /aria-hidden="true"/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("project and profile image fallbacks exist", () => {
  const manifest = json("src/assets/responsive-images.json");
  for (const key of ["profileLight", "profileDark", "scrabble", "petshop", "distributedLibrary"]) {
    const entry = manifest[key];
    assert.ok(entry, "Missing image metadata: " + key);
    const images = entry.webp ?? entry.png;
    assert.ok(Array.isArray(images) && images.length, "No image variants: " + key);
    const fallback = images[images.length - 1];
    assert.ok(fallback.width > 0 && fallback.height > 0);
    assert.match(fallback.url, /^\/images\/responsive\/[\w.-]+$/);
    assert.ok(existsSync(new URL("../public" + fallback.url, import.meta.url)),
      "Missing image: " + fallback.url);
  }
});

test("published projects and certificates have outbound destinations", () => {
  const constants = load("src/constants.js");
  const projectConfig = constants.split("export const PROJECTS = [")[1]?.split("export const CERTIFICATIONS = [")[0];
  const certificateConfig = constants.split("export const CERTIFICATIONS = [")[1];
  assert.ok(projectConfig && certificateConfig);
  assert.match(projectConfig, /https:\/\/github\.com\/AndreaCarrilloOp\//);
  assert.match(projectConfig, /demo: "https:\/\//);
  assert.match(certificateConfig, /https:\/\/learn\.microsoft\.com\//);
  assert.doesNotMatch(projectConfig + certificateConfig, /https:\/\/example\.com|href: "#"/);
});

test("production metadata and deploy configuration stay aligned", () => {
  const html = load("index.html");
  const vite = load("vite.config.js");
  const deploy = load("scripts/generate-deploy-files.mjs");
  const netlify = load("netlify.toml");
  for (const field of ['rel="canonical"', 'property="og:image"', 'name="twitter:card"']) {
    assert.ok(html.includes(field), "Missing SEO metadata: " + field);
  }
  assert.match(html, /__SITE_URL__\//);
  assert.match(vite, /transformIndexHtml/);
  assert.match(deploy, /sitemap\.xml/);
  assert.match(netlify, /publish = "dist"/);
  const schemaText = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(schemaText, "Missing structured data");
  assert.equal(JSON.parse(schemaText)["@type"], "Person");
});

test("theme, contrast and reduced-motion fallbacks remain available", () => {
  const app = load("src/App.jsx");
  const tokens = load("src/styles/tokens.css");
  const styles = load("src/styles/enhancements.css");
  assert.match(app, /prefers-reduced-motion: reduce/);
  assert.match(tokens, /--focus-ring:/);
  assert.match(styles, /prefers-contrast: more/);
  assert.match(styles, /forced-colors: active/);
  assert.match(styles, /Theme-inverse footer:/);
  assert.ok(existsSync(new URL("../public/branding/aco-light.svg", import.meta.url)));
  assert.ok(existsSync(new URL("../public/branding/aco-dark.svg", import.meta.url)));
});
