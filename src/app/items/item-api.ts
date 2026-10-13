import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { apiEndpoints } from '../api/api-endpoints';
import { Item } from './item';

/** Datos de un ítem sin su identificador, para crearlo. */
export type NewItem = Omit<Item, 'id'>;
/** Campos de un ítem que se pueden modificar. */
export type ItemChanges = Partial<NewItem>;

@Service()
export class ItemApi {
  /** Cliente HTTP de Angular. */
  private readonly http = inject(HttpClient);

  /** Modifica los campos indicados de un ítem. */
  update(id: number, changes: ItemChanges): Observable<Item> {
    return this.http.patch<Item>(apiEndpoints.item(id), changes);
  }

  /** Elimina un ítem. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(apiEndpoints.item(id));
  }

  /** Crea un ítem. */
  create(item: NewItem): Observable<Item> {
    return this.http.post<Item>(apiEndpoints.items(), item);
  }

  /** Crea una copia de un ítem en el mismo mes. */
  duplicate(id: number): Observable<Item> {
    return this.http.post<Item>(apiEndpoints.duplicateItem(id), null);
  }
}
