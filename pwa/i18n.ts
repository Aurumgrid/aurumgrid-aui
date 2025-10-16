// i18n.ts
import { detectLocale } from './geo';
export const defaultLocale = detectLocale() || 'pt-BR';
