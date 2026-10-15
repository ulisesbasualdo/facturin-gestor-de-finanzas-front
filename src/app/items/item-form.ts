import { maxLength, required, SchemaPathTree, validate } from '@angular/forms/signals';
import { EditTarget } from './_definitions';
import { ItemFields, ItemFormModel } from './item-form.interface';

/** Monto máximo que entra en la columna DECIMAL(12,2) del backend. */
export const MAX_PRICE = 9999999999.99;
/** Largo máximo del título, igual al de la columna VARCHAR(255) del backend. */
export const MAX_TITLE_LENGTH = 255;

/** Cantidad máxima de decimales de un monto. */
const MAX_PRICE_DECIMALS = 2;

/** Indica si el texto es un monto con dígitos y, opcionalmente, un punto y hasta 2 decimales (`12`, `12.5`). */
function hasPriceFormat(text: string): boolean {
  let integerDigits = 0;
  let decimalDigits = 0;
  let hasPoint = false;
  for (const character of text) {
    if (character === '.') {
      if (hasPoint) return false;
      hasPoint = true;
    } else if (character >= '0' && character <= '9') {
      if (hasPoint) decimalDigits++;
      else integerDigits++;
    } else {
      return false;
    }
  }
  const validDecimals = hasPoint ? decimalDigits > 0 && decimalDigits <= MAX_PRICE_DECIMALS : true;
  return integerDigits > 0 && validDecimals;
}

/** Valores iniciales del formulario: vacíos para un alta, o los del movimiento que se edita. */
export function toFormModel(target: EditTarget): ItemFormModel {
  if (target.mode === 'add') return { title: '', price: '', kind: target.kind, completed: false };
  const { item } = target;
  return {
    title: item.title,
    price: String(item.price),
    kind: item.isGain ? 'income' : 'expense',
    completed: item.completed,
  };
}

/** Convierte los valores del formulario, ya validados, en los datos que espera el backend. */
export function toItemFields(model: ItemFormModel): ItemFields {
  return {
    title: model.title.trim(),
    price: Number(model.price),
    isGain: model.kind === 'income',
    completed: model.completed,
  };
}

/** Reglas de validación del formulario de un movimiento. */
export function itemFormSchema(path: SchemaPathTree<ItemFormModel>): void {
  validate(path.title, ({ value }) =>
    value().trim() === '' ? { kind: 'blank', message: 'Escribí un título.' } : undefined,
  );
  maxLength(path.title, MAX_TITLE_LENGTH, {
    message: `El título puede tener hasta ${MAX_TITLE_LENGTH} caracteres.`,
  });

  required(path.price, { message: 'Ingresá un monto.' });
  validate(path.price, ({ value }) => {
    const price = value();
    if (price === '') return undefined;
    if (!hasPriceFormat(price)) {
      return { kind: 'format', message: 'El monto tiene que ser un número con hasta 2 decimales.' };
    }
    if (Number(price) <= 0) return { kind: 'min', message: 'El monto tiene que ser mayor a 0.' };
    if (Number(price) > MAX_PRICE) return { kind: 'max', message: 'El monto es demasiado grande.' };
    return undefined;
  });
}
