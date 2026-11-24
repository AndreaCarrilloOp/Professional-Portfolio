import { FaExternalLinkAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { CERTIFICATIONS } from "../../constants";
import SectionHeader from "../ui/SectionHeader";

function Certifications() {
  const { t } = useTranslation();

  return (
    <section
      id="certifications"
      className="section-pad compact-section certifications-section"
      aria-labelledby="certifications-heading"
    >
      <SectionHeader
        headingId="certifications-heading"
        eyebrowKey="certifications.eyebrow"
        titleKey="certifications.title"
        descriptionKey="certifications.description"
      />

      <ul className="credential-badges">
        {CERTIFICATIONS.map(({ id, title, code, badgeImage, credentialUrl }) => (
          <li key={id}>
            <a
              className="credential-badge"
              href={credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${code} — ${title}: ${t("certifications.viewCredential")}, ${t("accessibility.externalLink")}`}
              title={title}
            >
              <img
                src={badgeImage}
                width="60"
                height="60"
                loading="lazy"
                decoding="async"
                alt=""
              />
              <span className="credential-code">{code}</span>
              <FaExternalLinkAlt aria-hidden="true" className="credential-external" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Certifications;
