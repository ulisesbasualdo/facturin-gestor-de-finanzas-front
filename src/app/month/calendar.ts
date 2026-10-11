/** Formateador del nombre del mes (`octubre`). */
const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long' });
/** Formateador de día y mes (`7 de octubre`). */
const dayMonthFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' });
/** Formateador de fecha completa (`miércoles, 7 de octubre de 2026`). */
const longDateFormatter = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Posición de un mes respecto de otro: pasado, actual o futuro. */
export type MonthTiming = 'past' | 'current' | 'future';

/** Convierte una fecha al formato `YYYY-MM`. */
export function toYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Suma (o resta, si es negativo) meses a un `YYYY-MM`. */
export function addMonths(yearMonth: string, delta: number): string {
  return toYearMonth(new Date(yearOf(yearMonth), monthIndexOf(yearMonth) + delta, 1));
}

/** Devuelve el año de un `YYYY-MM`. */
export function yearOf(yearMonth: string): number {
  return Number(yearMonth.slice(0, 4));
}

/** Devuelve el nombre del mes en español, capitalizado (`Octubre`). */
export function monthName(yearMonth: string): string {
  return capitalize(monthFormatter.format(new Date(yearOf(yearMonth), monthIndexOf(yearMonth), 1)));
}

/** Indica si un `YYYY-MM` es pasado, actual o futuro respecto de otro. */
export function compareMonths(yearMonth: string, reference: string): MonthTiming {
  if (yearMonth < reference) return 'past';
  if (yearMonth > reference) return 'future';
  return 'current';
}

/** Formatea una fecha como `7 de octubre`. */
export function formatDayMonth(date: Date): string {
  return dayMonthFormatter.format(date);
}

/** Formatea una fecha como `Miércoles 7 de octubre de 2026`. */
export function formatLongDate(date: Date): string {
  return capitalize(longDateFormatter.format(date).replace(',', ''));
}

/** Devuelve el índice de mes (0–11) de un `YYYY-MM`. */
function monthIndexOf(yearMonth: string): number {
  return Number(yearMonth.slice(5, 7)) - 1;
}

/** Pone en mayúscula la primera letra de un texto. */
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
