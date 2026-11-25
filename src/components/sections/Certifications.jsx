import { useState } from "react";
import { FaAward, FaExternalLinkAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { CERTIFICATIONS } from "../../constants";
import SectionHeader from "../ui/SectionHeader";

function CredentialBadge({ title, code, badgeImage, credentialUrl, linkLabel }) {
  const [imageReady, setImageReady] = useState(false);

  return (
    <li>
      <a
        className="credential-badge"
        href={credentialUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${code} — ${title}: ${linkLabel}`}
        title={title}
      >
        <span className="credential-art" aria-hidden="true">
          <FaAward className="credential-fallback" />
          {badgeImage && (
            <img
              src={badgeImage}
              className={imageReady ? "credential-logo-ready" : ""}
              width="60"
              height="60"
              loading="lazy"
              decoding="async"
              alt=""
              onLoad={(event) => setImageReady(event.currentTarget.naturalWidth > 0)}
              onError={() => setImageReady(false)}
            />
          )}
        </span>
        <span className="credential-code">{code}</span>
        <FaExternalLinkAlt aria-hidden="true" className="credential-external" />
      </a>
    </li>
  );
}

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
        align="center"
      />

      <ul className="credential-badges">
        {CERTIFICATIONS.map(({ id, title, code, badgeImage, credentialUrl }) => (
          <CredentialBadge
            key={id}
            title={title}
            code={code}
            badgeImage={badgeImage}
            credentialUrl={credentialUrl}
            linkLabel={`${t("certifications.viewCredential")}, ${t("accessibility.externalLink")}`}
          />
        ))}
      </ul>
    </section>
  );
}

export default Certifications;
