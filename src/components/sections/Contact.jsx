import { useTranslation } from "react-i18next";
import { EMAIL, SOCIAL_LINKS } from "../../constants";

function Contact() {
  const { t } = useTranslation();
  const emailLink = SOCIAL_LINKS.find((link) => link.id === "email");
  const EmailIcon = emailLink.icon;
  const otherLinks = SOCIAL_LINKS.filter((link) => link.id !== "email");

  return (
    <section id="contact" className="footer-contact" aria-labelledby="contact-heading">
      <div className="footer-contact-inner">
        <div className="footer-contact-intro">
          <span className="eyebrow">{t("contact.eyebrow")}</span>
          <h2 id="contact-heading" className="footer-contact-title">{t("contact.title")}</h2>
          <p>{t("contact.description")}</p>
        </div>
        <div className="footer-contact-actions">
          <a className="footer-email" href={emailLink.href} aria-label={`${t("contact.email")}: ${EMAIL}`}>
            <EmailIcon aria-hidden="true" />
            <span>{EMAIL}</span>
          </a>
          <div className="footer-socials" role="group" aria-label={t("contact.channelsLabel")}>
            {otherLinks.map(({ id, href, icon: Icon }) => (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t(`contact.${id}`)}, ${t("accessibility.externalLink")}`}
              >
                <Icon aria-hidden="true" />
                <span>{t(`contact.${id}`)}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
