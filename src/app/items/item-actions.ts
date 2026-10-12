import { inject, Service } from '@angular/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import { userErrorMessage } from '../api/http-error-message';
import { MonthStore } from '../month/month-store';
import { Toaster } from '../shared/toaster';
import { UndoableAction, UndoStack } from '../shared/undo-stack';
import { Item } from './item';
import { ItemApi } from './item-api';

/** Textos que avisan el resultado de una acción. */
interface ActionMessages {
  /** Confirmación, o `undefined` si el resultado ya se ve en pantalla. */
  success?: string;
  /** Texto alternativo si el backend no manda un mensaje apto para el usuario. */
  error: string;
}

/** Describe cómo queda un ítem al marcarlo como completado o pendiente. */
function completionLabel(item: Item, completed: boolean): string {
  if (!completed) return 'pendiente';
  return item.isGain ? 'cobrado' : 'pagado';
}

@Service()
export class ItemActions {
  /** Estado del mes seleccionado. */
  private readonly store = inject(MonthStore);
  /** Endpoints de ítems. */
  private readonly api = inject(ItemApi);
  /** Avisos para el usuario. */
  private readonly toaster = inject(Toaster);
  /** Acciones que se pueden deshacer. */
  private readonly undoStack = inject(UndoStack);

  /** Alterna el ítem entre completado y pendiente. */
  toggle(item: Item): Promise<void> {
    const completed = !item.completed;
    return this.run(
      this.api.update(item.id, { completed }).pipe(
        map(() => ({
          description: `marcar «${item.title}» como ${completionLabel(item, completed)}`,
          undo: () => this.api.update(item.id, { completed: item.completed }),
        })),
      ),
      { error: 'No pudimos actualizar el movimiento.' },
    );
  }

  /** Crea una copia del ítem en el mismo mes. */
  duplicate(item: Item): Promise<void> {
    return this.run(
      this.api.duplicate(item.id).pipe(
        map((copy) => ({
          description: `duplicar «${item.title}»`,
          undo: () => this.api.remove(copy.id),
        })),
      ),
      { success: `Duplicaste «${item.title}».`, error: 'No pudimos duplicar el movimiento.' },
    );
  }

  /** Elimina el ítem. */
  remove(item: Item): Promise<void> {
    return this.run(
      this.api.remove(item.id).pipe(
        map(() => ({
          description: `eliminar «${item.title}»`,
          undo: () => this.api.restore(item.id),
        })),
      ),
      { success: `Eliminaste «${item.title}».`, error: 'No pudimos eliminar el movimiento.' },
    );
  }

  /** Ejecuta una acción, la registra para poder deshacerla, avisa el resultado y recarga el mes. */
  private async run(request: Observable<UndoableAction>, messages: ActionMessages): Promise<void> {
    try {
      this.undoStack.push(await firstValueFrom(request));
      if (messages.success) this.toaster.success(messages.success);
      this.store.refresh();
    } catch (error) {
      this.toaster.error(userErrorMessage(error, messages.error));
    }
  }
}
