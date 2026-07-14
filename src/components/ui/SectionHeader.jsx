import { useTranslation } from "react-i18next";

function SectionHeader({ eyebrowKey, titleKey, descriptionKey, align = "center" }) {
  const { t } = useTranslation();
  const alignmentClass =
    align === "left" ? "section-header-left" : "section-header-center";

  return (
    <div className={`section-header ${alignmentClass}`}>
      <span className="eyebrow">{t(eyebrowKey)}</span>
      <h2 className="section-title">{t(titleKey)}</h2>
      {descriptionKey && (
        <p className="section-description">{t(descriptionKey)}</p>
      )}
    </div>
  );
}

export default SectionHeader;
