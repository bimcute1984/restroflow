"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import translations, { type Locale, type TranslationKeys } from "@/lib/i18n/translations";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextType>({
  locale: "th",
  setLocale: () => {},
  t: translations.th,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("th");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("restroflow-locale") as Locale | null;
    if (saved && saved in translations) {
      setLocaleState(saved);
    }
    setMounted(true);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    if (mounted) localStorage.setItem("restroflow-locale", l);
  }

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("restroflow-locale", locale);
  }, [locale, mounted]);

  const t = translations[locale];

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
