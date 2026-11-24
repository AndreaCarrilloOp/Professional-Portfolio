import { useTranslation } from "react-i18next";
import { COPYRIGHT_NAME } from "../../constants";
import Contact from "../sections/Contact";

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <Contact />
      <div className="footer-inner">
        <div className="footer-identity">
          <strong>{COPYRIGHT_NAME}</strong>
          <small>© 2026 · {t("footer.rights")}</small>
        </div>
        <span className="footer-credit">{t("footer.built")}</span>
      </div>
    </footer>
  );
}

export default Footer;
