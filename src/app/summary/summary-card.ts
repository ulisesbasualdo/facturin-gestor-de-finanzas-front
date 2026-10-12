import { Component, computed, inject, signal } from '@angular/core';
import { MonthStore } from '../month/month-store';
import { Switch } from '../shared/switch';
import { SummaryStat } from './summary-stat';

@Component({
  selector: 'app-summary-card',
  imports: [SummaryStat, Switch],
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.scss',
  host: {
    role: 'region',
    'aria-label': 'Resumen del mes',
    '[class.negative]': 'isNegative()',
    '[attr.aria-busy]': 'summary.isLoading()',
  },
})
export class SummaryCard {
  /** Estado del mes seleccionado. */
  private readonly store = inject(MonthStore);

  /** Recurso HTTP con el resumen del mes seleccionado. */
  protected readonly summary = this.store.summary;
  /** Indica si la proyección suma los ingresos por cobrar. */
  protected readonly includePendingIncome = signal(false);

  /** Resumen cargado, o `undefined` mientras carga o si hubo error. */
  protected readonly data = computed(() => (this.summary.hasValue() ? this.summary.value() : undefined));
  /** Total de ingresos del mes que todavía no se cobraron. */
  protected readonly pendingIncome = computed(() => this.data()?.pendingIncome ?? 0);
  /** Monto que quedará al cierre del mes, con o sin los ingresos por cobrar según el switch. */
  protected readonly projected = computed(() => {
    const summary = this.data();
    if (!summary) return 0;
    return this.includePendingIncome()
      ? summary.projectedWithPendingIncome
      : summary.projectedMonthEnd;
  });
  /** Ahorro total proyectado, con o sin los ingresos por cobrar según el switch. */
  protected readonly totalProjected = computed(() => {
    const summary = this.data();
    if (!summary) return 0;
    return this.includePendingIncome()
      ? summary.totalProjectedSavingsWithPendingIncome
      : summary.totalProjectedSavings;
  });
  /** Indica si el mes cierra en negativo. */
  protected readonly isNegative = computed(() => this.projected() < 0);
  /** Texto de la etiqueta que resume la tendencia del mes. */
  protected readonly badgeText = computed(() => {
    const summary = this.data();
    const income = (this.includePendingIncome() ? summary?.totalIncome : summary?.gained) ?? 0;
    const projected = this.projected();
    const percent = income > 0 ? Math.round((Math.abs(projected) / income) * 100) : 0;
    if (projected === 0) return 'Mes en equilibrio';
    if (projected < 0) {
      return income > 0 ? `Gastás ${percent} % más de lo que entra` : 'Usás ahorro acumulado';
    }
    return `Vas a ahorrar el ${percent} % de lo que entra`;
  });
}
