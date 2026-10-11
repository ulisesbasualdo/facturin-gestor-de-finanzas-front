/** Movimiento de dinero (ingreso o gasto) de un mes. */
export interface Item {
  /** Identificador único. */
  id: number;
  /** Descripción del movimiento. */
  title: string;
  /** Monto en pesos, siempre positivo. */
  price: number;
  /** Indica si ya se cobró o pagó. */
  completed: boolean;
  /** Mes al que pertenece, en formato `YYYY-MM`. */
  yearMonth: string;
  /** `true` si es ingreso, `false` si es gasto. */
  isGain: boolean;
}

/** Resumen financiero de un mes calculado por el backend. */
export interface MonthlySummary {
  /** Total de ingresos ya cobrados. */
  gained: number;
  /** Total de gastos ya pagados. */
  spent: number;
  /** Total de gastos pendientes de pago. */
  pendingExpenses: number;
  /** Disponible hoy: cobrado menos pagado. */
  remaining: number;
  /** Lo que quedará al cierre del mes si se pagan los pendientes. */
  projectedMonthEnd: number;
  /** Ahorro acumulado de los meses anteriores. */
  accumulatedBeforeThisMonth: number;
  /** Ahorro acumulado más lo proyectado para este mes. */
  totalProjectedSavings: number;
  /** Si el mes suma (`increase`) o resta (`decrease`) al ahorro. */
  trend: 'increase' | 'decrease';
}
