import { httpResource } from '@angular/common/http';
import { computed, Service, signal } from '@angular/core';
import { Item, MonthlySummary } from '../items/item';
import { itemsEndpoints } from '../items/items-endpoints';
import { addMonths, compareMonths, toYearMonth } from './calendar';

@Service()
export class MonthStore {
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
  readonly summary = httpResource<MonthlySummary>(() => itemsEndpoints.summary(this.yearMonth()));
  /** Ítems del mes seleccionado, recargados al cambiar de mes. */
  readonly items = httpResource<Item[]>(() => itemsEndpoints.byMonth(this.yearMonth()), {
    defaultValue: [],
  });
  /** Total de ingresos del mes que todavía no se cobraron. */
  readonly pendingIncome = computed(() =>
    this.items
      .value()
      .filter((item) => item.isGain && !item.completed)
      .reduce((total, item) => total + item.price, 0),
  );

  /** Selecciona el mes anterior. */
  previous(): void {
    this.selected.set(this.previousYearMonth());
  }

  /** Selecciona el mes siguiente. */
  next(): void {
    this.selected.set(this.nextYearMonth());
  }

  /** Vuelve a seleccionar el mes actual. */
  goToToday(): void {
    this.selected.set(this.todayYearMonth);
  }
}
