import { Component, computed, inject, signal } from '@angular/core';
import { MonthStore } from '../month/month-store';
import { splitMoney } from '../shared/money';
import { MoneyPipe } from '../shared/money.pipe';
import { Switch } from '../shared/switch';
import { SummaryStat } from './summary-stat';

@Component({
  selector: 'app-summary-card',
  imports: [MoneyPipe, SummaryStat, Switch],
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
  /** Total de ingresos del mes que todavía no se cobraron. */
  protected readonly pendingIncome = this.store.pendingIncome;
  /** Indica si la proyección suma los ingresos por cobrar. */
  protected readonly includePendingIncome = signal(false);

  /** Resumen cargado, o `undefined` mientras carga o si hubo error. */
  protected readonly data = computed(() => (this.summary.hasValue() ? this.summary.value() : undefined));
  /** Ingresos por cobrar que se suman a la proyección según el switch. */
  protected readonly extraIncome = computed(() => (this.includePendingIncome() ? this.pendingIncome() : 0));
  /** Monto que quedará al cierre del mes. */
  protected readonly projected = computed(() => (this.data()?.projectedMonthEnd ?? 0) + this.extraIncome());
  /** Ahorro total proyectado: acumulado más lo que quedará este mes. */
  protected readonly totalProjected = computed(
    () => (this.data()?.totalProjectedSavings ?? 0) + this.extraIncome(),
  );
  /** Indica si el mes cierra en negativo. */
  protected readonly isNegative = computed(() => this.projected() < 0);
  /** Monto proyectado separado en parte entera y decimales. */
  protected readonly hero = computed(() => splitMoney(this.projected()));
  /** Texto de la etiqueta que resume la tendencia del mes. */
  protected readonly badgeText = computed(() => {
    const income = (this.data()?.gained ?? 0) + this.extraIncome();
    const projected = this.projected();
    const percent = income > 0 ? Math.round((Math.abs(projected) / income) * 100) : 0;
    if (projected === 0) return 'Mes en equilibrio';
    if (projected < 0) {
      return income > 0 ? `Gastás ${percent} % más de lo que entra` : 'Usás ahorro acumulado';
    }
    return `Vas a ahorrar el ${percent} % de lo que entra`;
  });
}
