import { effect, Service, signal } from '@angular/core';
import { Item } from './item';

/** Criterio de orden de los movimientos. */
export type ItemSort = 'recent' | 'priceDesc' | 'priceAsc';

/** Opciones de orden con su texto visible, en el orden en que se muestran. */
export const ITEM_SORT_OPTIONS: readonly { value: ItemSort; label: string }[] = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'priceDesc', label: 'Mayor monto' },
  { value: 'priceAsc', label: 'Menor monto' },
];

/** Orden que se usa si no hay una preferencia guardada. */
export const DEFAULT_ITEM_SORT: ItemSort = 'recent';

/** Clave de `localStorage` donde se guarda la preferencia. */
export const ITEM_SORT_STORAGE_KEY = 'facturin.itemSort';

/** Indica si un valor es un criterio de orden válido. */
export function isItemSort(value: unknown): value is ItemSort {
  return ITEM_SORT_OPTIONS.some((option) => option.value === value);
}

/** Compara dos montos: negativo si `a` va antes que `b`, positivo si va después, 0 si son iguales. */
function comparePrices(a: number, b: number): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/** Devuelve una copia ordenada; con `recent` respeta el orden del backend (más reciente primero). */
export function sortItems(items: readonly Item[], sort: ItemSort): Item[] {
  switch (sort) {
    case 'recent':
      return [...items];
    case 'priceDesc':
      return [...items].sort((a, b) => comparePrices(b.price, a.price));
    case 'priceAsc':
      return [...items].sort((a, b) => comparePrices(a.price, b.price));
  }
}

/** Lee la preferencia guardada, o el orden por defecto si no hay una válida o no se puede leer. */
function readStoredSort(): ItemSort {
  try {
    const stored = localStorage.getItem(ITEM_SORT_STORAGE_KEY);
    return isItemSort(stored) ? stored : DEFAULT_ITEM_SORT;
  } catch {
    return DEFAULT_ITEM_SORT;
  }
}

@Service()
export class ItemSortPreference {
  /** Criterio de orden elegido, modificable solo desde este servicio. */
  private readonly selected = signal(readStoredSort());
  /** Criterio de orden elegido. */
  readonly sort = this.selected.asReadonly();

  constructor() {
    effect(() => {
      const sort = this.selected();
      try {
        localStorage.setItem(ITEM_SORT_STORAGE_KEY, sort);
      } catch {
        return;
      }
    });
  }

  /** Cambia el criterio de orden; ignora valores que no sean un criterio válido. */
  choose(value: unknown): void {
    if (isItemSort(value)) this.selected.set(value);
  }
}
