import { createContext } from "react";
import type { Dict, Language } from "../i18n/dictionary.ts";

export interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  /** Dictionary for the current language — re-resolves on every toggle. */
  t: Dict;
  dir: "ltr" | "rtl";
}

export const LanguageContext = createContext<LanguageContextType | null>(null);
