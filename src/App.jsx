import "./i18n/i18n";
import "./styles/tokens.css";
import "./styles/theme.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/enhancements.css";
import "./styles/hero.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTranslation } from "react-i18next";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Skills from "./components/sections/Skills";
import Projects from "./components/sections/Projects";
import Certifications from "./components/sections/Certifications";
import ConstellationBackground from "./components/ui/ConstellationBackground";

const THEME_COLORS = {
  light: "#A9B1BF",
  dark: "#151E2C",
};

function getInitialDarkMode() {
  const documentTheme = document.documentElement.dataset.theme;
  if (documentTheme === "dark") return true;
  if (documentTheme === "light") return false;

  // Storage can be unavailable in privacy-restricted browser contexts.
  try {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") return true;
    if (storedTheme === "light") return false;
  } catch {
    // Fall back to the OS preference.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyDocumentTheme(darkMode) {
  const root = document.documentElement;
  const theme = darkMode ? "dark" : "light";
  const themeColor = THEME_COLORS[theme];

  root.classList.toggle("dark", darkMode);
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  root.style.backgroundColor = themeColor;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Theme switching still works for this session without persistence.
  }
}

function App() {
  const { i18n, t } = useTranslation();
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const themeTransitionRef = useRef(false);

  useEffect(() => {
    applyDocumentTheme(darkMode);
  }, [darkMode]);

  const toggleTheme = useCallback(() => {
    if (themeTransitionRef.current) return;

    const nextDarkMode = !darkMode;
    const root = document.documentElement;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const commitTheme = () => {
      applyDocumentTheme(nextDarkMode);
      flushSync(() => setDarkMode(nextDarkMode));
    };

    if (!reduceMotion && typeof document.startViewTransition === "function") {
      themeTransitionRef.current = true;
      const transition = document.startViewTransition(commitTheme);
      // A skipped view transition may reject; either way unlock the toggle.
      transition.finished.then(
        () => { themeTransitionRef.current = false; },
        () => { themeTransitionRef.current = false; },
      );
      return;
    }

    themeTransitionRef.current = true;
    root.classList.add("theme-transitioning");
    commitTheme();

    window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
      themeTransitionRef.current = false;
    }, reduceMotion ? 20 : 380);
  }, [darkMode]);

  useEffect(() => {
    const isSpanish = i18n.language?.startsWith("es");
    document.documentElement.lang = isSpanish ? "es" : "en";
    document.title = t("seo.title");

    const setMeta = (selector, content) => {
      document.querySelector(selector)?.setAttribute("content", content);
    };

    const description = t("seo.description");
    const title = t("seo.title");
    const imageAlt = t("seo.imageAlt");

    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:locale"]', t("seo.locale"));
    setMeta('meta[property="og:image:alt"]', imageAlt);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image:alt"]', imageAlt);
  }, [i18n.language, t]);

  useEffect(() => {
    const revealItems = document.querySelectorAll(".reveal-up");
    if (revealItems.length === 0) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -6% 0px",
      },
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {t("accessibility.skipToContent")}
      </a>
      <ConstellationBackground darkMode={darkMode} />
      <Navbar darkMode={darkMode} onToggleTheme={toggleTheme} />
      <main id="main-content" tabIndex="-1">
        <Hero darkMode={darkMode} />
        <Projects />
        <Skills />
        <About />
        <Certifications />
      </main>
      <Footer />
    </div>
  );
}

export default App;
