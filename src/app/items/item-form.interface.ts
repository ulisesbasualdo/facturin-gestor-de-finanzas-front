import { ItemKind, NewItem } from './item.interface';

/** Modelo del formulario de un movimiento mientras se edita. */
export interface ItemFormModel {
  /** Descripción del movimiento. */
  title: string;
  /** Monto tal como se escribió (`''` si está vacío, `'12.5'`). */
  price: string;
  /** Tipo de movimiento, como lo usan los radio buttons. */
  kind: ItemKind;
  /** Indica si ya se cobró o pagó. */
  completed: boolean;
}

/** Datos de un movimiento listos para enviar, sin el mes al que pertenece. */
export type ItemFields = Omit<NewItem, 'yearMonth'>;
