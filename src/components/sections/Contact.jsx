import { useTranslation } from "react-i18next";
import { EMAIL, SOCIAL_LINKS } from "../../constants";
import SectionHeader from "../ui/SectionHeader";

const SOCIAL_LINKS_BY_ID = Object.fromEntries(
  SOCIAL_LINKS.map((link) => [link.id, link]),
);

function Contact() {
  const { t } = useTranslation();
  const contactMeta = [
    t("contact.availability"),
    t("contact.location"),
    t("contact.mode"),
  ];
  const contactLinks = [
    {
      ...SOCIAL_LINKS_BY_ID.email,
      label: t("contact.email"),
      value: EMAIL,
      primary: true,
    },
    {
      ...SOCIAL_LINKS_BY_ID.linkedin,
      label: t("contact.linkedin"),
      value: "linkedin.com/in/andrea-carrillo-vlk",
      primary: false,
    },
    {
      ...SOCIAL_LINKS_BY_ID.github,
      label: t("contact.github"),
      value: "github.com/AndreaCarrilloOp",
      primary: false,
    },
  ];

  return (
    <section id="contact" className="section-pad contact-section">
      <div className="contact-card card reveal-up">
        <SectionHeader
          eyebrowKey="contact.eyebrow"
          titleKey="contact.title"
          descriptionKey="contact.description"
        />
        <div className="contact-meta" aria-label={t("contact.title")}>
          {contactMeta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="contact-grid" aria-label={t("contact.channelsLabel")}>
          {contactLinks.map(({ id, label, value, href, icon: Icon, primary }) => {
            const isExternal = !href.startsWith("mailto");
            return (
              <a
                key={id}
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
                className={`contact-link ${primary ? "contact-link-primary" : ""}`}
                aria-label={
                  isExternal
                    ? `${label}: ${value}, ${t("accessibility.externalLink")}`
                    : `${label}: ${value}`
                }
              >
                <Icon aria-hidden="true" />
                <span>
                  <strong>{label}</strong>
                  <small>{value}</small>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Contact;
