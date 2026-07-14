import { useTranslation } from "react-i18next";
import { COPYRIGHT_NAME } from "../../constants";

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <strong>{COPYRIGHT_NAME}</strong>
      <span>{t("footer.built")}</span>
      <small>© 2026 · {t("footer.rights")}</small>
    </footer>
  );
}

export default Footer;
