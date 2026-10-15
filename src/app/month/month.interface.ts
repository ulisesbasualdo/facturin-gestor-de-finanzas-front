/** Estado de un mes: actual o futuro (`open`), pasado (`closed`) o pasado reabierto (`reopened`). */
export type MonthStatus = 'open' | 'closed' | 'reopened';

/** Respuesta del backend al cerrar o reabrir un mes. */
export interface MonthStatusResponse {
  /** Estado en el que quedó el mes. */
  status: MonthStatus;
}

/** Posición de un mes respecto de otro: pasado, actual o futuro. */
export type MonthTiming = 'past' | 'current' | 'future';
