import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { LANGUAGE_UI } from 'constants/localStorageKeys';
import { defaultLang, languageKey } from 'i18n/languages';
import translationEN from 'locales/en/translation.json';
import translationES from 'locales/es/translation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
  }
}

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    detection: {
      lookupLocalStorage: LANGUAGE_UI,
    },
    fallbackLng: defaultLang,
    interpolation: {
      escapeValue: false,
    },
    // lng: localStorage.getItem(LANGUAGE_UI) || defaultLang,
    resources: {
      [languageKey.enEn]: {
        translation: translationEN,
      },
      [languageKey.esEs]: {
        translation: translationES,
      },
    },
    returnNull: false,
  });

export default i18n;
