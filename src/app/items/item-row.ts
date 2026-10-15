import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ThrottledClick } from '../shared/throttled-click';
import { Item } from './item.interface';
import { ReturnFocus } from './return-focus';

@Component({
  selector: 'app-item-row',
  imports: [NgTemplateOutlet, ThrottledClick, ReturnFocus],
  template: `
    @if (editable()) {
      <button
        type="button"
        class="check"
        [attr.aria-label]="toggleLabel()"
        appThrottledClick
        (throttledClick)="toggle.emit()"
      >
        @if (item().completed) {
          <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        }
      </button>
    } @else {
      <span class="check" aria-hidden="true">
        @if (item().completed) {
          <svg width="13" height="13" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
        }
      </span>
    }
    <ng-template #content>
      <span class="glyph" aria-hidden="true">
        <svg width="15" height="15" viewBox="0 0 24 24">
          @if (item().isGain) {
            <path d="M7 17L17 7" />
            <path d="M8 7h9v9" />
          } @else {
            <path d="M7 7l10 10" />
            <path d="M17 8v9H8" />
          }
        </svg>
      </span>
      <span class="sr-only">{{ item().isGain ? 'Ingreso' : 'Gasto' }}:</span>
      <span class="title">{{ item().title }}</span>
      <span class="chip">{{ status() }}</span>
      <span class="amount num">{{ item().price }}</span>
    </ng-template>
    @if (editable()) {
      <button
        type="button"
        class="main"
        [attr.aria-label]="'Editar ' + item().title"
        [appReturnFocus]="{ mode: 'edit', id: item().id }"
        (click)="edit.emit()"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </button>
    } @else {
      <span class="main">
        <ng-container [ngTemplateOutlet]="content" />
      </span>
    }
    @if (editable()) {
      <span class="actions">
        <button
          type="button"
          class="icon-button"
          [attr.aria-label]="'Duplicar ' + item().title"
          title="Duplicar"
          appThrottledClick
          (throttledClick)="duplicate.emit()"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="9" y="9" width="12" height="12" rx="2.5" />
            <path d="M5 15V6a2 2 0 0 1 2-2h9" />
          </svg>
        </button>
        <button
          type="button"
          class="icon-button"
          [attr.aria-label]="'Eliminar ' + item().title"
          title="Eliminar"
          appThrottledClick
          (throttledClick)="remove.emit()"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16" />
            <path d="M9 7V4.5h6V7" />
            <path d="M6.5 7l1 13h9l1-13" />
          </svg>
        </button>
      </span>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 64px;
      padding: 0 8px 0 14px;
      border-radius: var(--fx-radius-row);
      transition: background var(--fx-duration-fast) ease;
    }
    :host(.editable:hover),
    :host(.editable:focus-within) {
      background: var(--fx-surface-hover);
    }
    svg {
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .check {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: var(--fx-radius-pill);
      border: 1.5px dashed var(--fx-check-pending);
      color: var(--fx-bg);

      svg {
        stroke-width: 3;
      }
    }
    :host(.done) .check {
      border: 1.5px solid var(--fx-text-1);
      background: var(--fx-text-1);
    }
    .main {
      flex: 1;
      min-width: 0;
      align-self: stretch;
      display: flex;
      align-items: center;
      gap: 12px;
      text-align: left;
      border-radius: var(--fx-radius-sm);
    }
    .glyph {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--fx-radius-input);
      background: rgba(255, 255, 255, 0.05);
      color: var(--fx-text-2);
    }
    :host(.gain) .glyph {
      background: var(--fx-success-soft);
      color: var(--fx-success);
    }
    .title {
      flex: 1;
      min-width: 0;
      font-size: 15px;
      color: var(--fx-text-2);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    :host(.done) .title {
      color: var(--fx-text-1);
    }
    .chip {
      flex: none;
      display: inline-flex;
      align-items: center;
      height: 24px;
      padding: 0 10px;
      border-radius: var(--fx-radius-pill);
      border: 1px dashed var(--fx-border-dashed);
      color: var(--fx-text-1b);
      font-size: 12px;
      font-weight: 500;
    }
    :host(.done) .chip {
      border-style: solid;
      border-color: var(--fx-border-subtle);
      color: var(--fx-text-3);
    }
    .amount {
      flex: none;
      min-width: 150px;
      text-align: right;
      font-size: 17px;
      font-weight: 500;
      letter-spacing: -0.015em;
      color: var(--fx-text-2);
    }
    :host(.done) .amount {
      color: var(--fx-text-1);
    }
    :host(.gain) .amount {
      color: var(--fx-success-pending);
    }
    :host(.gain.done) .amount {
      color: var(--fx-success);
    }
    .actions {
      flex: none;
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity var(--fx-duration-fast) ease;
    }
    :host(:hover) .actions,
    :host(:focus-within) .actions {
      opacity: 1;
    }
    .icon-button {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: var(--fx-radius-sm);
      color: var(--fx-text-3);
      transition:
        background var(--fx-duration-fast) ease,
        color var(--fx-duration-fast) ease;

      svg {
        stroke-width: 1.8;
      }
    }
    .icon-button:hover {
      background: rgba(255, 255, 255, 0.06);
      color: var(--fx-text-1);
    }
    @media (hover: none) {
      .actions {
        opacity: 1;
      }
    }
    @media (max-width: 640px) {
      .chip {
        display: none;
      }
      .amount {
        min-width: 0;
        font-size: 15px;
      }
    }
  `,
  host: {
    '[class.done]': 'item().completed',
    '[class.gain]': 'item().isGain',
    '[class.editable]': 'editable()',
  },
})
export class ItemRow {
  /** Movimiento a mostrar. */
  readonly item = input.required<Item>();
  /** Si es `true`, muestra los botones para modificar el movimiento. */
  readonly editable = input(false);

  /** Se emite al pedir editar el movimiento. */
  readonly edit = output();
  /** Se emite al pedir alternar entre completado y pendiente. */
  readonly toggle = output();
  /** Se emite al pedir duplicar el movimiento. */
  readonly duplicate = output();
  /** Se emite al pedir eliminar el movimiento. */
  readonly remove = output();

  /** Estado legible: cobrado, pagado, por cobrar o por pagar. */
  protected readonly status = computed(() => {
    const { completed, isGain } = this.item();
    if (completed) return isGain ? 'Cobrado' : 'Pagado';
    return isGain ? 'Por cobrar' : 'Por pagar';
  });
  /** Texto del botón que alterna el estado (`Marcar «Alquiler» como pagado`). */
  protected readonly toggleLabel = computed(() => {
    const { completed, isGain, title } = this.item();
    if (completed) return `Marcar «${title}» como pendiente`;
    return `Marcar «${title}» como ${isGain ? 'cobrado' : 'pagado'}`;
  });
}
