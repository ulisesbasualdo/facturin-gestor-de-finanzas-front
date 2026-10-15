import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { Item } from './item.interface';
import { ItemFormModel } from './item-form.interface';
import { itemFormSchema, MAX_TITLE_LENGTH, toFormModel, toItemFields } from './item-form';

/** Gasto pagado de ejemplo. */
const rent: Item = {
  id: 5,
  title: 'Alquiler',
  price: 455000.5,
  completed: true,
  yearMonth: '2026-10',
  isGain: false,
};

/** Crea un formulario con las reglas reales y devuelve los mensajes de error del monto y del título. */
function errorsFor(values: Partial<ItemFormModel>) {
  const model = signal<ItemFormModel>({
    title: 'Alquiler',
    price: '100',
    kind: 'expense',
    completed: false,
    ...values,
  });
  const itemForm = TestBed.runInInjectionContext(() => form(model, itemFormSchema));
  return {
    title: itemForm.title().errors().map((error) => error.message),
    price: itemForm.price().errors().map((error) => error.message),
  };
}

describe('toFormModel y toItemFields', () => {
  it('un alta arranca vacía con el tipo del grupo', () => {
    expect(toFormModel({ mode: 'add', kind: 'income' })).toEqual({
      title: '',
      price: '',
      kind: 'income',
      completed: false,
    });
  });

  it('una edición arranca con los datos del movimiento, con el monto como texto', () => {
    expect(toFormModel({ mode: 'edit', item: rent })).toEqual({
      title: 'Alquiler',
      price: '455000.5',
      kind: 'expense',
      completed: true,
    });
  });

  it('al enviar convierte el monto a número, el tipo a isGain y recorta el título', () => {
    expect(
      toItemFields({ title: '  Sueldo  ', price: '1500000.25', kind: 'income', completed: true }),
    ).toEqual({ title: 'Sueldo', price: 1500000.25, isGain: true, completed: true });
  });
});

describe('itemFormSchema', () => {
  it('acepta montos enteros y con 1 o 2 decimales', () => {
    for (const price of ['1', '100', '12.5', '12.50', '0.01']) {
      expect(errorsFor({ price }).price).toEqual([]);
    }
  });

  it('pide un monto si está vacío', () => {
    expect(errorsFor({ price: '' }).price).toEqual(['Ingresá un monto.']);
  });

  it('rechaza textos que no son un monto válido', () => {
    for (const price of ['12,5', '12.345', '1.2.3', '-5', '1e5', 'abc', '12.', '.5', ' 12']) {
      expect(errorsFor({ price }).price).toEqual([
        'El monto tiene que ser un número con hasta 2 decimales.',
      ]);
    }
  });

  it('rechaza montos en cero o demasiado grandes', () => {
    expect(errorsFor({ price: '0' }).price).toEqual(['El monto tiene que ser mayor a 0.']);
    expect(errorsFor({ price: '0.00' }).price).toEqual(['El monto tiene que ser mayor a 0.']);
    expect(errorsFor({ price: '10000000000' }).price).toEqual(['El monto es demasiado grande.']);
  });

  it('pide un título que no sea solo espacios y que no supere el largo máximo', () => {
    expect(errorsFor({ title: '   ' }).title).toEqual(['Escribí un título.']);
    expect(errorsFor({ title: 'a'.repeat(MAX_TITLE_LENGTH + 1) }).title).toEqual([
      `El título puede tener hasta ${MAX_TITLE_LENGTH} caracteres.`,
    ]);
  });
});
