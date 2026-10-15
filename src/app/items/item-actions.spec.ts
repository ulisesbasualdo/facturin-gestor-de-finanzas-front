import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MonthStore } from '../month/month-store';
import { MonthStatus } from '../month/month.interface';
import { Toaster } from '../shared/toaster';
import { Item } from './item.interface';
import { ItemActions } from './item-actions';
import { ItemEditSession } from './item-edit-session';

/** Doble de prueba de `MonthStore` con solo lo que usan las acciones y la sesión de edición. */
function createFakeMonthStore() {
  return {
    yearMonth: signal('2026-10'),
    status: signal<MonthStatus | undefined>('open'),
    refresh: vi.fn(),
  };
}

describe('ItemActions', () => {
  let actions: ItemActions;
  let toaster: Toaster;
  let session: ItemEditSession;
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
    toaster = TestBed.inject(Toaster);
    session = TestBed.inject(ItemEditSession);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  /** Espera el request que cumple la condición y lo devuelve. */
  function expectRequest(method: string, urlEnd: string) {
    return httpMock.expectOne((request) => request.method === method && request.url.endsWith(urlEnd));
  }

  it('marca como pagado sin mostrar tostada, porque el cambio se ve en la fila', () => {
    actions.toggle(rent);
    const patch = expectRequest('PATCH', '/items/5');
    expect(patch.request.body).toEqual({ completed: true });
    patch.flush({ ...rent, completed: true });

    expect(store.refresh).toHaveBeenCalledOnce();
    expect(toaster.toasts()).toEqual([]);
  });

  it('duplica y avisa con una tostada sin botón', () => {
    actions.duplicate(rent);
    expectRequest('POST', '/items/5/duplicate').flush({ ...rent, id: 9 });

    const [toast] = toaster.toasts();
    expect(toast.message).toBe('Duplicaste «Alquiler».');
    expect(toast.action).toBeUndefined();
  });

  it('elimina y ofrece deshacer desde una tostada', () => {
    actions.remove(rent);
    expectRequest('DELETE', '/items/5').flush(null);

    const [toast] = toaster.toasts();
    expect(toast.message).toBe('Eliminaste «Alquiler».');
    expect(toast.action?.label).toBe('Deshacer');
    expect(store.refresh).toHaveBeenCalledOnce();
  });

  it('al deshacer un borrado crea el ítem de nuevo con los mismos datos y sin el id viejo', () => {
    actions.remove(rent);
    expectRequest('DELETE', '/items/5').flush(null);

    toaster.runAction(toaster.toasts()[0]);
    const create = expectRequest('POST', '/items');
    const { id: _id, ...data } = rent;
    expect(create.request.body).toEqual(data);
    create.flush({ ...rent, id: 12 });

    expect(toaster.toasts().map((toast) => toast.message)).toEqual(['Restauraste «Alquiler».']);
    expect(store.refresh).toHaveBeenCalledTimes(2);
  });

  it('cualquier acción sobre una fila cierra la edición abierta', () => {
    session.add('income');

    actions.toggle(rent);

    expect(session.current()).toBeNull();
    expectRequest('PATCH', '/items/5').flush(rent);
  });

  it('guarda un movimiento nuevo en el mes seleccionado', () => {
    let saved = false;
    actions
      .save(undefined, { title: 'Luz', price: 57230.4, isGain: false, completed: false })
      .subscribe(() => (saved = true));

    const create = expectRequest('POST', '/items');
    expect(create.request.body).toEqual({
      title: 'Luz',
      price: 57230.4,
      isGain: false,
      completed: false,
      yearMonth: '2026-10',
    });
    create.flush({ ...rent, id: 13 });

    expect(saved).toBe(true);
    expect(store.refresh).toHaveBeenCalledOnce();
  });

  it('muestra el mensaje del backend en errores de negocio', () => {
    actions.remove(rent);
    expectRequest('DELETE', '/items/5').flush(
      { message: 'El mes 2026-09 está cerrado. Reabrilo para modificarlo.' },
      { status: 409, statusText: 'Conflict' },
    );

    const [toast] = toaster.toasts();
    expect(toast.kind).toBe('error');
    expect(toast.message).toBe('El mes 2026-09 está cerrado. Reabrilo para modificarlo.');
    expect(store.refresh).not.toHaveBeenCalled();
  });

  it('oculta el detalle de los errores internos del servidor', () => {
    actions.duplicate(rent);
    expectRequest('POST', '/items/5/duplicate').flush(
      { message: "ER_NO_SUCH_TABLE: Table 'facturin.item' doesn't exist" },
      { status: 500, statusText: 'Internal Server Error' },
    );

    expect(toaster.toasts()[0].message).toBe('No pudimos duplicar el movimiento.');
  });
});
