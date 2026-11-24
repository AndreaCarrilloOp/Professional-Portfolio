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
