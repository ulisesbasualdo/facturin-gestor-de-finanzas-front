import { TestBed } from '@angular/core/testing';
import { Item } from './item.interface';
import { DEFAULT_ITEM_SORT, ITEM_SORT_STORAGE_KEY, ItemSortPreference, sortItems } from './item-sort';

/** Crea un ítem de prueba con el id y el monto indicados. */
function item(id: number, price: number): Item {
  return { id, title: `Ítem ${id}`, price, completed: false, yearMonth: '2026-10', isGain: false };
}

describe('sortItems', () => {
  /** Ítems en el orden en que llegan del backend: el más reciente primero. */
  const fromBackend = [item(3, 100.5), item(2, 9000), item(1, 100.25)];

  it('con "recent" respeta el orden del backend', () => {
    expect(sortItems(fromBackend, 'recent').map((i) => i.id)).toEqual([3, 2, 1]);
  });

  it('ordena por monto de mayor a menor, incluso con decimales', () => {
    expect(sortItems(fromBackend, 'priceDesc').map((i) => i.id)).toEqual([2, 3, 1]);
  });

  it('ordena por monto de menor a mayor', () => {
    expect(sortItems(fromBackend, 'priceAsc').map((i) => i.id)).toEqual([1, 3, 2]);
  });

  it('con montos iguales mantiene el orden del backend', () => {
    const tied = [item(3, 500), item(2, 500), item(1, 500)];
    expect(sortItems(tied, 'priceDesc').map((i) => i.id)).toEqual([3, 2, 1]);
  });

  it('no modifica la lista original', () => {
    const original = [...fromBackend];
    sortItems(fromBackend, 'priceAsc');
    expect(fromBackend).toEqual(original);
  });
});

describe('ItemSortPreference', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('arranca con el orden por defecto si no hay nada guardado', () => {
    expect(TestBed.inject(ItemSortPreference).sort()).toBe(DEFAULT_ITEM_SORT);
  });

  it('recupera la preferencia guardada', () => {
    localStorage.setItem(ITEM_SORT_STORAGE_KEY, 'priceAsc');
    expect(TestBed.inject(ItemSortPreference).sort()).toBe('priceAsc');
  });

  it('ignora un valor guardado que no es un orden válido', () => {
    localStorage.setItem(ITEM_SORT_STORAGE_KEY, 'cualquier-cosa');
    expect(TestBed.inject(ItemSortPreference).sort()).toBe(DEFAULT_ITEM_SORT);
  });

  it('guarda automáticamente la nueva preferencia', () => {
    const preference = TestBed.inject(ItemSortPreference);

    preference.choose('priceDesc');

    expect(preference.sort()).toBe('priceDesc');
    expect(localStorage.getItem(ITEM_SORT_STORAGE_KEY)).toBe('priceDesc');
  });

  it('ignora opciones inválidas', () => {
    const preference = TestBed.inject(ItemSortPreference);

    preference.choose('<script>');

    expect(preference.sort()).toBe(DEFAULT_ITEM_SORT);
  });
});
