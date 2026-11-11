import { ActionIcon } from "@mantine/core";
import { useLanguage } from "../context/useLanguage.ts";

/** Shows "عربي" while the UI is English, "EN" while it is Arabic. */
export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();
  const toArabic = lang === "en";

  // WCAG 2.5.3: the accessible name must contain the visible text
  // ("عربي" / "EN"), so the label leads with it.
  const visible = toArabic ? "عربي" : "EN";
  const label = toArabic ? t.common.switchToArabic : t.common.switchToEnglish;

  return (
    <ActionIcon
      variant="default"
      fz="sm"
      fw={700}
      aria-label={`${visible} — ${label}`}
      onClick={() => setLang(toArabic ? "ar" : "en")}>
      {visible}
    </ActionIcon>
  );
}
