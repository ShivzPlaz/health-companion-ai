import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enJSON from "./locales/en.json";
import esJSON from "./locales/es.json";
import knJSON from "./locales/kn.json";

const resources = {
  en: { translation: enJSON },
  es: { translation: esJSON },
  kn: { translation: knJSON },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
