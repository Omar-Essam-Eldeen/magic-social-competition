import { ActionIcon } from "@mantine/core";
import { useLanguage } from "../context/useLanguage.ts";

/** Shows "عربي" while the UI is English, "EN" while it is Arabic. */
export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();
  const toArabic = lang === "en";

  return (
    <ActionIcon
      variant="default"
      fz="sm"
      fw={700}
      aria-label={toArabic ? t.common.switchToArabic : t.common.switchToEnglish}
      onClick={() => setLang(toArabic ? "ar" : "en")}>
      {toArabic ? "عربي" : "EN"}
    </ActionIcon>
  );
}
