import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import km from "./locales/km.json";
import zh from "./locales/zh.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "km", label: "ភាសាខ្មែរ", short: "KM" },
  { code: "zh", label: "中文", short: "ZH" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const STORAGE_KEY = "fixflow-language";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      km: { translation: km },
      zh: { translation: zh },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES.map((language) => language.code),
    // "en-US" and friends should resolve to "en" rather than falling back.
    load: "languageOnly",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
  });

/** Keeps <html lang> in sync so the Khmer/Chinese font stack applies. */
const applyDocumentLanguage = (language: string) => {
  document.documentElement.lang = language.split("-")[0];
};

applyDocumentLanguage(i18n.language || "en");
i18n.on("languageChanged", applyDocumentLanguage);

export default i18n;
