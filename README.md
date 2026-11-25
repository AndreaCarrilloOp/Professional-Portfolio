# Andrea Carrillo Oporto · Professional Portfolio

A bilingual (English / Spanish) software development portfolio featuring selected projects, technical skills, and verifiable credentials. Built with **React 19, Vite 6, and CSS**, and deployed on Netlify.

**[Live portfolio](https://andreacarrillo-portafolio.netlify.app/)** · **[GitHub profile](https://github.com/AndreaCarrilloOp)** · **[LinkedIn](https://www.linkedin.com/in/andrea-carrillo-vlk/)**

## Preview

| Light mode | Dark mode |
| :---: | :---: |
| ![Portfolio homepage in light mode](docs/screenshots/portfolio-light.webp) | ![Portfolio homepage in dark mode](docs/screenshots/portfolio-dark.webp) |

The interface uses a restrained midnight-blue, steel-blue, plum, and champagne palette with self-hosted IBM Plex typography.

## Highlights

- **Selected work:** Distributed Library Platform, SCRABBLE (C++ / WebAssembly), Bookstore RabbitMQ, and Huellita PetShop.
- **Responsive experience:** layouts for mobile, tablet, and desktop, with light and dark themes.
- **Bilingual content:** English and Spanish via i18next and react-i18next.
- **Accessibility-aware UI:** semantic landmarks, keyboard navigation, visible focus indicators, reduced-motion support, and accessible theme and language controls.
- **SEO and sharing:** canonical metadata, Open Graph and Twitter Cards, JSON-LD, sitemap, and robots directives.
- **Deployment:** Netlify SPA routing, production security headers, and automated quality checks.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite 6, JavaScript, CSS |
| Localization | i18next, react-i18next |
| UI | React Icons, IBM Plex Sans, IBM Plex Mono |
| Tooling | Node.js 24 LTS, pnpm 9.15.0, ESLint |
| Delivery | Netlify, GitHub Actions |

## Run locally

**Requirements:** Node.js 24 LTS, Corepack, and pnpm 9.15.0.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Build and preview the production version:

```bash
pnpm build
pnpm preview
```

## Quality and accessibility

```bash
pnpm check
```

The check script runs ESLint, contrast-token validation, static regression tests, and a production build. The GitHub Actions workflow additionally runs Chromium browser checks, including automated accessibility checks, and publishes temporary test artifacts.

Automated checks **do not establish WCAG conformance**. Before a release, also review keyboard-only navigation, screen-reader behavior, contrast in rendered components, 200%/400% zoom, responsive layouts, and both themes.

## Project structure

```text
public/                # Static assets, social preview, and branding
src/
  assets/              # Local project imagery
  components/
    layout/            # Navigation and footer
    sections/          # Portfolio content
    ui/                # Reusable interface components
  i18n/                # English and Spanish translations
  styles/              # Theme, layout, and component CSS
  App.jsx
  constants.js
docs/screenshots/       # README previews
scripts/               # Static checks and deploy-file generation
.github/workflows/      # CI quality pipeline
netlify.toml            # Build, redirects, and security headers
```

## Deployment

Netlify uses `pnpm build`, publishes `dist/`, and builds with Node.js 24. The production build generates `robots.txt` and `sitemap.xml` from `VITE_SITE_URL` or Netlify's `URL`.

Set `VITE_SITE_URL` to the public HTTPS origin when deploying to a custom domain. Social preview metadata is defined in `index.html`, and the share image lives at `public/og-image.jpg`.

---

Designed and developed by **Andrea Carrillo Oporto**.
