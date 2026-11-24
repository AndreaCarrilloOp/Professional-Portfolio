import { FaExternalLinkAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { CERTIFICATIONS } from "../../constants";
import SectionHeader from "../ui/SectionHeader";

function Certifications() {
  const { t } = useTranslation();

  return (
    <section id="certifications" className="section-pad compact-section" aria-labelledby="certifications-heading">
      <SectionHeader
        headingId="certifications-heading"
        eyebrowKey="certifications.eyebrow"
        titleKey="certifications.title"
        descriptionKey="certifications.description"
      />
      <div className="cert-grid">
        {CERTIFICATIONS.map(({ id, icon: Icon, title, code, statusKey, credentialUrl }) => {
          const CardElement = credentialUrl ? "a" : "article";

          return (
            <CardElement
              key={id}
              className={`cert-card card reveal-up ${credentialUrl ? "cert-link" : "cert-unlinked"}`}
              href={credentialUrl || undefined}
              target={credentialUrl ? "_blank" : undefined}
              rel={credentialUrl ? "noopener noreferrer" : undefined}
              aria-label={credentialUrl ? `${title}: ${t("certifications.viewCredential")}, ${t("accessibility.externalLink")}` : undefined}
            >
              <div className="skill-icon">
                <Icon aria-hidden="true" />
              </div>
              <div className="cert-content">
                <span className="cert-status">{t(statusKey)}</span>
                <h3>{title}</h3>
                <p>{code}</p>
                {credentialUrl ? (
                  <span className="cert-action">
                    {t("certifications.viewCredential")}
                    <FaExternalLinkAlt aria-hidden="true" />
                  </span>
                ) : (
                  <span className="cert-unlinked-note">{t("certifications.credentialPending")}</span>
                )}
              </div>
            </CardElement>
          );
        })}
      </div>
    </section>
  );
}

export default Certifications;
