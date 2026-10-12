import { Component, computed, inject, input } from '@angular/core';
import { Item } from './item';
import { ItemActions } from './item-actions';
import { ItemRow } from './item-row';

/** Tipo de grupo: ingresos o gastos. */
export type ItemKind = 'income' | 'expense';

/** Textos de cada grupo según su tipo. */
const GROUP_TEXTS = {
  income: { title: 'Ingresos', done: 'Cobrado', empty: 'No hay ingresos este mes.' },
  expense: { title: 'Gastos', done: 'Pagado', empty: 'No hay gastos este mes.' },
} as const;

@Component({
  selector: 'app-item-group',
  imports: [ItemRow],
  template: `
    <div class="heading">
      <div class="name">
        <h3>{{ texts().title }}</h3>
        <span class="count num">{{ countText() }}</span>
      </div>
      <span class="progress num">
        {{ texts().done }} <span class="done">{{ doneTotal() }}</span> de {{ total() }}
      </span>
    </div>
    <ul class="rows">
      @for (item of items(); track item.id) {
        <li>
          <app-item-row
            [item]="item"
            [editable]="editable()"
            (toggle)="actions.toggle(item)"
            (duplicate)="actions.duplicate(item)"
            (remove)="actions.remove(item)"
          />
        </li>
      } @empty {
        <li class="empty">{{ texts().empty }}</li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .heading {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      padding: 0 6px;
    }
    .name {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 500;
    }
    .count,
    .progress {
      font-size: 13px;
      color: var(--fx-text-3);
    }
    .done {
      color: var(--fx-text-1b);
    }
    .rows {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin: 0;
      padding: 6px;
      list-style: none;
      border-radius: var(--fx-radius-group);
      background: var(--fx-surface-0);
      border: 1px solid var(--fx-border-subtle);
    }
    .empty {
      padding: 18px 14px;
      font-size: 14px;
      color: var(--fx-text-3);
    }
  `,
})
export class ItemGroup {
  /** Tipo de movimientos que muestra el grupo. */
  readonly kind = input.required<ItemKind>();
  /** Movimientos del grupo. */
  readonly items = input.required<Item[]>();
  /** Total ya cobrado o pagado, calculado por el backend. */
  readonly doneTotal = input.required<number>();
  /** Total del grupo, calculado por el backend. */
  readonly total = input.required<number>();
  /** Si es `true`, los movimientos se pueden modificar. */
  readonly editable = input(false);

  /** Acciones sobre los movimientos. */
  protected readonly actions = inject(ItemActions);

  /** Título, etiqueta de completados y mensaje vacío del grupo. */
  protected readonly texts = computed(() => GROUP_TEXTS[this.kind()]);
  /** Cantidad de movimientos en texto (`3 movimientos`). */
  protected readonly countText = computed(() => {
    const count = this.items().length;
    return `${count} ${count === 1 ? 'movimiento' : 'movimientos'}`;
  });
}
