import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

export const SUPPORTED_LANGS = ['en', 'ru', 'uk'] as const
export const NAMESPACES = ['common', 'auth', 'game', 'parties', 'history'] as const

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: SUPPORTED_LANGS,
    fallbackLng: 'en',
    ns: NAMESPACES,
    defaultNS: 'common',

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lang',
    },

    interpolation: {
      escapeValue: false, // React уже экранирует
    },

    react: {
      useSuspense: true, // ждём загрузки переводов перед рендером
    },
  })

export default i18n
