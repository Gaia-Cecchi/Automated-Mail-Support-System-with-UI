import { translations, Language, TranslationKey } from '../i18n/translations';

export function useTranslation(language: Language) {
  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return { t };
}
