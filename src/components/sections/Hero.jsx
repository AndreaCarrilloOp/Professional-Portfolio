import { useTranslation } from "react-i18next";
import { FaArrowRight, FaRegCircle } from "react-icons/fa";
import {
  PROFILE_IMAGE_DARK,
  PROFILE_IMAGE_LIGHT,
  SOCIAL_LINKS,
  TECH_STACK,
} from "../../constants";

function Hero({ darkMode }) {
  const { t } = useTranslation();
  const focusItems = ["hero.focusOne", "hero.focusTwo", "hero.focusThree"];
  const heroSocialLinks = SOCIAL_LINKS.filter(({ id }) => id !== "email");
  const profileImage = darkMode ? PROFILE_IMAGE_DARK : PROFILE_IMAGE_LIGHT;

  const handleProfileImageError = (event) => {
    if (!profileImage.errorFallback || event.currentTarget.dataset.fallbackApplied === "true") {
      return;
    }

    event.currentTarget.dataset.fallbackApplied = "true";
    event.currentTarget.src = profileImage.errorFallback;
  };

  return (
    <section id="home" className="hero-section section-pad">
      <div className="hero-grid">
        <div className="hero-copy reveal-up">
          <div className="status-pill">
            <FaRegCircle aria-hidden="true" /> {t("hero.status")}
          </div>
          <h1 className="hero-title">
            <span className="hero-name-first">Andrea</span>
            <span className="hero-name-last">Carrillo</span>
          </h1>
          <p className="hero-role">{t("hero.eyebrow")}</p>
          <p className="hero-description">
            {t("hero.descriptionLead")} {" "}
            <strong>{t("hero.descriptionHighlight")}</strong>{" "}
            {t("hero.descriptionTail")}
          </p>

          <div className="hero-focus-grid" aria-label={t("hero.focusLabel")}>
            {focusItems.map((item) => (
              <span key={item} className="hero-focus-item">
                {t(item)}
              </span>
            ))}
          </div>

          <div className="hero-actions hero-cta-row" role="group" aria-label={t("hero.primaryActionsLabel")}>
            <a href="#projects" className="btn btn-primary hero-cta-primary">
              <span>{t("hero.ctaProjects")}</span>
              <span className="btn-icon-pill" aria-hidden="true">
                <FaArrowRight />
              </span>
            </a>
            <a href="#contact" className="btn btn-secondary hero-cta-secondary">
              {t("hero.ctaContact")}
            </a>
          </div>

          <div className="social-row hero-social-links" role="group" aria-label={t("hero.socialLabel")}>
            {heroSocialLinks.map(({ id, label, href, icon: Icon }) => {
              const isExternal = !href.startsWith("mailto");
              return (
                <a
                  key={id}
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  className="social-link"
                  aria-label={
                    isExternal
                      ? `${label}: Andrea Carrillo, ${t("accessibility.externalLink")}`
                      : `${label}: Andrea Carrillo`
                  }
                >
                  <Icon aria-hidden="true" />
                  <span className="sr-only">{label}</span>
                </a>
              );
            })}
          </div>
        </div>

        <div className="hero-visual reveal-up delay-1">
          <div className="portrait-card">
            <div className="portrait-card-shell">
              <picture className="theme-profile-image" key={darkMode ? "profile-dark" : "profile-light"}>
                <source
                  type="image/webp"
                  srcSet={profileImage.webpSrcSet}
                  sizes={profileImage.sizes}
                />
                <img
                  className="portrait-image"
                  src={profileImage.fallback}
                  alt="Andrea Carrillo"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  width={profileImage.width}
                  height={profileImage.height}
                  onError={handleProfileImageError}
                />
              </picture>
            </div>
          </div>
        </div>
      </div>

      <div
        className="tech-strip reveal-up delay-2"
        aria-label={t("hero.techLabel")}
      >
        <div className="tech-strip-header">
          <span>{t("hero.techLabel")}</span>
          <small className="tech-swipe-hint">{t("hero.techHint")}</small>
        </div>
        <div className="tech-carousel">
          <div className="tech-track">
            {TECH_STACK.map(({ id, label, icon: Icon }) => (
              <div className="tech-chip" key={id}>
                <Icon aria-hidden="true" />
                <small>{label}</small>
              </div>
            ))}
            {TECH_STACK.map(({ id, label, icon: Icon }) => (
              <div className="tech-chip" key={`${id}-clone`} aria-hidden="true">
                <Icon aria-hidden="true" />
                <small>{label}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
