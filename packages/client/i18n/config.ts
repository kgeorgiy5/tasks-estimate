import i18next, { type Resource } from "i18next";
import en from "@/i18n/messages/en.json";
import uk from "@/i18n/messages/uk.json";

const defaultLanguage = "en";

const resources = {
  en: { translation: en },
  uk: { translation: uk },
} satisfies Resource;

const supportedLanguages = Object.keys(resources);

export type AppLanguage = keyof typeof resources;

/**
 * Resolves the initial UI language from env or falls back to English.
 * NOTE: localStorage is not read here — it runs on the server too.
 * Stored language is applied client-side by LanguageSelector after init.
 */
function getInitialLanguage(): AppLanguage {
  const envLanguage = process.env.NEXT_PUBLIC_I18N_DEFAULT_LANGUAGE;

  if (envLanguage && supportedLanguages.includes(envLanguage)) {
    return envLanguage as AppLanguage;
  }

  return defaultLanguage;
}

/**
 * Initializes i18next singleton only once with app locale resources.
 */
export function initI18n(): typeof i18next {
  if (!i18next.isInitialized) {
    i18next.init({
      resources,
      lng: getInitialLanguage(),
      fallbackLng: defaultLanguage,
      defaultNS: "translation",
      interpolation: {
        escapeValue: false,
      },
      returnEmptyString: false,
    }).catch(() => undefined);
  }

  return i18next;
}

export { i18next };