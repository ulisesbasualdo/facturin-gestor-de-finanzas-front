import { Item, ItemKind } from './item.interface';

/** Criterio de orden de los movimientos. */
export type ItemSort = 'recent' | 'priceDesc' | 'priceAsc';

/** Opción del selector de orden. */
export interface ItemSortOption {
  /** Criterio de orden. */
  value: ItemSort;
  /** Texto visible. */
  label: string;
}

/** Qué se está editando: una copia de un movimiento existente, o uno nuevo de un tipo. */
export type EditTarget = { mode: 'edit'; item: Item } | { mode: 'add'; kind: ItemKind };

/** Elemento al que vuelve el foco al cerrar una edición: la fila editada o el botón de agregar. */
export type FocusReturn = { mode: 'edit'; id: number } | { mode: 'add'; kind: ItemKind };
