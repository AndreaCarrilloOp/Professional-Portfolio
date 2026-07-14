import { SKILLS } from "../../constants";
import SectionHeader from "../ui/SectionHeader";
import { useTranslation } from "react-i18next";

function Skills() {
  const { t } = useTranslation();

  return (
    <section id="skills" className="section-pad">
      <SectionHeader eyebrowKey="skills.eyebrow" titleKey="skills.title" descriptionKey="skills.description" />
      <div className="skills-grid">
        {SKILLS.map(({ id, icon: Icon, titleKey, items }) => (
          <article key={id} className="skill-card card reveal-up">
            <div className="skill-icon"><Icon aria-hidden="true" /></div>
            <h3>{t(titleKey)}</h3>
            <div className="tag-cloud">
              {items.map((item) => <span key={item} className="tag">{item}</span>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Skills;
