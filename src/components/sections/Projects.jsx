import { useTranslation } from "react-i18next";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { PROJECTS } from "../../constants";
import SectionHeader from "../ui/SectionHeader";

function Projects() {
  const { t } = useTranslation();

  return (
    <section id="projects" className="section-pad">
      <SectionHeader
        eyebrowKey="projects.eyebrow"
        titleKey="projects.title"
        descriptionKey="projects.description"
      />
      <div className="projects-grid">
        {PROJECTS.map((project) => (
          <article
            key={project.id}
            className={`project-card card ${project.featured ? "featured-project" : "compact-project"} reveal-up`}
          >
            <div className="project-media">
              {project.featured && (
                <span className="project-badge">{t("projects.featured")}</span>
              )}
              <picture>
                {project.image.kind === "responsive" && (
                  <>
                    {project.image.avifSrcSet && (
                      <source
                        type="image/avif"
                        srcSet={project.image.avifSrcSet}
                        sizes={project.image.sizes}
                      />
                    )}
                    <source
                      type="image/webp"
                      srcSet={project.image.webpSrcSet}
                      sizes={project.image.sizes}
                    />
                  </>
                )}
                <img
                  src={project.image.fallback}
                  alt={t(project.titleKey)}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  width={project.image.width}
                  height={project.image.height}
                  sizes={project.image.sizes}
                />
              </picture>
            </div>
            <div className="project-content">
              <div className="project-meta">
                <span>{project.year}</span>
                <span>{t(project.roleKey)}</span>
                <span className="project-status">{t(project.statusKey)}</span>
              </div>
              <h3>{t(project.titleKey)}</h3>
              <p>{t(project.descriptionKey)}</p>
              <details className="project-evidence" name="project-evidence">
                <summary>
                  <span>{t("projects.evidenceCta")}</span>
                </summary>
                <dl className="project-evidence-list">
                  <div>
                    <dt>{t("projects.labels.problem")}</dt>
                    <dd>{t(project.problemKey)}</dd>
                  </div>
                  <div>
                    <dt>{t("projects.labels.contribution")}</dt>
                    <dd>{t(project.contributionKey)}</dd>
                  </div>
                  <div>
                    <dt>{t("projects.labels.outcome")}</dt>
                    <dd>{t(project.outcomeKey)}</dd>
                  </div>
                </dl>
              </details>
              <div className="tag-cloud">
                {project.techs.map((tech) => (
                  <span className="tag" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
              <div className="project-links">
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${t("projects.repo")}: ${t(project.titleKey)}, ${t("accessibility.externalLink")}`}
                  >
                    <FaGithub aria-hidden="true" /> {t("projects.repo")}
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    target={project.demo.startsWith("#") ? undefined : "_blank"}
                    rel={project.demo.startsWith("#") ? undefined : "noreferrer"}
                    aria-label={`${t("projects.demo")}: ${t(project.titleKey)}${
                      project.demo.startsWith("#")
                        ? ""
                        : `, ${t("accessibility.externalLink")}`
                    }`}
                  >
                    <FaExternalLinkAlt aria-hidden="true" /> {t("projects.demo")}
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Projects;
