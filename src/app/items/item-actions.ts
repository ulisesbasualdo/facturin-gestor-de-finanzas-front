import { inject, Service } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { userErrorMessage } from '../api/http-error-message';
import { MonthStore } from '../month/month-store';
import { Toaster } from '../shared/toaster';
import { Item } from './item';
import { ItemApi } from './item-api';

/** Textos que avisan el resultado de una acción. */
interface ActionMessages {
  /** Confirmación, o `undefined` si el resultado ya se ve en pantalla. */
  success?: string;
  /** Texto alternativo si el backend no manda un mensaje apto para el usuario. */
  error: string;
}

@Service()
export class ItemActions {
  /** Estado del mes seleccionado. */
  private readonly store = inject(MonthStore);
  /** Endpoints de ítems. */
  private readonly api = inject(ItemApi);
  /** Avisos para el usuario. */
  private readonly toaster = inject(Toaster);

  /** Alterna el ítem entre completado y pendiente. */
  toggle(item: Item): Promise<void> {
    return this.run(this.api.update(item.id, { completed: !item.completed }), {
      error: 'No pudimos actualizar el movimiento.',
    });
  }

  /** Crea una copia del ítem en el mismo mes. */
  duplicate(item: Item): Promise<void> {
    return this.run(this.api.duplicate(item.id), {
      success: `Duplicaste «${item.title}».`,
      error: 'No pudimos duplicar el movimiento.',
    });
  }

  /** Elimina el ítem y ofrece deshacerlo desde una tostada que guarda sus datos. */
  async remove(item: Item): Promise<void> {
    try {
      await firstValueFrom(this.api.remove(item.id));
      this.store.refresh();
      this.toaster.successWithAction(`Eliminaste «${item.title}».`, {
        label: 'Deshacer',
        run: () => void this.restore(item),
      });
    } catch (error) {
      this.toaster.error(userErrorMessage(error, 'No pudimos eliminar el movimiento.'));
    }
  }

  /** Vuelve a crear un ítem eliminado, que queda al final de su grupo. */
  private restore({ id: _deletedId, ...data }: Item): Promise<void> {
    return this.run(this.api.create(data), {
      success: `Restauraste «${data.title}».`,
      error: 'No pudimos restaurar el movimiento.',
    });
  }

  /** Envía un pedido, avisa el resultado y recarga los datos del mes. */
  private async run(request: Observable<unknown>, messages: ActionMessages): Promise<void> {
    try {
      await firstValueFrom(request);
      if (messages.success) this.toaster.success(messages.success);
      this.store.refresh();
    } catch (error) {
      this.toaster.error(userErrorMessage(error, messages.error));
    }
  }
}
