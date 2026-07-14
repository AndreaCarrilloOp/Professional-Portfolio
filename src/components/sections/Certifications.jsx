import { FaExternalLinkAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { CERTIFICATIONS } from "../../constants";
import SectionHeader from "../ui/SectionHeader";

function Certifications() {
  const { t } = useTranslation();

  return (
    <section id="certifications" className="section-pad compact-section">
      <SectionHeader
        eyebrowKey="certifications.eyebrow"
        titleKey="certifications.title"
        descriptionKey="certifications.description"
      />
      <div className="cert-grid">
        {CERTIFICATIONS.map(
          ({ id, icon: Icon, title, code, statusKey, credentialUrl }) => (
            <a
              key={id}
              className="cert-card cert-link card reveal-up"
              href={credentialUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${title}: ${t("certifications.viewCredential")}`}
            >
              <div className="skill-icon">
                <Icon aria-hidden="true" />
              </div>
              <div className="cert-content">
                <span className="cert-status">{t(statusKey)}</span>
                <h3>{title}</h3>
                <p>{code}</p>
                <span className="cert-action">
                  {t("certifications.viewCredential")}
                  <FaExternalLinkAlt aria-hidden="true" />
                </span>
              </div>
            </a>
          ),
        )}
      </div>
    </section>
  );
}

export default Certifications;
