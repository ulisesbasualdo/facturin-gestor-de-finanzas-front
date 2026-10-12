import { HttpErrorResponse } from '@angular/common/http';

/** Códigos de error de negocio cuyo mensaje del backend está pensado para el usuario. */
const USER_FACING_STATUSES = new Set([400, 404, 409]);

/** Mensaje de error apto para mostrar al usuario: el del backend si es de negocio, o el alternativo. */
export function userErrorMessage(error: unknown, fallback: string): string {
  if (
    error instanceof HttpErrorResponse &&
    USER_FACING_STATUSES.has(error.status) &&
    typeof error.error?.message === 'string'
  ) {
    return error.error.message;
  }
  return fallback;
}
