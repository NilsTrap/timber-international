export const locales = ['en', 'fi', 'sv', 'no', 'da', 'nl', 'de', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fi: 'Suomi',
  sv: 'Svenska',
  no: 'Norsk',
  da: 'Dansk',
  nl: 'Nederlands',
  de: 'Deutsch',
  es: 'Español',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  fi: '🇫🇮',
  sv: '🇸🇪',
  no: '🇳🇴',
  da: '🇩🇰',
  nl: '🇳🇱',
  de: '🇩🇪',
  es: '🇪🇸',
};
