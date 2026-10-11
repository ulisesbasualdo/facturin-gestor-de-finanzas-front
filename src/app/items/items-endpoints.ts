import { environment } from '../../environments/environment';

/** Origen de los datos: carpeta de mocks o URL del backend. */
const baseUrl = environment.mockable ? '/mocks' : environment.apiUrl;
/** Extensión que se agrega a cada ruta (`.json` en modo mock). */
const extension = environment.mockable ? '.json' : '';

/** Constructores de URL para los endpoints de ítems. */
export const itemsEndpoints = {
  /** URL de los ítems de un mes. */
  byMonth: (yearMonth: string) => `${baseUrl}/items/${yearMonth}${extension}`,
  /** URL del resumen financiero de un mes. */
  summary: (yearMonth: string) => `${baseUrl}/items/${yearMonth}/summary${extension}`,
};
