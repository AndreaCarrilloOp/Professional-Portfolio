import { useTranslation } from "react-i18next";
import SectionHeader from "../ui/SectionHeader";

function About() {
  const { t } = useTranslation();

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
          <p>{t("about.approach")}</p>
        </div>
      </div>
    </section>
  );
}

export default About;
