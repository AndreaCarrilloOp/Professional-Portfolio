# Professional Portfolio — Andrea Carrillo

Bilingual (ES/EN) professional portfolio built with **React 19, Vite 6 and CSS**, deployed on Netlify. The design uses the **Azul Medianoche · Ciruela · Champagne** palette (midnight navy `#0C1229`, steel-blue `#96A9BF`, deep plum `#4B2848` and restrained gold `#D2B77E` / bronze `#4B3620` accents), responsive images and accessible light/dark themes.

## Features

- Semantic one-page layout with responsive navigation and keyboard focus management.
- Spanish and English content with i18next.
- Light/dark themes, reduced-motion support and a decorative constellation canvas.
- Selected projects, technical skills and verified certification links.
- Responsive local images with WebP/AVIF when available.
- Canonical metadata, JSON-LD, social previews, sitemap and robots directives.

## Development

**Requirements:** Node.js 20+, Corepack and pnpm 9.15.0.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Preview the production build locally:

```bash
pnpm build
pnpm preview
```

## Quality checks

```bash
pnpm check
```

The check command runs **ESLint, WCAG contrast checks for the defined semantic colors, seven focused static smoke tests and the production build**. These are regression safeguards, **not a substitute for browser-based accessibility testing or a WCAG certification**.

The smoke tests cover translation parity, semantic navigation/contact, carousel accessibility, local image fallbacks, outbound links, SEO/deployment configuration and reduced-motion/theme support. There is no additional test framework or recurring automation.

For a production release, also verify keyboard navigation, 200%/400% zoom, both themes, mobile layouts, screen-reader announcements and Lighthouse/axe results in a real browser.

## Project structure

```text
src/
  App.jsx
  constants.js
  components/
    layout/
    sections/
    ui/
  i18n/
  styles/
  assets/
public/
  branding/
  images/
scripts/
  check-contrast.mjs
  check-site.mjs
  generate-deploy-files.mjs
```

## Deployment

Netlify reads `netlify.toml`:

- **Build:** `pnpm build`
- **Publish directory:** `dist`
- **Node:** 20

The build generates `robots.txt` and `sitemap.xml` for the configured origin. If using a custom domain, set `VITE_SITE_URL` to its public HTTPS origin, or use Netlify's `URL` variable.

For deployment details, consult [the Netlify guide](docs/NETLIFY_DEPLOYMENT.md).

## Accessibility and maintenance

The site uses HTML landmarks, visible keyboard focus, reduced-motion preferences, high-contrast and forced-color fallbacks. Color checks test declared semantic tokens and the inverse footer, but translucent overlays still require a browser review.

Keep content, styles, and asset paths synchronized when adding a project. Avoid adding third-party dependencies or tests for purely cosmetic CSS changes unless they protect a user-facing behavior.

---

Portfolio maintained by **Andrea Carrillo Oporto**.
