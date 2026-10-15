import { inject, Service } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { userErrorMessage } from '../api/http-error-message';
import { MonthStore } from '../month/month-store';
import { Toaster } from '../shared/toaster';
import { Item } from './item.interface';
import { ItemApi } from './item-api';
import { ItemFields } from './item-form.interface';
import { ItemEditSession } from './item-edit-session';

@Service()
export class ItemActions {
  /** Estado del mes seleccionado. */
  private readonly store = inject(MonthStore);
  /** Endpoints de ítems. */
  private readonly api = inject(ItemApi);
  /** Avisos para el usuario. */
  private readonly toaster = inject(Toaster);
  /** Edición en curso, que se descarta al actuar sobre otra fila. */
  private readonly editSession = inject(ItemEditSession);

  /** Guarda un movimiento nuevo (sin `id`) o los cambios de uno existente, y recarga el mes si sale bien. */
  save(id: number | undefined, fields: ItemFields): Observable<Item> {
    const request =
      id === undefined
        ? this.api.create({ ...fields, yearMonth: this.store.yearMonth() })
        : this.api.update(id, fields);
    return request.pipe(tap(() => this.store.refresh()));
  }

  /** Alterna el ítem entre completado y pendiente. */
  toggle(item: Item): void {
    this.editSession.discard();
    this.api.update(item.id, { completed: !item.completed }).subscribe({
      next: () => this.store.refresh(),
      error: (error) =>
        this.toaster.error(userErrorMessage(error, 'No pudimos actualizar el movimiento.')),
    });
  }

  /** Crea una copia del ítem en el mismo mes. */
  duplicate(item: Item): void {
    this.editSession.discard();
    this.api.duplicate(item.id).subscribe({
      next: () => {
        this.toaster.success(`Duplicaste «${item.title}».`);
        this.store.refresh();
      },
      error: (error) =>
        this.toaster.error(userErrorMessage(error, 'No pudimos duplicar el movimiento.')),
    });
  }

  /** Elimina el ítem y ofrece deshacerlo desde una tostada que guarda sus datos. */
  remove(item: Item): void {
    this.editSession.discard();
    this.api.remove(item.id).subscribe({
      next: () => {
        this.store.refresh();
        this.toaster.successWithAction(`Eliminaste «${item.title}».`, {
          label: 'Deshacer',
          run: () => this.restore(item),
        });
      },
      error: (error) =>
        this.toaster.error(userErrorMessage(error, 'No pudimos eliminar el movimiento.')),
    });
  }

  /** Vuelve a crear un ítem eliminado, que queda primero en su grupo. */
  private restore({ id: _deletedId, ...data }: Item): void {
    this.editSession.discard();
    this.api.create(data).subscribe({
      next: () => {
        this.toaster.success(`Restauraste «${data.title}».`);
        this.store.refresh();
      },
      error: (error) =>
        this.toaster.error(userErrorMessage(error, 'No pudimos restaurar el movimiento.')),
    });
  }
}
