import { Component, inject } from '@angular/core';
import { formatLongDate } from '../month/calendar';
import { MonthStore } from '../month/month-store';

@Component({
  selector: 'app-top-bar',
  template: `
    <header class="bar">
      <div class="brand">
        <span class="logo" aria-hidden="true">F</span>
        <span class="name">Facturín</span>
      </div>
      <div class="actions">
        <span class="today">{{ todayLabel }}</span>
        @if (!store.isCurrent()) {
          <button type="button" class="today-button" (click)="store.goToToday()">Volver a hoy</button>
        }
      </div>
    </header>
  `,
  styles: `
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      min-height: 32px;
    }
    .brand,
    .actions {
      display: flex;
      align-items: center;
    }
    .brand {
      gap: 10px;
    }
    .actions {
      gap: 12px;
    }
    .logo {
      width: 28px;
      height: 28px;
      border-radius: var(--fx-radius-sm);
      background: linear-gradient(180deg, #2a2a31, #141418);
      border: 1px solid var(--fx-border);
      display: grid;
      place-items: center;
      font-size: 14px;
      font-weight: 600;
    }
    .name {
      font-size: 15px;
      font-weight: 500;
      letter-spacing: -0.01em;
    }
    .today {
      font-size: 13px;
      color: var(--fx-text-3);
    }
    .today-button {
      height: 32px;
      padding: 0 14px;
      border-radius: var(--fx-radius-pill);
      border: 1px solid var(--fx-border);
      font-size: 13px;
      font-weight: 500;
      transition: background var(--fx-duration-fast) ease;
    }
    .today-button:hover {
      background: rgba(255, 255, 255, 0.06);
    }
  `,
})
export class TopBar {
  /** Estado del mes seleccionado. */
  protected readonly store = inject(MonthStore);
  /** Fecha de hoy en texto largo (`Miércoles 7 de octubre de 2026`). */
  protected readonly todayLabel = formatLongDate(this.store.today);
}
