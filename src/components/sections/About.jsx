import { useTranslation } from "react-i18next";
import { FaCheckCircle } from "react-icons/fa";
import SectionHeader from "../ui/SectionHeader";

function About() {
  const { t } = useTranslation();
  const highlights = [
    "about.highlightOne",
    "about.highlightTwo",
    "about.highlightThree",
  ];
  const stats = [
    [t("about.statOneValue"), t("about.statOneLabel")],
    [t("about.statTwoValue"), t("about.statTwoLabel")],
    [t("about.statThreeValue"), t("about.statThreeLabel")],
  ];

  return (
    <section id="about" className="section-pad">
      <div className="content-grid two-columns">
        <SectionHeader
          eyebrowKey="about.eyebrow"
          titleKey="about.title"
          align="left"
        />
        <div className="about-card card reveal-up">
          <p>{t("about.description")}</p>
          <div className="about-stats">
            {stats.map(([value, label]) => (
              <div className="about-stat" key={label}>
                <strong>{value}</strong>
                <small>{label}</small>
              </div>
            ))}
          </div>
          <div className="highlight-list">
            {highlights.map((item) => (
              <span key={item}>
                <FaCheckCircle aria-hidden="true" /> {t(item)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
