import { Component, computed, inject } from '@angular/core';
import { MonthStore } from '../month/month-store';
import { ItemGroup } from './item-group';

@Component({
  selector: 'app-item-list',
  imports: [ItemGroup],
  template: `
    <h2>Movimientos</h2>
    @if (items.error()) {
      <p class="status" role="alert">No pudimos cargar los movimientos de este mes.</p>
    } @else if (items.isLoading()) {
      <p class="status">Cargando movimientos…</p>
    } @else {
      <app-item-group kind="income" [items]="incomes()" />
      <app-item-group kind="expense" [items]="expenses()" />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.02em;
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
    '[attr.aria-busy]': 'items.isLoading()',
  },
})
export class ItemList {
  /** Estado del mes seleccionado. */
  private readonly store = inject(MonthStore);

  /** Recurso HTTP con los movimientos del mes seleccionado. */
  protected readonly items = this.store.items;
  /** Movimientos que son ingresos. */
  protected readonly incomes = computed(() => this.items.value().filter((item) => item.isGain));
  /** Movimientos que son gastos. */
  protected readonly expenses = computed(() => this.items.value().filter((item) => !item.isGain));
}
