import { environment } from '../../environments/environment';

/** Origen de los datos: carpeta de mocks o URL del backend. */
const baseUrl = environment.mockable ? '/mocks' : environment.apiUrl;
/** Extensión que se agrega a cada ruta (`.json` en modo mock). */
const extension = environment.mockable ? '.json' : '';

/** Constructores de URL de los endpoints del backend. */
export const apiEndpoints = {
  /** URL de los ítems de un mes. */
  itemsByMonth: (yearMonth: string) => `${baseUrl}/items/${yearMonth}${extension}`,
  /** URL del resumen financiero de un mes. */
  summary: (yearMonth: string) => `${baseUrl}/items/${yearMonth}/summary${extension}`,
  /** URL para reabrir un mes pasado. */
  reopenMonth: (yearMonth: string) => `${baseUrl}/months/${yearMonth}/reopen`,
  /** URL para volver a cerrar un mes reabierto. */
  closeMonth: (yearMonth: string) => `${baseUrl}/months/${yearMonth}/close`,
  /** URL para cerrar todos los meses reabiertos. */
  closeReopenedMonths: () => `${baseUrl}/months/close-reopened`,
};
