/** Formateador de números en es-AR con dos decimales (`1.234,50`). */
const amountFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Signo menos tipográfico (U+2212). */
const MINUS = '−';

/** Variante de formato: sin signo (`plain`) o con `+`/`−` (`signed`). */
export type MoneyFormat = 'plain' | 'signed';

/** Formatea un monto en pesos: `$ 1.234,50`, o `+ $ 1.234,50` / `− $ 1.234,50` si es `signed`. */
export function formatMoney(value: number, format: MoneyFormat = 'plain'): string {
  const amount = amountFormatter.format(Math.abs(value));
  if (format === 'signed') {
    return `${value < 0 ? MINUS : '+'} $ ${amount}`;
  }
  return `${value < 0 ? MINUS : ''}$ ${amount}`;
}

/** Separa un monto formateado en parte entera (`$ 1.234`) y decimales (`,50`). */
export function splitMoney(value: number): { integer: string; decimals: string } {
  const text = formatMoney(value);
  const comma = text.lastIndexOf(',');
  return { integer: text.slice(0, comma), decimals: text.slice(comma) };
}
