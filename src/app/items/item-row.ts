import { Component, computed, input } from '@angular/core';
import { Item } from './item';

@Component({
  selector: 'app-item-row',
  template: `
    <span class="check" aria-hidden="true">
      @if (item().completed) {
        <svg width="13" height="13" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
      }
    </span>
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
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 64px;
      padding: 0 14px;
      border-radius: var(--fx-radius-row);
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
  },
})
export class ItemRow {
  /** Movimiento a mostrar. */
  readonly item = input.required<Item>();

  /** Estado legible: cobrado, pagado, por cobrar o por pagar. */
  protected readonly status = computed(() => {
    const { completed, isGain } = this.item();
    if (completed) return isGain ? 'Cobrado' : 'Pagado';
    return isGain ? 'Por cobrar' : 'Por pagar';
  });
}
