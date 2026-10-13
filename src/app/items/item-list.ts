import { Component, computed, inject } from '@angular/core';
import { MonthStore } from '../month/month-store';
import { ItemGroup } from './item-group';
import { ITEM_SORT_OPTIONS, ItemSortPreference, sortItems } from './item-sort';

@Component({
  selector: 'app-item-list',
  imports: [ItemGroup],
  template: `
    <div class="heading">
      <h2>Movimientos</h2>
      <label class="sort">
        <span>Ordenar por</span>
        <select #sortSelect (change)="sortPreference.choose(sortSelect.value)">
          @for (option of sortOptions; track option.value) {
            <option [value]="option.value" [selected]="option.value === sortPreference.sort()">
              {{ option.label }}
            </option>
          }
        </select>
      </label>
    </div>
    @if (items.error() || summary.error()) {
      <p class="status" role="alert">No pudimos cargar los movimientos de este mes.</p>
    } @else if (loadedSummary(); as totals) {
      <app-item-group
        kind="income"
        [items]="incomes()"
        [doneTotal]="totals.gained"
        [total]="totals.totalIncome"
        [editable]="editable()"
      />
      <app-item-group
        kind="expense"
        [items]="expenses()"
        [doneTotal]="totals.spent"
        [total]="totals.totalExpenses"
        [editable]="editable()"
      />
    } @else {
      <p class="status">Cargando movimientos…</p>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    .sort {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--fx-text-3);
    }
    select {
      height: 32px;
      padding: 0 10px;
      border-radius: var(--fx-radius-input);
      border: 1px solid var(--fx-border);
      background: var(--fx-surface-input);
      color: var(--fx-text-1);
      font: inherit;
      font-size: 13px;
      cursor: pointer;
    }
    .status {
      margin: 0;
      font-size: 14px;
      color: var(--fx-text-3);
    }
  `,
  host: {
    role: 'region',
    'aria-label': 'Movimientos del mes',
    '[attr.aria-busy]': 'items.isLoading() || summary.isLoading()',
  },
})
export class ItemList {
  /** Estado del mes seleccionado. */
  private readonly store = inject(MonthStore);
  /** Criterio de orden elegido por el usuario. */
  protected readonly sortPreference = inject(ItemSortPreference);
  /** Opciones del selector de orden. */
  protected readonly sortOptions = ITEM_SORT_OPTIONS;

  /** Recurso HTTP con los movimientos del mes seleccionado. */
  protected readonly items = this.store.items;
  /** Recurso HTTP con el resumen del mes seleccionado, que trae los totales de cada grupo. */
  protected readonly summary = this.store.summary;
  /** Resumen del mes, o `undefined` hasta que carguen el resumen y los movimientos del mes. */
  protected readonly loadedSummary = computed(() =>
    this.items.status() !== 'loading' && this.summary.hasValue() ? this.summary.value() : undefined,
  );
  /** Indica si los movimientos del mes se pueden modificar. */
  protected readonly editable = computed(() => {
    const status = this.store.status();
    return status === 'open' || status === 'reopened';
  });
  /** Movimientos que son ingresos, en el orden elegido. */
  protected readonly incomes = computed(() =>
    sortItems(
      this.items.value().filter((item) => item.isGain),
      this.sortPreference.sort(),
    ),
  );
  /** Movimientos que son gastos, en el orden elegido. */
  protected readonly expenses = computed(() =>
    sortItems(
      this.items.value().filter((item) => !item.isGain),
      this.sortPreference.sort(),
    ),
  );
}
