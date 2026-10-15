import { computed, inject, linkedSignal, Service } from '@angular/core';
import { MonthStore } from '../month/month-store';
import { EditTarget, FocusReturn } from './_definitions';
import { Item, ItemKind } from './item.interface';

@Service()
export class ItemEditSession {
  /** Estado del mes seleccionado. */
  private readonly store = inject(MonthStore);

  /** Mes seleccionado y su estado (`2026-09:reopened`); cuando cambia, se cierra la edición. */
  private readonly monthAndStatus = computed(() => `${this.store.yearMonth()}:${this.store.status()}`);
  /** Edición abierta, modificable solo desde este servicio; vuelve a `null` al cambiar de mes o de estado. */
  private readonly opened = linkedSignal<string, EditTarget | null>({
    source: this.monthAndStatus,
    computation: () => null,
  });
  /** Edición abierta, o `null` si no hay ninguna. */
  readonly current = this.opened.asReadonly();
  /** Elemento al que tiene que volver el foco al cerrar la edición; se olvida al cambiar de mes o de estado. */
  private readonly focusReturn = linkedSignal<string, FocusReturn | null>({
    source: this.monthAndStatus,
    computation: () => null,
  });

  /** Edición abierta de ese movimiento, o `null` si no se está editando. */
  editTargetFor(id: number): EditTarget | null {
    const target = this.opened();
    return target?.mode === 'edit' && target.item.id === id ? target : null;
  }

  /** Alta abierta de ese tipo, o `null` si no se está agregando. */
  addTargetFor(kind: ItemKind): EditTarget | null {
    const target = this.opened();
    return target?.mode === 'add' && target.kind === kind ? target : null;
  }

  /** Abre la edición de una copia del movimiento, cerrando cualquier otra. */
  edit(item: Item): void {
    this.focusReturn.set(null);
    this.opened.set({ mode: 'edit', item: { ...item } });
  }

  /** Abre el alta de un movimiento nuevo del tipo indicado, cerrando cualquier otra edición. */
  add(kind: ItemKind): void {
    this.focusReturn.set(null);
    this.opened.set({ mode: 'add', kind });
  }

  /** Cierra la edición y pide devolver el foco a la fila o al botón que la abrió. */
  close(): void {
    const target = this.opened();
    if (target === null) return;
    this.focusReturn.set(
      target.mode === 'edit' ? { mode: 'edit', id: target.item.id } : { mode: 'add', kind: target.kind },
    );
    this.opened.set(null);
  }

  /** Cierra la edición sin mover el foco, porque el usuario ya está actuando en otro lugar. */
  discard(): void {
    this.opened.set(null);
  }

  /** Indica si el foco tiene que volver a este elemento; si es así, consume el pedido. */
  takeFocus(target: FocusReturn): boolean {
    const pending = this.focusReturn();
    const matches =
      pending !== null &&
      (pending.mode === 'edit'
        ? target.mode === 'edit' && pending.id === target.id
        : target.mode === 'add' && pending.kind === target.kind);
    if (matches) this.focusReturn.set(null);
    return matches;
  }
}
