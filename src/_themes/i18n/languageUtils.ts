import { LANGUAGE } from "../../utils/enums";

const languageAliases: Record<string, LANGUAGE> = {
  en: LANGUAGE.ENGLISH,
  english: LANGUAGE.ENGLISH,
  hi: LANGUAGE.HINDI,
  hindi: LANGUAGE.HINDI,
  zh: LANGUAGE.MANDARIN,
  mandarin: LANGUAGE.MANDARIN,
  chinese: LANGUAGE.MANDARIN,
  es: LANGUAGE.SPANISH,
  spanish: LANGUAGE.SPANISH,
  ja: LANGUAGE.JAPANESE,
  japanese: LANGUAGE.JAPANESE,
  de: LANGUAGE.GERMAN,
  german: LANGUAGE.GERMAN,
  fr: LANGUAGE.FRENCH,
  french: LANGUAGE.FRENCH,
};

/** Converts both current locale codes and legacy display names to a UI locale. */
export const normalizeAppLanguage = (value?: string | null): LANGUAGE | undefined => {
  const key = value?.trim().toLowerCase();
  return key ? languageAliases[key] : undefined;
};

/** Removes invalid/duplicate values returned by older company records. */
export const getConfiguredAppLanguages = (values?: string[] | null): LANGUAGE[] =>
  Array.from(new Set((values ?? []).map(normalizeAppLanguage).filter((value): value is LANGUAGE => Boolean(value))));
