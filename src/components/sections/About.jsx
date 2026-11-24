import { useTranslation } from "react-i18next";
import SectionHeader from "../ui/SectionHeader";

function About() {
  const { t } = useTranslation();
  const stats = [
    [t("about.statOneValue"), t("about.statOneLabel")],
    [t("about.statTwoValue"), t("about.statTwoLabel")],
    [t("about.statThreeValue"), t("about.statThreeLabel")],
  ];

  return (
    <section id="about" className="section-pad" aria-labelledby="about-heading">
      <div className="content-grid two-columns">
        <SectionHeader
          headingId="about-heading"
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
        </div>
      </div>
    </section>
  );
}

export default About;
