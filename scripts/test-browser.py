"""Browser smoke tests for the built portfolio.

Requires: pip install playwright==1.56.0
          python -m playwright install chromium
          npm install --prefix /tmp/portfolio-axe --no-save axe-core@4.10.3
          AXE_SOURCE=/tmp/portfolio-axe/node_modules/axe-core/axe.min.js
Runs locally after: pnpm build
"""
from __future__ import annotations

import json
import os
import subprocess
import time
import unittest
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "http://127.0.0.1:4173"
CAPTURES = ROOT / "artifacts" / "screenshots"
AUDITS = ROOT / "artifacts" / "accessibility"


def await_preview(timeout_seconds: int = 30) -> None:
    until = time.monotonic() + timeout_seconds
    while time.monotonic() < until:
        try:
            with urlopen(BASE_URL, timeout=1) as response:
                if response.status == 200:
                    return
        except (URLError, TimeoutError, OSError):
            time.sleep(0.25)
    raise RuntimeError("Vite preview did not start on port 4173")


class PortfolioSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        CAPTURES.mkdir(parents=True, exist_ok=True)
        AUDITS.mkdir(parents=True, exist_ok=True)
        cls.server = subprocess.Popen(
            ["pnpm", "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"],
            cwd=ROOT,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.STDOUT,
        )
        try:
            await_preview()
            cls.playwright = sync_playwright().start()
            cls.browser = cls.playwright.chromium.launch(headless=True)
        except Exception:
            cls.server.terminate()
            cls.server.wait(timeout=10)
            raise

    @classmethod
    def tearDownClass(cls) -> None:
        if hasattr(cls, "browser"):
            cls.browser.close()
        if hasattr(cls, "playwright"):
            cls.playwright.stop()
        cls.server.terminate()
        try:
            cls.server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            cls.server.kill()
            cls.server.wait(timeout=10)

    def page_for(self, width: int, height: int = 800, reduced_motion: str = "reduce"):
        page = self.browser.new_page(
            viewport={"width": width, "height": height},
            device_scale_factor=1,
            reduced_motion=reduced_motion,
        )
        page.goto(BASE_URL, wait_until="domcontentloaded")
        page.locator("#home-heading").wait_for()
        return page

    def test_brand_logo_uses_theme_assets_and_home_link(self) -> None:
        for width in (390, 1366):
            with self.subTest(width=width):
                page = self.page_for(width)
                try:
                    brand = page.locator(".brand")
                    logo = brand.locator("img.brand-logo")
                    self.assertEqual(logo.get_attribute("alt"), "")
                    self.assertIn("aco-", logo.get_attribute("src"))
                    self.assertTrue(logo.evaluate("img => img.complete && img.naturalWidth > 0"))
                    initial = logo.get_attribute("src")
                    page.locator(".nav-actions .icon-button").click()
                    page.wait_for_function(
                        "(prev) => document.querySelector('.brand-logo')?.getAttribute('src') !== prev",
                        arg=initial,
                    )
                    self.assertTrue(logo.evaluate("img => img.complete && img.naturalWidth > 0"))
                    brand.click()
                    self.assertTrue(page.url.endswith("#home"))
                finally:
                    page.close()

    def test_responsive_layout_and_technology_carousel(self) -> None:
        for width in (320, 390, 768, 1366, 1920):
            with self.subTest(width=width):
                page = self.page_for(width)
                try:
                    self.assertEqual(page.locator("#contact").count(), 1)
                    self.assertEqual(page.locator(".project-card").count(), 4)
                    self.assertEqual(page.locator(".credential-badge").count(), 3)
                    self.assertEqual(page.locator(".credential-fallback").count(), 3)
                    self.assertEqual(page.locator(".project-card-petshop").count(), 1)
                    self.assertTrue(
                        page.locator(".projects-more-link").get_attribute("href").endswith("?tab=repositories")
                    )
                    carousel = page.locator(".tech-carousel")
                    self.assertEqual(carousel.count(), 1)
                    self.assertEqual(carousel.get_attribute("tabindex"), "0")
                    overflow = page.evaluate(
                        "() => document.documentElement.scrollWidth - window.innerWidth"
                    )
                    self.assertLessEqual(overflow, 1, f"horizontal overflow at {width}px")
                    # Decode local responsive images before capturing the whole page.
                    # Loading=lazy otherwise makes off-screen thumbnails look absent.
                    local_images = page.evaluate(
                        """async () => {
                          await document.fonts.ready;
                          const imgs = [...document.images].filter(img =>
                            new URL(img.src, location.href).origin === location.origin
                          );
                          for (const img of imgs) img.loading = 'eager';
                          await Promise.all(imgs.map(img => img.decode().catch(() => null)));
                          return imgs.map(img => ({
                            src: img.getAttribute('src'),
                            loaded: img.complete && img.naturalWidth > 0,
                          }));
                        }"""
                    )
                    self.assertTrue(
                        all(img["loaded"] for img in local_images),
                        f"Undecoded local images at {width}px: {local_images}",
                    )
                    page.screenshot(
                        path=str(CAPTURES / f"portfolio-{width}.png"), full_page=True
                    )
                finally:
                    page.close()

    def test_noninteractive_tags_are_text_and_static_cards_are_flat(self) -> None:
        """Static editorial cards may have discreet 10px corners; tags remain noninteractive."""
        for width in (390, 1366):
            with self.subTest(width=width):
                page = self.page_for(width)
                try:
                    for selector in (".skills-grid .skill-card", ".projects-grid .project-card"):
                        el = page.locator(selector).first
                        self.assertEqual(
                            el.evaluate("node => getComputedStyle(node).borderTopLeftRadius"), "10px"
                        )
                        self.assertEqual(
                            el.evaluate("node => getComputedStyle(node).cursor"), "default"
                        )

                    tags = page.locator(".tag-cloud")
                    self.assertGreater(tags.count(), 0)
                    self.assertEqual(tags.first.evaluate("node => node.tagName"), "UL")
                    tag = tags.first.locator(".tag").first
                    self.assertEqual(tag.evaluate("node => node.tagName"), "LI")
                    computed = tag.evaluate(
                        """node => {
                          const css = getComputedStyle(node);
                          return {
                            border: css.borderTopWidth,
                            radius: css.borderTopLeftRadius,
                            background: css.backgroundColor,
                            cursor: css.cursor,
                          };
                        }"""
                    )
                    self.assertEqual(computed["border"], "1px")
                    self.assertEqual(computed["radius"], "3px")
                    self.assertNotEqual(computed["background"], "rgba(0, 0, 0, 0)")
                    self.assertEqual(computed["cursor"], "default")
                    badge = page.locator(".credential-badge").first
                    self.assertNotEqual(
                        badge.evaluate("node => getComputedStyle(node).borderTopLeftRadius"), "0px"
                    )
                finally:
                    page.close()

    def test_technology_marquee_hover_pause_and_mobile_swipe(self) -> None:
        """Desktop marquee pauses on hover; mobile keeps horizontal scrolling."""
        desktop = self.page_for(1366, reduced_motion="no-preference")
        try:
            track = desktop.locator(".tech-track")
            control = desktop.locator(".tech-motion-toggle")
            self.assertEqual(control.count(), 1)
            self.assertEqual(control.get_attribute("aria-controls"), "technology-marquee")
            self.assertGreaterEqual(control.bounding_box()["width"], 44)
            self.assertGreaterEqual(control.bounding_box()["height"], 44)
            initial_label = control.get_attribute("aria-label")
            self.assertTrue(initial_label)
            self.assertEqual(control.get_attribute("title"), initial_label)
            self.assertEqual(control.locator("svg").count(), 1)
            self.assertEqual(control.locator("span").count(), 0)
            control.click()
            self.assertNotEqual(control.get_attribute("aria-label"), initial_label)
            self.assertEqual(track.evaluate("el => getComputedStyle(el).animationPlayState"), "paused")
            self.assertIn("tech-carousel-paused", desktop.locator(".tech-carousel").get_attribute("class"))
            desktop.mouse.move(2, 2)
            self.assertEqual(track.evaluate("el => getComputedStyle(el).animationPlayState"), "paused")
            control.click()
            self.assertEqual(track.evaluate("el => getComputedStyle(el).animationPlayState"), "running")
            self.assertEqual(
                track.evaluate("el => getComputedStyle(el).animationPlayState"),
                "running",
            )
            desktop.locator(".tech-carousel").hover()
            self.assertEqual(
                track.evaluate("el => getComputedStyle(el).animationPlayState"),
                "paused",
            )
            desktop.mouse.move(2, 2)
            self.assertEqual(
                track.evaluate("el => getComputedStyle(el).animationPlayState"),
                "running",
            )
        finally:
            desktop.close()

        mobile = self.page_for(390, reduced_motion="no-preference")
        try:
            carousel = mobile.locator(".tech-carousel")
            self.assertEqual(
                carousel.evaluate("el => getComputedStyle(el).overflowX"), "auto"
            )
            self.assertGreater(
                carousel.evaluate("el => el.scrollWidth - el.clientWidth"), 0
            )
        finally:
            mobile.close()

    def test_mobile_menu_focus_trap_and_escape(self) -> None:
        """The modal navigation must preserve keyboard operation at mobile size."""
        page = self.page_for(390)
        try:
            trigger = page.locator(".bento-button")
            trigger.click()
            dialog = page.locator("#mobile-menu")
            self.assertTrue(dialog.is_visible())
            self.assertEqual(dialog.get_attribute("aria-modal"), "true")
            self.assertEqual(trigger.get_attribute("aria-expanded"), "true")
            self.assertTrue(
                page.locator('.bento-link[href="#projects"]').evaluate(
                    "el => document.activeElement === el"
                )
            )
            # Tab from the last focusable control wraps to the first.
            last = page.locator(".bento-contact-cta")
            last.focus()
            page.keyboard.press("Tab")
            self.assertTrue(
                page.locator('.bento-link[href="#projects"]').evaluate(
                    "el => document.activeElement === el"
                )
            )
            page.keyboard.press("Escape")
            dialog.wait_for(state="hidden")
            self.assertEqual(trigger.get_attribute("aria-expanded"), "false")
            page.wait_for_function(
                "() => document.activeElement?.classList.contains('bento-button')"
            )
        finally:
            page.close()

    def test_history_back_forward_and_deep_links(self) -> None:
        page = self.page_for(1366)
        try:
            page.locator('.nav-links a[href="#projects"]').click()
            page.locator('.nav-links a[href="#skills"]').click()
            self.assertTrue(page.url.endswith("#skills"))
            page.go_back(wait_until="domcontentloaded")
            page.wait_for_url("**/#projects")
            self.assertLess(page.locator("#projects-heading").bounding_box()["y"], 220)
            page.go_forward(wait_until="domcontentloaded")
            page.wait_for_url("**/#skills")
            self.assertLess(page.locator("#skills-heading").bounding_box()["y"], 220)
            page.goto(BASE_URL + "/#about", wait_until="domcontentloaded")
            page.locator("#about-heading").wait_for()
            page.wait_for_function(
                "() => document.activeElement?.id === 'about-heading'"
            )
        finally:
            page.close()

    def test_section_navigation_directly_reaches_target(self) -> None:
        for width in (390, 1366):
            with self.subTest(width=width):
                page = self.page_for(width)
                try:
                    if width < 1025:
                        page.locator(".bento-button").click()
                        page.locator('.mobile-bento-menu a[href="#projects"]').click()
                    else:
                        page.locator('.nav-links a[href="#projects"]').click()
                    self.assertTrue(page.url.endswith("#projects"))
                    heading = page.locator("#projects-heading")
                    self.assertTrue(heading.is_visible())
                    self.assertLess(heading.bounding_box()["y"], 220)
                    self.assertGreater(heading.bounding_box()["y"], -40)
                finally:
                    page.close()

    def test_project_first_sections_use_content_led_heights(self) -> None:
        """Short sections and footer should not impose an entire empty screen."""
        page = self.page_for(1366, height=900)
        try:
            layout = page.evaluate(
                """() => {
                  const ids = ['home', 'projects', 'skills', 'about', 'certifications', 'contact'];
                  return ids.map(id => {
                    const node = document.getElementById(id);
                    const rect = node.getBoundingClientRect();
                    return { id, top: rect.top + window.scrollY, height: rect.height };
                  });
                }"""
            )
            self.assertEqual(
                [item["id"] for item in layout],
                ["home", "projects", "skills", "about", "certifications", "contact"],
            )
            self.assertTrue(all(a["top"] < b["top"] for a, b in zip(layout, layout[1:])))
            for item in layout:
                if item["id"] in ("about", "certifications", "contact"):
                    self.assertLess(
                        item["height"], 750,
                        f"{item['id']} still occupies nearly an entire viewport",
                    )
            self.assertEqual(page.locator(".skill-card").count(), 4)
            desktop_media = page.locator(".compact-project .project-media")
            self.assertEqual(desktop_media.count(), 3)
            media_heights = desktop_media.evaluate_all(
                "(nodes) => nodes.map(node => Math.round(node.getBoundingClientRect().height))"
            )
            self.assertEqual(len(set(media_heights)), 1, f"Uneven project media: {media_heights}")
            self.assertEqual(page.locator(".skill-card-cloud .skill-group").count(), 3)
            self.assertEqual(
                page.locator(".skill-card-cloud").evaluate(
                    "node => getComputedStyle(node).gridColumnStart"
                ),
                "1",
            )
            self.assertEqual(page.locator(".project-card").count(), 4)
        finally:
            page.close()

    def test_compact_navigation_and_footer_contact_links(self) -> None:
        for width in (390, 1366):
            with self.subTest(width=width):
                page = self.page_for(width)
                try:
                    links = page.locator(".nav-links .nav-link")
                    self.assertEqual(links.count(), 3)
                    self.assertEqual(
                        [link.get_attribute("href") for link in links.all()],
                        ["#projects", "#skills", "#about"],
                    )
                    if width <= 1024:
                        page.locator(".bento-button").click()
                        page.locator('.bento-contact-cta[href="#contact"]').click()
                    else:
                        page.locator('.nav-contact-cta[href="#contact"]').click()
                    self.assertTrue(page.url.endswith("#contact"))
                    self.assertEqual(page.locator("#contact").count(), 1)
                    self.assertTrue(page.locator("#contact-heading").is_visible())
                finally:
                    page.close()

    def test_portrait_and_footer_typography_have_room(self) -> None:
        """Check the reported portrait overlap and clipped footer surname."""
        for width in (390, 768, 1366, 1920):
            with self.subTest(width=width):
                page = self.page_for(width)
                try:
                    portrait = page.locator(".portrait-image").bounding_box()
                    band = page.locator(".tech-strip").bounding_box()
                    self.assertIsNotNone(portrait)
                    self.assertIsNotNone(band)
                    self.assertLessEqual(
                        portrait["y"] + portrait["height"],
                        band["y"] + 1,
                        f"Portrait overlaps technology strip at {width}px",
                    )

                    name = page.locator(".footer-identity strong")
                    typography = name.evaluate(
                        """el => {
                          const cs = getComputedStyle(el);
                          const bounds = el.getBoundingClientRect();
                          return {
                            text: el.textContent.trim(),
                            paddingEnd: parseFloat(cs.paddingInlineEnd),
                            tracking: cs.letterSpacing,
                            width: bounds.width,
                            scrollWidth: el.scrollWidth,
                          };
                        }"""
                    )
                    self.assertEqual(typography["text"], "Andrea Carrillo")
                    self.assertGreaterEqual(typography["paddingEnd"], 2)
                    self.assertLessEqual(typography["scrollWidth"], typography["width"] + 1)
                finally:
                    page.close()

    def test_footer_and_external_credentials(self) -> None:
        page = self.page_for(390)
        try:
            page.locator("#contact").scroll_into_view_if_needed()
            self.assertEqual(page.locator('.footer-email[href^="mailto:"]').count(), 1)
            self.assertEqual(page.locator('.footer-socials a[target="_blank"]').count(), 2)
            self.assertEqual(
                page.locator('.credential-badge[target="_blank"]').count(), 3
            )
            self.assertTrue(page.locator("#contact-heading").is_visible())
        finally:
            page.close()


    def test_axe_accessibility_in_both_themes(self) -> None:
        """Audit actual browser-computed accessibility in light and dark themes.

        axe-core detects contrast after CSS colors, transparent surfaces, and
        component styles resolve. Gradient/image contrast may still require
        manual review; axe marks some cases as incomplete.
        """
        axe_source = os.environ.get("AXE_SOURCE")
        if not axe_source:
            self.skipTest("Set AXE_SOURCE to a pinned axe-core/axe.min.js to run this audit")
        self.assertTrue(Path(axe_source).is_file(), "axe-core source file is missing")

        for theme in ("light", "dark"):
            with self.subTest(theme=theme):
                page = self.page_for(1366)
                try:
                    if page.locator("html").get_attribute("data-theme") != theme:
                        page.locator(".nav-actions .icon-button").click()
                    page.wait_for_function(
                        "(theme) => document.documentElement.dataset.theme === theme",
                        arg=theme,
                    )
                    page.add_script_tag(path=axe_source)
                    result = page.evaluate(
                        """async () => {
                          const report = await window.axe.run(document, {
                            runOnly: {
                              type: 'tag',
                              values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
                            },
                            rules: { 'color-contrast': { enabled: true } },
                          });
                          return {
                            violations: report.violations.map(v => ({
                              id: v.id,
                              impact: v.impact,
                              nodes: v.nodes.map(n => ({
                                target: n.target,
                                summary: n.failureSummary,
                              })),
                            })),
                            incomplete: report.incomplete.map(v => ({
                              id: v.id, count: v.nodes.length,
                            })),
                            passes: report.passes.map(v => v.id),
                          };
                        }"""
                    )
                    (AUDITS / f"axe-{theme}.json").write_text(
                        json.dumps(result, ensure_ascii=False, indent=2),
                        encoding="utf-8",
                    )
                    failures = json.dumps(result["violations"], ensure_ascii=False, indent=2)
                    self.assertEqual(
                        result["violations"], [],
                        f"axe-core violations in {theme} theme:\\n{failures}",
                    )
                finally:
                    page.close()

    def test_keyboard_focus_is_visually_apparent(self) -> None:
        """Focusable controls need a visible outline in both themes."""
        for theme in ("light", "dark"):
            with self.subTest(theme=theme):
                page = self.page_for(1366)
                try:
                    if page.locator("html").get_attribute("data-theme") != theme:
                        page.locator(".nav-actions .icon-button").click()
                    page.wait_for_function(
                        "(theme) => document.documentElement.dataset.theme === theme",
                        arg=theme,
                    )
                    # Keyboard modality activates :focus-visible.
                    page.keyboard.press("Tab")
                    for selector in (
                        '.nav-links a[href="#projects"]',
                        '.hero-cta-row a[href="#projects"]',
                        '.credential-badge',
                        '.footer-email',
                    ):
                        element = page.locator(selector).first
                        element.focus()
                        state = element.evaluate(
                            """node => {
                              const css = getComputedStyle(node);
                              return {
                                focusVisible: node.matches(':focus-visible'),
                                outline: css.outlineStyle,
                                width: parseFloat(css.outlineWidth),
                              };
                            }"""
                        )
                        self.assertTrue(
                            state["focusVisible"] and
                            state["outline"] not in ("none", "hidden") and
                            state["width"] >= 2,
                            f"Missing keyboard focus indication for {selector} in {theme}: {state}",
                        )
                finally:
                    page.close()

    def test_theme_and_language_controls(self) -> None:
        page = self.page_for(1366)
        try:
            original = page.locator("html").get_attribute("data-theme")
            page.locator(".nav-actions .icon-button").click()
            self.assertNotEqual(page.locator("html").get_attribute("data-theme"), original)
            initial_language = page.locator("html").get_attribute("lang")
            page.locator(".language-button").click()
            self.assertNotEqual(page.locator("html").get_attribute("lang"), initial_language)
        finally:
            page.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
