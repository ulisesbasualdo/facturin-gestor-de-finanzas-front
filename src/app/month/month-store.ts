import { httpResource } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { apiEndpoints } from '../api/api-endpoints';
import { userErrorMessage } from '../api/http-error-message';
import { Item } from '../items/item.interface';
import { MonthlySummary } from '../summary/monthly-summary.interface';
import { Toaster } from '../shared/toaster';
import { addMonths, compareMonths, monthName, toYearMonth } from './calendar';
import { MonthApi } from './month-api';

@Service()
export class MonthStore {
  /** Endpoints para cerrar y reabrir meses. */
  private readonly api = inject(MonthApi);
  /** Avisos para el usuario. */
  private readonly toaster = inject(Toaster);

  /** Fecha de hoy, tomada al iniciar la app. */
  readonly today = new Date();
  /** Mes actual en formato `YYYY-MM`. */
  readonly todayYearMonth = toYearMonth(this.today);

  /** Mes seleccionado, modificable solo desde este servicio. */
  private readonly selected = signal(this.todayYearMonth);
  /** Mes seleccionado en formato `YYYY-MM`, de solo lectura. */
  readonly yearMonth = this.selected.asReadonly();

  /** Indica si el mes seleccionado es el actual. */
  readonly isCurrent = computed(() => this.yearMonth() === this.todayYearMonth);
  /** Indica si el mes seleccionado es pasado, actual o futuro. */
  readonly timing = computed(() => compareMonths(this.yearMonth(), this.todayYearMonth));
  /** Mes anterior al seleccionado. */
  readonly previousYearMonth = computed(() => addMonths(this.yearMonth(), -1));
  /** Mes siguiente al seleccionado. */
  readonly nextYearMonth = computed(() => addMonths(this.yearMonth(), 1));

  /** Resumen financiero del mes seleccionado, recargado al cambiar de mes. */
  readonly summary = httpResource<MonthlySummary>(() => apiEndpoints.summary(this.yearMonth()));
  /** Ítems del mes seleccionado, recargados al cambiar de mes. */
  readonly items = httpResource<Item[]>(() => apiEndpoints.itemsByMonth(this.yearMonth()), {
    defaultValue: [],
  });
  /** Estado del mes seleccionado, o `undefined` mientras carga el resumen. */
  readonly status = computed(() =>
    this.summary.hasValue() ? this.summary.value().monthStatus : undefined,
  );

  /** Vuelve a pedir el resumen y los ítems del mes seleccionado. */
  refresh(): void {
    this.summary.reload();
    this.items.reload();
  }

  /** Selecciona el mes anterior. */
  previous(): void {
    this.select(this.previousYearMonth());
  }

  /** Selecciona el mes siguiente. */
  next(): void {
    this.select(this.nextYearMonth());
  }

  /** Vuelve a seleccionar el mes actual. */
  goToToday(): void {
    this.select(this.todayYearMonth);
  }

  /** Reabre el mes seleccionado. */
  reopen(): void {
    const yearMonth = this.yearMonth();
    this.api.reopen(yearMonth).subscribe({
      next: () => {
        this.toaster.success(`Reabriste ${monthName(yearMonth)}. Ya podés modificarlo.`);
        this.summary.reload();
      },
      error: (error) => this.toaster.error(userErrorMessage(error, 'No pudimos reabrir el mes.')),
    });
  }

  /** Vuelve a cerrar el mes seleccionado. */
  close(): void {
    const yearMonth = this.yearMonth();
    this.api.close(yearMonth).subscribe({
      next: () => {
        this.toaster.success(`Cerraste ${monthName(yearMonth)}.`);
        this.summary.reload();
      },
      error: (error) => this.toaster.error(userErrorMessage(error, 'No pudimos cerrar el mes.')),
    });
  }

  /** Cambia de mes: quita las tostadas con botón y cierra el mes que se deja si estaba reabierto. */
  private select(yearMonth: string): void {
    const leaving = this.yearMonth();
    const wasReopened = this.status() === 'reopened';
    this.toaster.dismissActions();
    this.selected.set(yearMonth);
    if (wasReopened) this.closeLeftMonth(leaving);
  }

  /** Pide cerrar un mes que se dejó reabierto, sin esperar la respuesta. */
  private closeLeftMonth(leaving: string): void {
    this.api.close(leaving).subscribe({
      next: () => {
        this.toaster.success(`${monthName(leaving)} se volvió a cerrar.`);
        if (this.yearMonth() === leaving) this.summary.reload();
      },
      error: () =>
        this.toaster.error(
          `No pudimos cerrar ${monthName(leaving)}. Se va a cerrar la próxima vez que abras la app.`,
        ),
    });
  }
}
