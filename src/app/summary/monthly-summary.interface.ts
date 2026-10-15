import { MonthStatus } from '../month/month.interface';

/** Resumen financiero de un mes calculado por el backend. */
export interface MonthlySummary {
  /** Total de ingresos ya cobrados. */
  gained: number;
  /** Total de gastos ya pagados. */
  spent: number;
  /** Total de ingresos pendientes de cobro. */
  pendingIncome: number;
  /** Total de gastos pendientes de pago. */
  pendingExpenses: number;
  /** Total de ingresos del mes, cobrados o no. */
  totalIncome: number;
  /** Total de gastos del mes, pagados o no. */
  totalExpenses: number;
  /** Disponible hoy: cobrado menos pagado. */
  remaining: number;
  /** Lo que quedará al cierre del mes si se pagan los pendientes. */
  projectedMonthEnd: number;
  /** Lo que quedará al cierre si además se cobran los ingresos pendientes. */
  projectedWithPendingIncome: number;
  /** Ahorro acumulado de los meses anteriores. */
  accumulatedBeforeThisMonth: number;
  /** Ahorro acumulado más lo proyectado para este mes. */
  totalProjectedSavings: number;
  /** Ahorro acumulado más lo proyectado contando los ingresos pendientes. */
  totalProjectedSavingsWithPendingIncome: number;
  /** Si el mes suma (`increase`) o resta (`decrease`) al ahorro. */
  trend: 'increase' | 'decrease';
  /** Si el mes está abierto, cerrado o reabierto. */
  monthStatus: MonthStatus;
}
