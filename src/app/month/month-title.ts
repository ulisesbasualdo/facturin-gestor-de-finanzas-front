import { Component, computed, inject } from '@angular/core';
import { formatDayMonth, monthName, yearOf } from './calendar';
import { MonthStore } from './month-store';

@Component({
  selector: 'app-month-title',
  template: `
    <h1>
      {{ name() }} <span class="year">{{ year() }}</span>
    </h1>
    <p>{{ status() }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    h1 {
      margin: 0;
      font-size: 40px;
      line-height: 1.1;
      font-weight: 600;
      letter-spacing: -0.03em;
    }
    .year {
      color: var(--fx-text-4);
      font-weight: 400;
    }
    p {
      margin: 0;
      font-size: 14px;
      color: var(--fx-text-3);
    }
  `,
})
export class MonthTitle {
  /** Estado del mes seleccionado. */
  private readonly store = inject(MonthStore);

  /** Nombre del mes seleccionado. */
  protected readonly name = computed(() => monthName(this.store.yearMonth()));
  /** Año del mes seleccionado. */
  protected readonly year = computed(() => yearOf(this.store.yearMonth()));
  /** Texto que indica si el mes está cerrado, en curso o planeado. */
  protected readonly status = computed(() => {
    switch (this.store.timing()) {
      case 'past':
        return 'Mes cerrado';
      case 'current':
        return `Mes en curso · hoy es ${formatDayMonth(this.store.today)}`;
      case 'future':
        return 'Mes próximo · todo está planeado';
    }
  });
}
