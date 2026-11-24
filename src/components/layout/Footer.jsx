import { useTranslation } from "react-i18next";
import { COPYRIGHT_NAME } from "../../constants";

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <strong>{COPYRIGHT_NAME}</strong>
        <span>{t("footer.built")}</span>
        <small>© 2026 · {t("footer.rights")}</small>
      </div>
    </footer>
  );
}

export default Footer;
