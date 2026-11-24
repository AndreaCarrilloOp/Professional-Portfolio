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

test("technology carousel original structure is preserved", () => {
  const start = hero.indexOf('      <div\n        className="tech-strip reveal-up delay-2"');
  const end = hero.lastIndexOf("    </section>");
  assert.ok(start >= 0 && end > start, "carousel must remain in Hero");
  assert.equal(hash(hero.slice(start, end)), "460411eb",
    "do not change the original continuous technology carousel");
  assert.doesNotMatch(hero, /techPaused|tech-motion-toggle|tech-track-paused/);
});

test("ACO branding uses theme-aware SVG assets and accessible home link", () => {
  const navbar = load("src/components/layout/Navbar.jsx");
  const html = load("index.html");
  const css = load("src/styles/enhancements.css");
  const palette = load("scripts/check-palette.mjs");
  for (const variant of ["light", "dark"]) {
    const logo = load("public/branding/aco-" + variant + ".svg");
    assert.match(logo, /<svg\b/);
    assert.match(logo, /viewBox="0 0 320 224"/);
  }
  assert.match(load("public/branding/favicon.svg"), /viewBox="0 0 64 64"/);
  assert.ok(navbar.includes('className="brand-logo"'));
  assert.ok(navbar.includes('darkMode ? "dark" : "light"'));
  assert.ok(navbar.includes('aria-label={t("accessibility.brandHome")}'));
  assert.ok(html.includes('%BASE_URL%branding/favicon.svg'));
  assert.ok(css.includes(".brand .brand-logo"));
  assert.ok(palette.includes("public/branding/"));
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
  const navConfig = constants.slice(
    constants.indexOf("export const NAV_ITEMS = ["),
    constants.indexOf("export const SOCIAL_LINKS = ["),
  );
  const navIds = [...navConfig.matchAll(/id: "([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(navIds, ["projects", "skills", "about"]);
  assert.match(navbar, /handleNavClick\(event, item.id\)/);
  assert.match(navbar, /className="nav-contact-cta"/);
  assert.match(navbar, /className="bento-contact-cta"/);
  assert.match(navbar, /handleNavClick\(event, "contact"\)/);
  assert.match(load("src/components/sections/Hero.jsx"), /href="#contact"/);
  assert.match(load("src/components/sections/Contact.jsx"), /id="contact"/);
});

test("navigation restores history and skill tags are grouped logically", () => {
  const navbar = load("src/components/layout/Navbar.jsx");
  assert.match(navbar, /addEventListener\("popstate", restoreHash\)/);
  assert.match(navbar, /addEventListener\("hashchange", restoreHash\)/);
  assert.match(navbar, /location\.hash !==/);
  const skills = load("src/components/sections/Skills.jsx");
  assert.match(skills, /className="skill-groups"/);
  const config = constants.slice(constants.indexOf("export const SKILLS = ["),
    constants.indexOf("export const PROJECTS = ["));
  for (const key of ["skills.cloud.delivery", "skills.cloud.testing", "skills.cloud.versionControl"]) {
    assert.ok(config.includes(key));
  }
});

test("semantic technology tags remain static and editorial cards stay restrained", () => {
  const skills = load("src/components/sections/Skills.jsx");
  const projects = load("src/components/sections/Projects.jsx");
  const css = load("src/styles/enhancements.css");
  assert.match(skills, /<ul className="tag-cloud">/);
  assert.match(skills, /<li key=\{item\} className="tag">/);
  assert.match(projects, /<ul className="tag-cloud"/);
  assert.match(projects, /<li className="tag" key=\{tech\}>/);
  assert.ok(css.includes(".tag-cloud > .tag:nth-child(n)"));
  const cardsStart = css.indexOf("/* Restrained editorial cards:");
  const cards = css.slice(cardsStart, css.indexOf("\n.skill-icon {", cardsStart));
  assert.ok(cardsStart >= 0);
  assert.match(cards, /\.about-card,\s*\.skills-grid \.skill-card,\s*\.projects-grid \.project-card\s*\{[\s\S]*?border-radius: 10px/);
  assert.match(cards, /border-block-start: 2px/);
  assert.match(cards, /cursor: default/);
  assert.doesNotMatch(cards, /border-radius:\s*0/);
  assert.match(load("src/styles/components.css"), /\.credential-badge \{[\s\S]*?border-radius: 16px/);
});

test("portfolio prioritizes projects and preserves four skills categories", () => {
  const app = load("src/App.jsx");
  const order = ["<Hero ", "<Projects />", "<Skills />", "<About />", "<Certifications />"];
  let previous = -1;
  for (const component of order) {
    const position = app.indexOf(component);
    assert.ok(position > previous, `incorrect section order: ${component}`);
    previous = position;
  }
  const skillsText = constants.slice(
    constants.indexOf("export const SKILLS = ["),
    constants.indexOf("export const PROJECTS = ["),
  );
  assert.deepEqual(
    [...skillsText.matchAll(/id: "([^"]+)"/g)].map((x) => x[1]),
    ["frontend", "backend", "databases", "cloud"],
  );
  for (const item of ["React", "FastAPI", "PostgreSQL", "Docker", "pytest", "Figma"]) {
    assert.ok(skillsText.includes(item), `missing key skill: ${item}`);
  }
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

test("page includes canonical metadata and deploy configuration permits credential images and preserves local project assets", () => {
  const html = load("index.html");
  const config = load("netlify.toml");
  for (const tag of ["canonical", "og:image", "twitter:card", "application/ld+json"]) {
    assert.ok(html.includes(tag), `missing SEO metadata: ${tag}`);
  }
  assert.match(config, /img-src [^;]*https:\/\/images\.credly\.com/);
  const images = json("src/assets/responsive-images.json");
  assert.equal(images.distributedLibrary.png[0].url, "/images/responsive/distributed-library.png");
  assert.match(constants, /buildResponsiveImage\(\s*"distributedLibrary"/);
});


test("SEO metadata is consistent with published projects and site URL", () => {
  const html = load("index.html");
  const app = load("src/App.jsx");
  const buildConfig = load("vite.config.js");
  const deploy = load("scripts/generate-deploy-files.mjs");
  const production = "https://andreacarrillo-portafolio.netlify.app";

  assert.match(html, /<link rel="canonical" href="__SITE_URL__\/"/);
  assert.match(html, /<meta property="og:url" content="__SITE_URL__\/"/);
  assert.match(html, /<meta property="og:image" content="__SITE_URL__\/og-image\.jpg"/);
  assert.ok(buildConfig.includes(production), "canonical fallback should be the real portfolio URL");
  assert.ok(deploy.includes(production), "sitemap fallback should match canonical origin");

  const schemaText = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(schemaText, "Person JSON-LD should be present");
  const schema = JSON.parse(schemaText);
  assert.equal(schema["@type"], "Person");
  assert.equal(schema.name, "Andrea Carrillo Oporto");
  assert.deepEqual(schema.subjectOf.map((entry) => entry.name), [
    "Scrabble Web Edition",
    "Huellita PetShop",
    "Distributed Library Platform",
  ]);

  for (const locale of [spanish, english]) {
    assert.ok(locale.seo.title.length > 20);
    assert.ok(locale.seo.description.length >= 70);
    assert.ok(locale.seo.description.length <= 165);
    assert.ok(locale.about.approach);
  }
  assert.match(app, /document\.title = t\("seo\.title"\)/);
  assert.match(app, /setMeta\('meta\[property="og:description"\]'/);
});

test("light-mode constellations have legible but decorative contrast", () => {
  const canvas = load("src/components/ui/ConstellationBackground.jsx");
  const css = load("src/styles/enhancements.css");
  const lightStart = canvas.indexOf("const LIGHT_PALETTE = {");
  const darkStart = canvas.indexOf("const DARK_PALETTE = {");
  assert.ok(lightStart >= 0 && darkStart > lightStart);
  const light = canvas.slice(lightStart, darkStart);
  const dark = canvas.slice(darkStart, canvas.indexOf("function createParticles", darkStart));
  for (const expected of ["lineAlpha: 0.27", "pointAlpha: 0.84", "lineWidth: 1"]) {
    assert.ok(light.includes(expected), `missing light palette: ${expected}`);
  }
  for (const expected of ["lineAlpha: 0.14", "pointAlpha: 0.78", "lineWidth: 0.75"]) {
    assert.ok(dark.includes(expected), `dark palette changed: ${expected}`);
  }
  assert.ok(canvas.includes("point: [24, 58, 70]"));
  assert.ok(canvas.includes("line: [172, 195, 195]"));
  assert.ok(canvas.includes("context.lineWidth = palette.lineWidth;"));
  assert.ok(css.includes(":root:not(.dark) .constellation-canvas"));
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(canvas.includes('aria-hidden="true"'));
});

test("navbar uses semantic lists and text-first active states", () => {
  const navbar = load("src/components/layout/Navbar.jsx");
  const css = load("src/styles/enhancements.css");
  assert.ok(navbar.includes('<ul className="nav-links">'));
  assert.ok(navbar.includes('<ul className="bento-grid">'));
  assert.ok(navbar.includes('aria-current={isActive ? "location" : undefined}'));
  assert.ok(navbar.includes('aria-expanded={open}'));
  assert.ok(navbar.includes('aria-haspopup="dialog"'));
  assert.ok(navbar.includes('role="dialog"'));
  assert.ok(navbar.includes('ref={index === 0 ? firstMobileLinkRef : undefined}'));
  assert.ok(!navbar.includes('className="bento-index"'));
  const navStyles = css.slice(css.indexOf("/* Navigation refinement: text links"));
  assert.ok(navStyles.includes(".nav-links .nav-link-active::after"));
  assert.ok(navStyles.includes(".nav-links > li + li::before"));
  assert.ok(navStyles.includes("height: 22px;"));
  assert.ok(navStyles.includes("padding: 12px 14px 15px;"));
  assert.ok(navStyles.includes("min-height: 48px;"));
  assert.ok(!navStyles.includes(".nav-links .nav-link-active::before"));
  assert.ok(!navStyles.includes(".nav-actions::before"));
  assert.ok(!navStyles.includes(".mobile-bento-menu .bento-link-active svg"));
  assert.ok(navStyles.includes("border-inline-start-color: var(--primary)"));
  assert.ok(navStyles.includes(".nav-actions .icon-button"));
  assert.ok(navStyles.includes("@media (prefers-reduced-motion: reduce)"));
});

test("navigation links have breathing room and remain mobile responsive", () => {
  const css = load("src/styles/enhancements.css");
  const navStart = css.indexOf("/* Navigation refinement: text links");
  const nav = css.slice(navStart);
  assert.ok(navStart >= 0, "navbar refinement should exist");
  assert.ok(nav.includes("--nav-item-gap: clamp(28px, 2.9vw, 48px);"));
  assert.ok(nav.includes("gap: var(--nav-item-gap);"));
  assert.ok(nav.includes("--nav-item-gap: 26px;"));
  assert.ok(nav.includes("grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr)"));
  assert.ok(nav.includes(".nav-container > .nav-links"));
  assert.ok(nav.includes("@media (max-width: 1024px)"));
  assert.ok(nav.includes("display: none;"), "mobile navigation must hide desktop links");
});

test("mineral slate themes keep page and browser colors synchronized", () => {
  const tokens = load("src/styles/tokens.css");
  const html = load("index.html");
  const app = load("src/App.jsx");
  const paletteAudit = load("scripts/check-palette.mjs");
  for (const hex of ["#1d2b30", "#183a46", "#244c5a", "#acc3c3", "#aeb8b7", "#c4cdca", "#192226", "#36464e"]) {
    assert.ok(tokens.includes(hex), `missing palette color ${hex}`);
    assert.ok(paletteAudit.includes(hex), `color not approved: ${hex}`);
  }
  assert.ok(tokens.includes("--muted: #36464e"));
  for (const color of ["#d8e0da", "#b7c3bd", "#303d41"]) {
    assert.ok(tokens.includes(color));
    assert.ok(paletteAudit.includes(color));
  }
  assert.ok(tokens.includes("--primary: #acc3c3"));
  assert.ok(tokens.includes("--primary: #183a46"));
  assert.ok(tokens.includes("--card: #c4cdca"));
  assert.ok(tokens.includes("--card: #303d41"));
  assert.ok(html.includes("#AEB8B7") && html.includes("#192226"));
  assert.ok(app.includes("#AEB8B7") && app.includes("#192226"));
  for (const file of ["aco-light.svg", "aco-dark.svg", "favicon.svg"]) {
    const svg = load(`public/branding/${file}`);
    assert.doesNotMatch(svg, /#(?:47161F|5B1F2A|C9969E|008B8B|32D8CE)/i, `legacy accent in ${file}`);
  }
  assert.ok(load("public/branding/aco-light.svg").includes("#183A46"));
  assert.ok(load("public/branding/aco-dark.svg").includes("#ACC3C3"));
  assert.ok(load("public/branding/favicon.svg").includes('stroke="#ACC3C3"'));
  assert.doesNotMatch(paletteAudit, /008b8b|32d8ce/);
});

test("footer colors invert across themes without changing the content structure", () => {
  const css = load("src/styles/enhancements.css");
  const footer = load("src/components/layout/Footer.jsx");
  const contact = load("src/components/sections/Contact.jsx");
  const start = css.indexOf("/* Theme-inverse footer:");
  assert.ok(start >= 0, "inverse footer theme rules should exist");
  const rules = css.slice(start);

  assert.match(rules, /:root:not\(\.dark\) \.footer\s*\{/);
  assert.match(rules, /\.dark \.footer\s*\{/);
  assert.ok(rules.includes("--footer-background: var(--satin-black)"));
  assert.ok(rules.includes("--footer-background: var(--palette-ice)"));
  assert.ok(rules.includes("--footer-text: var(--palette-light-text)"));
  assert.ok(rules.includes("--footer-muted: var(--palette-dark-muted)"));
  assert.ok(rules.includes("--footer-background-raised: var(--satin-silver)"));
  assert.ok(rules.includes("--footer-text: var(--palette-ink)"));
  assert.ok(rules.includes("--footer-accent: var(--palette-sky)"));
  assert.ok(rules.includes("--footer-accent: var(--palette-navy)"));
  assert.ok(rules.includes("--focus-ring: var(--footer-focus)"));
  assert.ok(rules.includes("background: var(--footer-link-surface)"));
  assert.ok(rules.includes("background: var(--footer-link-hover)"));
  assert.ok(rules.includes("-webkit-text-fill-color: var(--footer-text)"));
  assert.ok(rules.includes("outline: 3px solid var(--footer-focus)"));
  assert.ok(footer.includes('<footer className="footer">'));
  assert.ok(footer.includes("<Contact />"));
  assert.ok(contact.includes('className="footer-contact"'));
  assert.ok(contact.includes('id="contact"'));
});

test("readability and accessibility preferences remain supported", () => {
  const styles = load("src/styles/enhancements.css");
  const base = load("src/styles/base.css");
  const components = load("src/styles/components.css");
  const hero = load("src/styles/hero.css");
  const palette = load("scripts/check-palette.mjs");
  assert.ok(styles.includes("@media (prefers-contrast: more)"));
  assert.ok(styles.includes("@media (forced-colors: active)"));
  assert.ok(styles.includes(":root:not(.dark) .footer,"));
  assert.ok(styles.includes(".footer .footer-contact {\n    border-color: CanvasText;\n    background: transparent;"));
  assert.ok(load("scripts/check-contrast.mjs").includes("INVERSE FOOTER"));
  assert.ok(styles.includes("outline: 3px solid Highlight"));
  assert.ok(styles.includes(".constellation-canvas {\n    display: none;"));
  assert.ok(styles.includes("font-size: 0.875rem;"));
  assert.ok(styles.includes("font-size: 0.825rem;"));
  assert.ok(components.includes("min-height: 44px;"));
  assert.ok(hero.includes("font-size: 0.82rem;"));
  assert.ok(base.includes(".skip-link:focus-visible"));
  assert.ok(palette.includes('"#36464e"'));
  assert.doesNotMatch(palette, /"#36464E"/);
});
