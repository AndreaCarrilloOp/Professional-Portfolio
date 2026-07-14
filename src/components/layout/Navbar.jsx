import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaMoon, FaSun, FaThLarge } from "react-icons/fa";
import { NAV_ITEMS } from "../../constants";

function Navbar({ darkMode, onToggleTheme }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const menuButtonRef = useRef(null);
  const firstMobileLinkRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    let ticking = false;

    const updateScrolled = () => {
      const nextScrolled = window.scrollY > 12;
      setScrolled((current) => (current === nextScrolled ? current : nextScrolled));
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScrolled);
    };

    updateScrolled();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth > 1024) setOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.href.replace("#", ""));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.2, 0.35, 0.55],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      firstMobileLinkRef.current?.focus();
    } else {
      document.body.style.overflow = "";
      if (wasOpenRef.current) {
        menuButtonRef.current?.focus();
      }
    }

    wasOpenRef.current = open;

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        mobileMenuRef.current?.querySelectorAll(focusableSelector) ?? [],
      ).filter((element) => element.offsetParent !== null);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const changeLanguage = () => {
    i18n.changeLanguage(i18n.language?.startsWith("es") ? "en" : "es");
  };

  const closeMenu = () => setOpen(false);

  const handleNavClick = (id) => {
    setActiveSection(id);
    closeMenu();
  };

  return (
    <header
      className={`nav-shell ${scrolled ? "nav-shell-scrolled" : ""} ${open ? "nav-shell-open" : ""}`}
    >
      <nav className="nav-container" aria-label={t("accessibility.mainNavigation")}>
        <a
          href="#home"
          className="brand"
          aria-label="Andrea Carrillo home"
          onClick={closeMenu}
        >
          AC
        </a>

        <div className="nav-links" aria-label={t("accessibility.primaryLinks")}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                aria-current={isActive ? "location" : undefined}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon className="nav-link-icon" aria-hidden="true" />
                <span>{t(item.labelKey)}</span>
              </a>
            );
          })}
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="icon-button"
            onClick={onToggleTheme}
            aria-label={darkMode ? t("theme.light") : t("theme.dark")}
            aria-pressed={darkMode}
          >
            {darkMode ? (
              <FaSun aria-hidden="true" />
            ) : (
              <FaMoon aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className="language-button"
            onClick={changeLanguage}
            aria-label={t("language.label")}
          >
            {i18n.language?.startsWith("es") ? "EN" : "ES"}
          </button>
          <button
            type="button"
            className="bento-button"
            onClick={() => setOpen((value) => !value)}
            aria-label={
              open
                ? t("accessibility.closeMenu")
                : t("accessibility.openMenu")
            }
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-haspopup="dialog"
            ref={menuButtonRef}
          >
            <FaThLarge aria-hidden="true" />
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`mobile-bento-menu ${open ? "mobile-bento-menu-open" : ""}`}
        aria-label={t("accessibility.mobileNavigation")}
        role="dialog"
        aria-modal="true"
        hidden={!open}
        ref={mobileMenuRef}
      >
        <div className="bento-handle" aria-hidden="true" />
        <div className="bento-grid">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`bento-link ${isActive ? "bento-link-active" : ""}`}
                aria-current={isActive ? "location" : undefined}
                onClick={() => handleNavClick(item.id)}
                tabIndex={open ? 0 : -1}
                ref={index === 0 ? firstMobileLinkRef : undefined}
              >
                <span className="bento-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon aria-hidden="true" />
                <span>{t(item.labelKey)}</span>
              </a>
            );
          })}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
