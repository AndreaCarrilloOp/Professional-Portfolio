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

    def test_responsive_layout_and_technology_carousel(self) -> None:
        for width in (320, 390, 768, 1366, 1920):
            with self.subTest(width=width):
                page = self.page_for(width)
                try:
                    self.assertEqual(page.locator("#contact").count(), 1)
                    self.assertEqual(page.locator(".project-card").count(), 3)
                    self.assertEqual(page.locator(".credential-badge").count(), 3)
                    carousel = page.locator(".tech-carousel")
                    self.assertEqual(carousel.count(), 1)
                    self.assertEqual(carousel.get_attribute("tabindex"), "0")
                    overflow = page.evaluate(
                        "() => document.documentElement.scrollWidth - window.innerWidth"
                    )
                    self.assertLessEqual(overflow, 1, f"horizontal overflow at {width}px")
                    page.screenshot(
                        path=str(CAPTURES / f"portfolio-{width}.png"), full_page=True
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
