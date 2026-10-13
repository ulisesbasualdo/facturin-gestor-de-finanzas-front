import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MonthStore } from '../month/month-store';
import { Toaster } from '../shared/toaster';
import { Item } from './item';
import { ItemActions } from './item-actions';

/** Doble de prueba de `MonthStore` con solo lo que usan las acciones. */
function createFakeMonthStore() {
  return { refresh: vi.fn() };
}

describe('ItemActions', () => {
  let actions: ItemActions;
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
    toaster = TestBed.inject(Toaster);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  /** Espera el request que cumple la condición y lo devuelve. */
  function expectRequest(method: string, urlEnd: string) {
    return httpMock.expectOne((request) => request.method === method && request.url.endsWith(urlEnd));
  }

  it('marca como pagado sin mostrar tostada, porque el cambio se ve en la fila', async () => {
    const done = actions.toggle(rent);
    const patch = expectRequest('PATCH', '/items/5');
    expect(patch.request.body).toEqual({ completed: true });
    patch.flush({ ...rent, completed: true });
    await done;

    expect(store.refresh).toHaveBeenCalledOnce();
    expect(toaster.toasts()).toEqual([]);
  });

  it('duplica y avisa con una tostada sin botón', async () => {
    const done = actions.duplicate(rent);
    expectRequest('POST', '/items/5/duplicate').flush({ ...rent, id: 9 });
    await done;

    const [toast] = toaster.toasts();
    expect(toast.message).toBe('Duplicaste «Alquiler».');
    expect(toast.action).toBeUndefined();
  });

  it('elimina y ofrece deshacer desde una tostada', async () => {
    const done = actions.remove(rent);
    expectRequest('DELETE', '/items/5').flush(null);
    await done;

    const [toast] = toaster.toasts();
    expect(toast.message).toBe('Eliminaste «Alquiler».');
    expect(toast.action?.label).toBe('Deshacer');
    expect(store.refresh).toHaveBeenCalledOnce();
  });

  it('al deshacer un borrado crea el ítem de nuevo con los mismos datos y sin el id viejo', async () => {
    const done = actions.remove(rent);
    expectRequest('DELETE', '/items/5').flush(null);
    await done;

    toaster.runAction(toaster.toasts()[0]);
    const create = expectRequest('POST', '/items');
    const { id: _id, ...data } = rent;
    expect(create.request.body).toEqual(data);
    create.flush({ ...rent, id: 12 });
    await vi.waitFor(() =>
      expect(toaster.toasts().map((toast) => toast.message)).toEqual(['Restauraste «Alquiler».']),
    );
    expect(store.refresh).toHaveBeenCalledTimes(2);
  });

  it('muestra el mensaje del backend en errores de negocio', async () => {
    const done = actions.remove(rent);
    expectRequest('DELETE', '/items/5').flush(
      { message: 'El mes 2026-09 está cerrado. Reabrilo para modificarlo.' },
      { status: 409, statusText: 'Conflict' },
    );
    await done;

    const [toast] = toaster.toasts();
    expect(toast.kind).toBe('error');
    expect(toast.message).toBe('El mes 2026-09 está cerrado. Reabrilo para modificarlo.');
    expect(toast.action).toBeUndefined();
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
