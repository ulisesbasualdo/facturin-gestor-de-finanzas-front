import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Item, MonthlySummary } from './items/item';

describe('App', () => {
  /** Resumen de ejemplo que devuelve el backend falso. */
  const summary: MonthlySummary = {
    gained: 1500000,
    spent: 900000,
    pendingExpenses: 500000,
    remaining: 600000,
    projectedMonthEnd: 100000,
    accumulatedBeforeThisMonth: 1000000,
    totalProjectedSavings: 1100000,
    trend: 'increase',
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
    price: 455000,
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
  function respondMonth(items: Item[]): void {
    TestBed.tick();
    httpMock.expectOne((request) => request.url.includes('/summary')).flush(summary);
    httpMock.expectOne((request) => !request.url.includes('/summary')).flush(items);
  }

  it('muestra el resumen del mes cuando llega la respuesta', async () => {
    const fixture = TestBed.createComponent(App);
    respondMonth([]);
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Quedará al cierre de mes');
    expect(text).toContain('$ 100.000');
    expect(text).toContain('Vas a ahorrar el 7 % de lo que entra');
  });

  it('suma los ingresos por cobrar al activar el switch', async () => {
    const fixture = TestBed.createComponent(App);
    respondMonth([pendingIncome]);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const toggle = element.querySelector<HTMLButtonElement>('button[role="switch"]');
    expect(toggle?.getAttribute('aria-checked')).toBe('false');

    toggle?.click();
    await fixture.whenStable();

    expect(toggle?.getAttribute('aria-checked')).toBe('true');
    expect(element.textContent).toContain('$ 400.000');
    expect(element.textContent).toContain('Vas a ahorrar el 22 % de lo que entra');
  });

  it('agrupa los movimientos en ingresos y gastos', async () => {
    const fixture = TestBed.createComponent(App);
    respondMonth([pendingIncome, paidExpense]);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const [incomes, expenses] = Array.from(element.querySelectorAll('app-item-group'));
    expect(incomes.textContent).toContain('Ingresos');
    expect(incomes.textContent).toContain('Trabajo freelance');
    expect(incomes.textContent).toContain('Por cobrar');
    expect(incomes.textContent).toContain('+ $ 300.000,00');
    expect(expenses.textContent).toContain('Gastos');
    expect(expenses.textContent).toContain('Alquiler');
    expect(expenses.textContent).toContain('Pagado');
    expect(expenses.textContent).toContain('− $ 455.000,00');
  });
});
