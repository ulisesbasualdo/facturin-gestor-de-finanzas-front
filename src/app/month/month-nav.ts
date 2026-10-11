import { Component, computed, inject } from '@angular/core';
import { monthName } from './calendar';
import { MonthStore } from './month-store';

@Component({
  selector: 'app-month-nav',
  host: { role: 'navigation', 'aria-label': 'Cambiar de mes' },
  template: `
    <button
      type="button"
      class="arrow previous"
      [attr.aria-label]="'Mes anterior: ' + previousName()"
      (click)="store.previous()"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span class="hint" aria-hidden="true">{{ previousName() }}</span>
    </button>
    <button
      type="button"
      class="arrow next"
      [attr.aria-label]="'Mes siguiente: ' + nextName()"
      (click)="store.next()"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 18l6-6-6-6" />
      </svg>
      <span class="hint" aria-hidden="true">{{ nextName() }}</span>
    </button>
  `,
  styles: `
    .arrow {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      width: 48px;
      height: 48px;
      border-radius: var(--fx-radius-pill);
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(15, 15, 18, 0.72);
      color: var(--fx-text-2);
      display: grid;
      place-items: center;
      transition:
        background var(--fx-duration-fast) ease,
        border-color var(--fx-duration-fast) ease,
        color var(--fx-duration-fast) ease;
    }
    .arrow:hover {
      background: var(--fx-surface-2);
      border-color: var(--fx-border-strong);
      color: var(--fx-text-1);
    }
    .previous {
      left: 32px;
    }
    .next {
      right: 32px;
    }
    svg {
      fill: none;
      stroke: currentColor;
      stroke-width: 1.75;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .hint {
      position: absolute;
      top: 58px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      color: var(--fx-text-3);
      white-space: nowrap;
      opacity: 0;
      transition: opacity var(--fx-duration-fast) ease;
    }
    .arrow:hover .hint,
    .arrow:focus-visible .hint {
      opacity: 1;
    }
    @media (max-width: 640px) {
      .arrow {
        top: auto;
        bottom: 20px;
        transform: none;
      }
    }
  `,
})
export class MonthNav {
  /** Estado del mes seleccionado. */
  protected readonly store = inject(MonthStore);

  /** Nombre del mes anterior al seleccionado. */
  protected readonly previousName = computed(() => monthName(this.store.previousYearMonth()));
  /** Nombre del mes siguiente al seleccionado. */
  protected readonly nextName = computed(() => monthName(this.store.nextYearMonth()));
}
