/** Configuración que cambia según el entorno de compilación. */
export interface Environment {
  /** Si es `true`, los datos se leen de JSON locales en lugar del backend. */
  mockable: boolean;
  /** URL base del backend. */
  apiUrl: string;
}
