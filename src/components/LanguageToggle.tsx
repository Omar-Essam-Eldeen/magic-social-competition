import { UnstyledButton } from "@mantine/core";
import { useLanguage } from "../context/useLanguage.ts";

/** EN/AR pill: both segments visible, the active one filled with the accent gradient. */
export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  // WCAG 2.5.3: the accessible name must contain the visible text ("EN" / "AR"),
  // so the label leads with it.
  const segments = [
    { code: "en" as const, visible: "EN", label: t.common.switchToEnglish },
    { code: "ar" as const, visible: "AR", label: t.common.switchToArabic },
  ] as const;

  return (
    <div className="glass-chip" style={{ display: "inline-flex", padding: 2, borderRadius: 999 }}>
      {segments.map(({ code, visible, label }) => {
        const active = lang === code;
        return (
          <UnstyledButton
            key={code}
            aria-pressed={active}
            aria-label={`${visible} — ${label}`}
            onClick={() => setLang(code)}
            style={{
              background: active ? "var(--accent-grad)" : "transparent",
              color: active ? "#fff" : "var(--mantine-color-dimmed)",
              borderRadius: 999,
              padding: "4px 10px",
              fontWeight: 800,
              fontSize: "0.8rem",
            }}>
            {visible}
          </UnstyledButton>
        );
      })}
    </div>
  );
}
