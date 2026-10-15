import { HttpErrorResponse } from '@angular/common/http';

/** Códigos de error de negocio cuyo mensaje del backend está pensado para el usuario. */
const USER_FACING_STATUSES = new Set([400, 404, 409]);

/** Mensaje de error apto para mostrar al usuario: el del backend si es de negocio, o el alternativo. */
export function userErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse) || !USER_FACING_STATUSES.has(error.status)) {
    return fallback;
  }
  const message: unknown = error.error?.message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message) && typeof message[0] === 'string') return message[0];
  return fallback;
}
