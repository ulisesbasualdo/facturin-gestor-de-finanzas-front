import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MonthStatus } from '../month/month-status';
import { MonthStore } from '../month/month-store';
import { Toaster } from '../shared/toaster';
import { UndoStack } from '../shared/undo-stack';
import { Item } from './item';
import { ItemActions } from './item-actions';

/** Doble de prueba de `MonthStore` con solo lo que usan las acciones y la pila de deshacer. */
function createFakeMonthStore() {
  return {
    status: signal<MonthStatus | undefined>('open'),
    onLeave: vi.fn(),
    refresh: vi.fn(),
  };
}

describe('ItemActions', () => {
  let actions: ItemActions;
  let undoStack: UndoStack;
  let toaster: Toaster;
  let httpMock: HttpTestingController;
  let store: ReturnType<typeof createFakeMonthStore>;

  /** Gasto pendiente de ejemplo. */
  const rent: Item = {
    id: 5,
    title: 'Alquiler',
    price: 455000.5,
    completed: false,
    yearMonth: '2026-10',
    isGain: false,
  };

  beforeEach(() => {
    store = createFakeMonthStore();
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), { provide: MonthStore, useValue: store }],
    });
    actions = TestBed.inject(ItemActions);
    undoStack = TestBed.inject(UndoStack);
    toaster = TestBed.inject(Toaster);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  /** Espera el request que cumple la condición y lo devuelve. */
  function expectRequest(method: string, urlEnd: string) {
    return httpMock.expectOne((request) => request.method === method && request.url.endsWith(urlEnd));
  }

  it('marca como pagado y al deshacer vuelve a pendiente', async () => {
    const done = actions.toggle(rent);
    const patch = expectRequest('PATCH', '/items/5');
    expect(patch.request.body).toEqual({ completed: true });
    patch.flush({ ...rent, completed: true });
    await done;

    expect(store.refresh).toHaveBeenCalledOnce();
    expect(toaster.toasts()).toEqual([]);
    expect(undoStack.nextDescription()).toBe('marcar «Alquiler» como pagado');

    const undone = undoStack.undo();
    const revert = expectRequest('PATCH', '/items/5');
    expect(revert.request.body).toEqual({ completed: false });
    revert.flush(rent);
    await undone;
  });

  it('duplica y al deshacer elimina la copia, no el original', async () => {
    const done = actions.duplicate(rent);
    expectRequest('POST', '/items/5/duplicate').flush({ ...rent, id: 9 });
    await done;

    expect(toaster.toasts()[0].message).toBe('Duplicaste «Alquiler».');

    const undone = undoStack.undo();
    expectRequest('DELETE', '/items/9').flush(null);
    await undone;
  });

  it('elimina y al deshacer restaura el mismo ítem', async () => {
    const done = actions.remove(rent);
    expectRequest('DELETE', '/items/5').flush(null);
    await done;

    expect(toaster.toasts()[0].message).toBe('Eliminaste «Alquiler».');

    const undone = undoStack.undo();
    expectRequest('POST', '/items/5/restore').flush(rent);
    await undone;
  });

  it('muestra el mensaje del backend en errores de negocio y no registra la acción', async () => {
    const done = actions.remove(rent);
    expectRequest('DELETE', '/items/5').flush(
      { message: 'El mes 2026-09 está cerrado. Reabrilo para modificarlo.' },
      { status: 409, statusText: 'Conflict' },
    );
    await done;

    expect(toaster.toasts()[0]).toMatchObject({
      kind: 'error',
      message: 'El mes 2026-09 está cerrado. Reabrilo para modificarlo.',
    });
    expect(undoStack.canUndo()).toBe(false);
    expect(store.refresh).not.toHaveBeenCalled();
  });

  it('oculta el detalle de los errores internos del servidor', async () => {
    const done = actions.duplicate(rent);
    expectRequest('POST', '/items/5/duplicate').flush(
      { message: "ER_NO_SUCH_TABLE: Table 'facturin.item' doesn't exist" },
      { status: 500, statusText: 'Internal Server Error' },
    );
    await done;

    expect(toaster.toasts()[0].message).toBe('No pudimos duplicar el movimiento.');
  });
});
