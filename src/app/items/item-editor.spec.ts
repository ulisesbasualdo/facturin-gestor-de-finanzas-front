import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthStore } from '../month/month-store';
import { MonthStatus } from '../month/month.interface';
import { EditTarget } from './_definitions';
import { Item } from './item.interface';
import { ItemEditSession } from './item-edit-session';
import { ItemEditor } from './item-editor';

/** Doble de prueba de `MonthStore` con solo lo que usan el editor y la sesión de edición. */
function createFakeMonthStore() {
  return {
    yearMonth: signal('2026-10'),
    status: signal<MonthStatus | undefined>('open'),
    refresh: vi.fn(),
  };
}

describe('ItemEditor', () => {
  let session: ItemEditSession;
  let httpMock: HttpTestingController;

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
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        { provide: MonthStore, useValue: createFakeMonthStore() },
      ],
    });
    session = TestBed.inject(ItemEditSession);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  /** Abre la edición en la sesión y crea el editor con ella. */
  async function openEditor(target: EditTarget): Promise<ComponentFixture<ItemEditor>> {
    if (target.mode === 'edit') session.edit(target.item);
    else session.add(target.kind);
    const fixture = TestBed.createComponent(ItemEditor);
    fixture.componentRef.setInput('target', session.current());
    await fixture.whenStable();
    return fixture;
  }

  /** Escribe un texto en un input, como lo haría el usuario. */
  function type(input: HTMLInputElement, text: string): void {
    input.value = text;
    input.dispatchEvent(new Event('input'));
  }

  /** Inputs del editor. */
  function inputs(fixture: ComponentFixture<ItemEditor>) {
    const element = fixture.nativeElement as HTMLElement;
    const [title, price] = Array.from(element.querySelectorAll<HTMLInputElement>('input[type="text"]'));
    return { element, title, price };
  }

  it('al abrirse pone el foco en el título', async () => {
    const fixture = await openEditor({ mode: 'add', kind: 'expense' });
    expect(document.activeElement).toBe(inputs(fixture).title);
  });

  it('agrega un movimiento nuevo y cierra el editor', async () => {
    const fixture = await openEditor({ mode: 'add', kind: 'income' });
    const { element, title, price } = inputs(fixture);
    type(title, 'Trabajo freelance');
    type(price, '300000.5');

    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    const create = await vi.waitFor(() =>
      httpMock.expectOne((request) => request.method === 'POST' && request.url.endsWith('/items')),
    );
    expect(create.request.body).toEqual({
      title: 'Trabajo freelance',
      price: 300000.5,
      isGain: true,
      completed: false,
      yearMonth: '2026-10',
    });
    create.flush({ ...rent, id: 20 });

    await vi.waitFor(() => expect(session.current()).toBeNull());
  });

  it('guarda los cambios de un movimiento existente', async () => {
    const fixture = await openEditor({ mode: 'edit', item: rent });
    const { element, price } = inputs(fixture);
    type(price, '460000');

    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    const patch = await vi.waitFor(() =>
      httpMock.expectOne((request) => request.method === 'PATCH' && request.url.endsWith('/items/5')),
    );
    expect(patch.request.body).toEqual({
      title: 'Alquiler',
      price: 460000,
      isGain: false,
      completed: false,
    });
    patch.flush({ ...rent, price: 460000 });
  });

  it('con datos inválidos no envía nada, muestra los errores y enfoca el primer campo con error', async () => {
    const fixture = await openEditor({ mode: 'add', kind: 'expense' });
    const { element, price } = inputs(fixture);
    price.focus();

    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await fixture.whenStable();

    expect(element.textContent).toContain('Escribí un título.');
    expect(element.textContent).toContain('Ingresá un monto.');
    expect(document.activeElement).toBe(inputs(fixture).title);
    httpMock.expectNone(() => true);
  });

  it('si el backend rechaza el guardado, muestra su mensaje y deja el editor abierto', async () => {
    const fixture = await openEditor({ mode: 'edit', item: rent });
    const { element } = inputs(fixture);

    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    const patch = await vi.waitFor(() => httpMock.expectOne(() => true));
    patch.flush(
      { message: 'El mes 2026-09 está cerrado. Reabrilo para modificarlo.' },
      { status: 409, statusText: 'Conflict' },
    );
    await fixture.whenStable();

    expect(element.textContent).toContain('El mes 2026-09 está cerrado.');
    expect(session.current()).not.toBeNull();
  });

  it('Escape cierra el editor sin guardar', async () => {
    const fixture = await openEditor({ mode: 'edit', item: rent });

    inputs(fixture).title.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(session.current()).toBeNull();
  });
});
