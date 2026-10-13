import { httpResource } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { apiEndpoints } from '../api/api-endpoints';
import { userErrorMessage } from '../api/http-error-message';
import { Item, MonthlySummary } from '../items/item';
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

  /** Indica si hay un pedido de cierre o reapertura en curso, modificable solo desde este servicio. */
  private readonly changingStatus = signal(false);
  /** Indica si hay un pedido de cierre o reapertura en curso. */
  readonly isChangingStatus = this.changingStatus.asReadonly();

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
  reopen(): Promise<void> {
    const yearMonth = this.yearMonth();
    return this.changeStatus(
      this.api.reopen(yearMonth),
      `Reabriste ${monthName(yearMonth)}. Ya podés modificarlo.`,
      'No pudimos reabrir el mes.',
    );
  }

  /** Vuelve a cerrar el mes seleccionado. */
  close(): Promise<void> {
    const yearMonth = this.yearMonth();
    return this.changeStatus(
      this.api.close(yearMonth),
      `Cerraste ${monthName(yearMonth)}.`,
      'No pudimos cerrar el mes.',
    );
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
      error: () => undefined,
    });
  }

  /** Envía un pedido de cierre o reapertura, avisa el resultado y recarga el resumen. */
  private async changeStatus(
    request: Observable<unknown>,
    successMessage: string,
    errorMessage: string,
  ): Promise<void> {
    this.changingStatus.set(true);
    try {
      await firstValueFrom(request);
      this.toaster.success(successMessage);
      this.summary.reload();
    } catch (error) {
      this.toaster.error(userErrorMessage(error, errorMessage));
    } finally {
      this.changingStatus.set(false);
    }
  }
}
