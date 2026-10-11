import { Pipe, PipeTransform } from '@angular/core';
import { formatMoney, MoneyFormat } from './money';

@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  /** Formatea un número como monto en pesos desde el template. */
  transform(value: number, format: MoneyFormat = 'plain'): string {
    return formatMoney(value, format);
  }
}
