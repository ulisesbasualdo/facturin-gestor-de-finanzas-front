import { Component, input } from '@angular/core';

@Component({
  selector: 'app-summary-stat',
  template: `
    <span class="label">
      {{ label() }}
      @if (hint()) {
        <span class="hint">· {{ hint() }}</span>
      }
    </span>
    <span class="value num" [class.muted]="muted()">{{ amount() }}</span>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .label {
      font-size: 13px;
      color: var(--fx-text-3);
    }
    .hint {
      color: var(--fx-text-3);
    }
    .value {
      font-size: 22px;
      font-weight: 500;
      letter-spacing: -0.02em;
      color: var(--fx-text-1);
    }
    .muted {
      color: var(--fx-text-2);
    }
  `,
})
export class SummaryStat {
  /** Texto que describe la cifra (`Ganado`, `Gastado`…). */
  readonly label = input.required<string>();
  /** Monto a mostrar, tal como llega del backend. */
  readonly amount = input.required<number>();
  /** Aclaración opcional que se muestra junto a la etiqueta (`disponible hoy`). */
  readonly hint = input<string>();
  /** Si es `true`, muestra el monto con un color atenuado. */
  readonly muted = input(false);
}
