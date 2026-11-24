import { SKILLS } from "../../constants";
import SectionHeader from "../ui/SectionHeader";
import { useTranslation } from "react-i18next";

function Skills() {
  const { t } = useTranslation();

  return (
    <section id="skills" className="section-pad" aria-labelledby="skills-heading">
      <SectionHeader headingId="skills-heading" eyebrowKey="skills.eyebrow" titleKey="skills.title" descriptionKey="skills.description" />
      <div className="skills-grid">
        {SKILLS.map(({ id, icon: Icon, titleKey, items, groups }) => (
          <article key={id} className="skill-card card reveal-up">
            <div className="skill-icon"><Icon aria-hidden="true" /></div>
            <h3>{t(titleKey)}</h3>
            <p className="skill-description">{t(`skills.${id}.description`)}</p>
            {groups ? (
              <div className="skill-groups">
                {groups.map((group) => (
                  <div className="skill-group" key={group.labelKey}>
                    <p className="skill-group-label">{t(group.labelKey)}</p>
                    <ul className="tag-cloud">
                      {group.items.map((item) => <li key={item} className="tag">{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="tag-cloud">
                {items.map((item) => <li key={item} className="tag">{item}</li>)}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default Skills;
