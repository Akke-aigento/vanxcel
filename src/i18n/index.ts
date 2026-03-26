import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import nl from './locales/nl.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

// Custom hostname-based language detector
const hostnameDetector = {
  name: 'hostname',
  lookup(): string {
    const hostname = window.location.hostname;
    if (hostname.endsWith('.com')) return 'en';
    if (hostname.endsWith('.de')) return 'de';
    if (hostname.endsWith('.fr')) return 'fr';
    // .app (Lovable preview), .nl, .be, everything else → Dutch
    return 'nl';
  },
  cacheUserLanguage(): void {
    // no-op — hostname detection shouldn't cache
  },
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(hostnameDetector);

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      nl: { translation: nl },
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
    },
    fallbackLng: 'nl',
    detection: {
      order: ['localStorage', 'hostname', 'navigator'],
      lookupLocalStorage: 'vanxcel_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
