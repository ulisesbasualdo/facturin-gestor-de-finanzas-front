/** Tipo de movimiento: ingreso o gasto. */
export type ItemKind = 'income' | 'expense';

/** Movimiento de dinero (ingreso o gasto) de un mes. */
export interface Item {
  /** Identificador único. */
  id: number;
  /** Descripción del movimiento. */
  title: string;
  /** Monto, siempre positivo y con hasta 2 decimales. */
  price: number;
  /** Indica si ya se cobró o pagó. */
  completed: boolean;
  /** Mes al que pertenece, en formato `YYYY-MM`. */
  yearMonth: string;
  /** `true` si es ingreso, `false` si es gasto. */
  isGain: boolean;
}

/** Datos de un ítem sin su identificador, para crearlo. */
export type NewItem = Omit<Item, 'id'>;

/** Campos de un ítem que se pueden modificar. */
export type ItemChanges = Partial<NewItem>;
