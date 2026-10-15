import { Component, computed, inject, input } from '@angular/core';
import { Item, ItemKind } from './item.interface';
import { ItemActions } from './item-actions';
import { ItemEditSession } from './item-edit-session';
import { ItemEditor } from './item-editor';
import { ItemRow } from './item-row';
import { ReturnFocus } from './return-focus';

/** Textos de cada grupo según su tipo. */
const GROUP_TEXTS = {
  income: {
    title: 'Ingresos',
    done: 'Cobrado',
    empty: 'No hay ingresos este mes.',
    add: 'Agregar ingreso',
  },
  expense: {
    title: 'Gastos',
    done: 'Pagado',
    empty: 'No hay gastos este mes.',
    add: 'Agregar gasto',
  },
} as const;

@Component({
  selector: 'app-item-group',
  imports: [ItemRow, ItemEditor, ReturnFocus],
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
          @if (session.editTargetFor(item.id); as target) {
            <app-item-editor [target]="target" />
          } @else {
            <app-item-row
              [item]="item"
              [editable]="editable()"
              (edit)="session.edit(item)"
              (toggle)="actions.toggle(item)"
              (duplicate)="actions.duplicate(item)"
              (remove)="actions.remove(item)"
            />
          }
        </li>
      } @empty {
        <li class="empty">{{ texts().empty }}</li>
      }
      @if (editable()) {
        <li>
          @if (session.addTargetFor(kind()); as target) {
            <app-item-editor [target]="target" />
          } @else {
            <button
              type="button"
              class="add"
              [appReturnFocus]="{ mode: 'add', kind: kind() }"
              (click)="session.add(kind())"
            >
              <span class="add-icon" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </span>
              {{ texts().add }}
            </button>
          }
        </li>
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
    .add {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      height: 52px;
      padding: 0 14px;
      border-radius: var(--fx-radius-row);
      color: var(--fx-text-3);
      font-size: 14px;
      text-align: left;
      transition:
        background var(--fx-duration-fast) ease,
        color var(--fx-duration-fast) ease;
    }
    .add:hover {
      background: #121216;
      color: var(--fx-text-1);
    }
    .add-icon {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border-radius: var(--fx-radius-pill);
      border: 1.5px dashed #3e3e46;
    }
    svg {
      fill: none;
      stroke: currentColor;
      stroke-width: 2.4;
      stroke-linecap: round;
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
  /** Edición o alta abierta. */
  protected readonly session = inject(ItemEditSession);

  /** Título, etiqueta de completados, mensaje vacío y texto del botón de agregar del grupo. */
  protected readonly texts = computed(() => GROUP_TEXTS[this.kind()]);
  /** Cantidad de movimientos en texto (`3 movimientos`). */
  protected readonly countText = computed(() => {
    const count = this.items().length;
    return `${count} ${count === 1 ? 'movimiento' : 'movimientos'}`;
  });
}
