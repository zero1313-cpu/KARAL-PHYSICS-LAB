import { en, type TranslationKey } from './en';
import { hi } from './hi';
import type { Lang, Localized } from '@/content/types';

export type { TranslationKey };
export { en, hi };

export function translate(lang: Lang, key: TranslationKey): string {
  return lang === 'hi' ? hi[key] : en[key];
}

export function localize(lang: Lang, value: Localized | undefined): string {
  if (!value) return '';
  return value[lang] || value.en || '';
}

export function detectLanguage(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}
