import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { LanguageContext } from "./LanguageContext.tsx";
import { ar, en, type Dict, type Language } from "../i18n/dictionary.ts";

const STORAGE_KEY = "lang";

function readInitialLang(): Language {
  try {
    return localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(readInitialLang);

  const setLang = (next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private mode, etc.) — language still applies
      // for this session, it just won't persist.
    }
  };

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";
  const t: Dict = lang === "ar" ? ar : en;

  // Mantine v9 follows the <html> dir attribute for RTL — no provider
  // prop needed. Keep lang in sync too, for screen readers and the browser.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return <LanguageContext.Provider value={{ lang, setLang, t, dir }}>{children}</LanguageContext.Provider>;
}
