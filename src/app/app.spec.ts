import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Item, MonthlySummary } from './items/item';
import { MonthStatus } from './month/month-status';

describe('App', () => {
  /** Resumen de ejemplo que devuelve el backend falso. */
  const summary: MonthlySummary = {
    gained: 1500000,
    spent: 900000,
    pendingIncome: 300000,
    pendingExpenses: 500000,
    totalIncome: 1800000,
    totalExpenses: 1400000,
    remaining: 600000,
    projectedMonthEnd: 100000,
    projectedWithPendingIncome: 400000,
    accumulatedBeforeThisMonth: 1000000,
    totalProjectedSavings: 1100000,
    totalProjectedSavingsWithPendingIncome: 1400000,
    trend: 'increase',
    monthStatus: 'open',
  };

  /** Ingreso todavía no cobrado del mes de ejemplo. */
  const pendingIncome: Item = {
    id: 1,
    title: 'Trabajo freelance',
    price: 300000,
    completed: false,
    yearMonth: '2026-10',
    isGain: true,
  };

  /** Gasto ya pagado del mes de ejemplo. */
  const paidExpense: Item = {
    id: 2,
    title: 'Alquiler',
    price: 455000.5,
    completed: true,
    yearMonth: '2026-10',
    isGain: false,
  };

  /** Backend falso para responder los requests de la prueba. */
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  /** Responde los requests de resumen e ítems del mes. */
  function respondMonth(items: Item[], monthStatus: MonthStatus = 'open'): void {
    TestBed.tick();
    httpMock.expectOne((request) => request.url.includes('/summary')).flush({ ...summary, monthStatus });
    httpMock.expectOne((request) => !request.url.includes('/summary')).flush(items);
  }

  /** Busca un botón por su texto visible. */
  function buttonByText(element: HTMLElement, text: string): HTMLButtonElement | undefined {
    return Array.from(element.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === text,
    );
  }

  it('muestra el resumen del mes cuando llega la respuesta', async () => {
    const fixture = TestBed.createComponent(App);
    respondMonth([]);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Quedará al cierre de mes');
    expect(element.querySelector('.hero-amount')?.textContent?.trim()).toBe('100000');
    expect(element.querySelector('.badge')?.textContent?.trim()).toBe('Ahorrás 100000');
  });

  it('usa la proyección con ingresos por cobrar al activar el switch', async () => {
    const fixture = TestBed.createComponent(App);
    respondMonth([pendingIncome]);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const toggle = element.querySelector<HTMLButtonElement>('button[role="switch"]');
    expect(toggle?.getAttribute('aria-checked')).toBe('false');

    toggle?.click();
    await fixture.whenStable();

    expect(toggle?.getAttribute('aria-checked')).toBe('true');
    expect(element.querySelector('.hero-amount')?.textContent?.trim()).toBe('400000');
    expect(element.querySelector('.badge')?.textContent?.trim()).toBe('Ahorrás 400000');
  });

  it('agrupa los movimientos con los totales del backend', async () => {
    const fixture = TestBed.createComponent(App);
    respondMonth([pendingIncome, paidExpense]);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const [incomes, expenses] = Array.from(element.querySelectorAll('app-item-group'));
    expect(incomes.textContent).toContain('Trabajo freelance');
    expect(incomes.textContent).toContain('Por cobrar');
    expect(incomes.querySelector('.amount')?.textContent).toBe('300000');
    expect(incomes.querySelector('.progress')?.textContent).toContain('Cobrado 1500000 de 1800000');
    expect(expenses.textContent).toContain('Alquiler');
    expect(expenses.querySelector('.amount')?.textContent).toBe('455000.5');
    expect(expenses.querySelector('.progress')?.textContent).toContain('Pagado 900000 de 1400000');
  });

  it('reabre un mes cerrado y lo vuelve a cerrar al salir', async () => {
    const fixture = TestBed.createComponent(App);
    const element = fixture.nativeElement as HTMLElement;
    respondMonth([]);
    await fixture.whenStable();

    element.querySelector<HTMLButtonElement>('button[aria-label^="Mes anterior"]')?.click();
    respondMonth([], 'closed');
    await fixture.whenStable();
    expect(element.textContent).toContain('Mes cerrado');

    buttonByText(element, 'Reabrir mes')?.click();
    httpMock.expectOne((request) => request.url.endsWith('/reopen')).flush({ status: 'reopened' });
    const reload = await vi.waitFor(() => {
      TestBed.tick();
      return httpMock.expectOne((request) => request.url.includes('/summary'));
    });
    reload.flush({ ...summary, monthStatus: 'reopened' });
    await fixture.whenStable();
    expect(element.textContent).toContain('Mes reabierto');
    expect(buttonByText(element, 'Cerrar mes')).toBeDefined();

    element.querySelector<HTMLButtonElement>('button[aria-label^="Mes siguiente"]')?.click();
    const close = httpMock.expectOne((request) => request.url.endsWith('/close'));
    expect(close.request.method).toBe('POST');
    close.flush({ status: 'closed' });
    respondMonth([]);
  });
});
