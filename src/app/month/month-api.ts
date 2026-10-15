import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { apiEndpoints } from '../api/api-endpoints';
import { MonthStatusResponse } from './month.interface';

@Service()
export class MonthApi {
  /** Cliente HTTP de Angular. */
  private readonly http = inject(HttpClient);

  /** Reabre un mes pasado. */
  reopen(yearMonth: string): Observable<MonthStatusResponse> {
    return this.http.post<MonthStatusResponse>(apiEndpoints.reopenMonth(yearMonth), null);
  }

  /** Vuelve a cerrar un mes reabierto. */
  close(yearMonth: string): Observable<MonthStatusResponse> {
    return this.http.post<MonthStatusResponse>(apiEndpoints.closeMonth(yearMonth), null);
  }

  /** Vuelve a cerrar todos los meses reabiertos. */
  closeAllReopened(): Observable<void> {
    return this.http.post<void>(apiEndpoints.closeReopenedMonths(), null);
  }
}

/** Cierra los meses que quedaron reabiertos en una sesión anterior; si falla, la app arranca igual. */
export function closeReopenedMonthsOnStart(): Observable<unknown> {
  return inject(MonthApi)
    .closeAllReopened()
    .pipe(catchError(() => of(undefined)));
}
