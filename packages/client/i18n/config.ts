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
 * Resolves the initial UI language from env config and falls back to English.
 */
function getInitialLanguage(): AppLanguage {
  const envLanguage = process.env.NEXT_PUBLIC_I18N_DEFAULT_LANGUAGE;

  if (
    envLanguage &&
    supportedLanguages.includes(envLanguage)
  ) {
    return envLanguage as AppLanguage;
  }

  return defaultLanguage;
}

/**
 * Initializes i18next singleton only once with app locale resources.
 */
export function initI18n(): typeof i18next {
  if (!i18next.isInitialized) {
    void i18next.init({
      resources,
      lng: getInitialLanguage(),
      fallbackLng: defaultLanguage,
      defaultNS: "translation",
      interpolation: {
        escapeValue: false,
      },
      returnEmptyString: false,
    });
  }

  return i18next;
}

export { i18next };