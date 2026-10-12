import { httpResource } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { apiEndpoints } from '../api/api-endpoints';
import { Item, MonthlySummary } from '../items/item';
import { addMonths, compareMonths, toYearMonth } from './calendar';
import { MonthApi } from './month-api';

@Service()
export class MonthStore {
  /** Endpoints para cerrar y reabrir meses. */
  private readonly api = inject(MonthApi);

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

  /** Indica si hay un pedido de cierre o reapertura en curso, modificable solo desde este servicio. */
  private readonly changingStatus = signal(false);
  /** Indica si hay un pedido de cierre o reapertura en curso. */
  readonly isChangingStatus = this.changingStatus.asReadonly();
  /** Último error al cerrar o reabrir, modificable solo desde este servicio. */
  private readonly statusFailure = signal<string | undefined>(undefined);
  /** Último error al cerrar o reabrir el mes seleccionado. */
  readonly statusError = this.statusFailure.asReadonly();

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
  reopen(): Promise<void> {
    return this.changeStatus(this.api.reopen(this.yearMonth()), 'No pudimos reabrir el mes.');
  }

  /** Vuelve a cerrar el mes seleccionado. */
  close(): Promise<void> {
    return this.changeStatus(this.api.close(this.yearMonth()), 'No pudimos cerrar el mes.');
  }

  /** Cambia de mes, cerrando antes el actual si estaba reabierto. */
  private select(yearMonth: string): void {
    this.closeIfReopened();
    this.statusFailure.set(undefined);
    this.selected.set(yearMonth);
  }

  /** Pide cerrar el mes seleccionado si está reabierto, sin esperar la respuesta. */
  private closeIfReopened(): void {
    if (this.status() !== 'reopened') return;
    const leaving = this.yearMonth();
    this.api.close(leaving).subscribe({
      next: () => {
        if (this.yearMonth() === leaving) this.summary.reload();
      },
      error: () => undefined,
    });
  }

  /** Envía un pedido de cierre o reapertura y recarga el resumen. */
  private async changeStatus(request: Observable<unknown>, errorMessage: string): Promise<void> {
    this.changingStatus.set(true);
    this.statusFailure.set(undefined);
    try {
      await firstValueFrom(request);
      this.summary.reload();
    } catch {
      this.statusFailure.set(errorMessage);
    } finally {
      this.changingStatus.set(false);
    }
  }
}
