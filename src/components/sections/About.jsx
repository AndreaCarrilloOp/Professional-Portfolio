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
