import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-switch',
  host: { '[class.on]': 'checked()' },
  template: `
    <button type="button" role="switch" [attr.aria-checked]="checked()" (click)="toggle()">
      <span class="track" aria-hidden="true"><span class="thumb"></span></span>
      <span class="label">{{ label() }}</span>
    </button>
  `,
  styles: `
    button {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      padding: 0 4px;
      border-radius: var(--fx-radius-row);
      color: var(--fx-text-2);
      font-size: 13px;
      font-weight: 500;
      transition: color var(--fx-duration-fast) ease;
    }
    button:hover {
      color: var(--fx-text-1);
    }
    .track {
      position: relative;
      flex: none;
      width: 36px;
      height: 20px;
      border-radius: var(--fx-radius-pill);
      background: #2a2a30;
      border: 1px solid var(--fx-border);
      transition: background var(--fx-duration-fast) var(--fx-ease);
    }
    .thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--fx-text-2);
      transition:
        transform var(--fx-duration-fast) var(--fx-ease),
        background var(--fx-duration-fast) var(--fx-ease);
    }
    :host(.on) .track {
      background: var(--fx-success);
      border-color: transparent;
    }
    :host(.on) .thumb {
      transform: translateX(16px);
      background: var(--fx-bg);
    }
    :host(.on) button {
      color: var(--fx-text-1);
    }
  `,
})
export class Switch {
  /** Estado del switch; admite two-way binding con `[(checked)]`. */
  readonly checked = model(false);
  /** Texto visible y accesible que describe qué activa el switch. */
  readonly label = input.required<string>();

  /** Invierte el estado del switch. */
  protected toggle(): void {
    this.checked.update((value) => !value);
  }
}
