import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import nl from './locales/nl.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

// Domain-based fallback detection
const getDefaultLanguage = (): string => {
  const hostname = window.location.hostname;
  if (hostname.endsWith('.com')) return 'en';
  if (hostname.endsWith('.de')) return 'de';
  if (hostname.endsWith('.fr')) return 'fr';
  return 'nl'; // .nl, .be, default
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      nl: { translation: nl },
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
    },
    fallbackLng: getDefaultLanguage(),
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'vanxcel_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
