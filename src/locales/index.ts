import { en } from './en';
import { hi } from './hi';
import { mr } from './mr';

export type LanguageCode = 'en' | 'hi' | 'mr';

export const translations = {
  en,
  hi,
  mr,
};

export type Translations = typeof en;
