import { computed, effect, inject, Service, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { userErrorMessage } from '../api/http-error-message';
import { MonthStore } from '../month/month-store';
import { Toaster } from './toaster';

/** Cantidad máxima de acciones que se pueden deshacer. */
export const UNDO_LIMIT = 3;

/** Acción ya ejecutada que se puede revertir. */
export interface UndoableAction {
  /** Descripción de la acción (`eliminar «Alquiler»`). */
  description: string;
  /** Pedido que revierte la acción. */
  undo: () => Observable<unknown>;
}

@Service()
export class UndoStack {
  /** Estado del mes seleccionado. */
  private readonly store = inject(MonthStore);
  /** Avisos para el usuario. */
  private readonly toaster = inject(Toaster);

  /** Acciones que se pueden deshacer, de la más vieja a la más nueva. */
  private readonly actions = signal<UndoableAction[]>([]);
  /** Indica si hay alguna acción para deshacer. */
  readonly canUndo = computed(() => this.actions().length > 0);
  /** Descripción de la próxima acción que se desharía. */
  readonly nextDescription = computed(() => this.actions().at(-1)?.description);

  constructor() {
    this.store.onLeave(async () => this.clear());
    effect(() => {
      if (this.store.status() === 'closed') this.clear();
    });
  }

  /** Registra una acción recién ejecutada, descartando la más vieja si se supera el límite. */
  push(action: UndoableAction): void {
    this.actions.update((actions) => [...actions, action].slice(-UNDO_LIMIT));
  }

  /** Revierte la última acción; si falla, la vuelve a dejar en la pila. */
  async undo(): Promise<void> {
    const action = this.actions().at(-1);
    if (!action) return;
    this.actions.update((actions) => actions.slice(0, -1));
    try {
      await firstValueFrom(action.undo());
      this.toaster.success(`Deshiciste: ${action.description}.`);
      this.store.refresh();
    } catch (error) {
      this.actions.update((actions) => [...actions, action].slice(-UNDO_LIMIT));
      this.toaster.error(userErrorMessage(error, 'No pudimos deshacer la acción.'));
    }
  }

  /** Vacía la pila. */
  clear(): void {
    this.actions.set([]);
  }
}
