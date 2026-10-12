import { DOCUMENT } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, fromEvent, tap, throttleTime } from 'rxjs';
import { MonthStore } from '../month/month-store';
import { CLICK_THROTTLE_MS, ThrottledClick } from '../shared/throttled-click';
import { UndoStack } from '../shared/undo-stack';
import { ItemGroup } from './item-group';

/** Indica si el evento es `Ctrl+Z` (o `Cmd+Z`) fuera de un campo de texto, que tiene su propio deshacer. */
function isUndoShortcut(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  const inTextField = target?.closest('input, textarea, [contenteditable="true"]') != null;
  return (
    (event.ctrlKey || event.metaKey) &&
    !event.shiftKey &&
    event.key.toLowerCase() === 'z' &&
    !inTextField
  );
}

@Component({
  selector: 'app-item-list',
  imports: [ItemGroup, ThrottledClick],
  template: `
    <div class="heading">
      <h2>Movimientos</h2>
      @if (undoStack.canUndo()) {
        <button
          type="button"
          class="undo"
          [attr.aria-label]="'Deshacer: ' + undoStack.nextDescription()"
          [title]="'Deshacer: ' + undoStack.nextDescription() + ' (Ctrl+Z)'"
          appThrottledClick
          (throttledClick)="undoStack.undo()"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 14L4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
          </svg>
          Deshacer
        </button>
      }
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
      gap: 16px;
      min-height: 32px;
    }
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    .undo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 32px;
      padding: 0 14px 0 12px;
      border-radius: var(--fx-radius-pill);
      border: 1px solid var(--fx-border);
      font-size: 13px;
      font-weight: 500;
      transition: background var(--fx-duration-fast) ease;
    }
    .undo:hover {
      background: rgba(255, 255, 255, 0.06);
    }
    svg {
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
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
  /** Acciones que se pueden deshacer. */
  protected readonly undoStack = inject(UndoStack);

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
  /** Movimientos que son ingresos. */
  protected readonly incomes = computed(() => this.items.value().filter((item) => item.isGain));
  /** Movimientos que son gastos. */
  protected readonly expenses = computed(() => this.items.value().filter((item) => !item.isGain));

  constructor() {
    fromEvent<KeyboardEvent>(inject(DOCUMENT), 'keydown')
      .pipe(
        filter(isUndoShortcut),
        tap((event) => event.preventDefault()),
        throttleTime(CLICK_THROTTLE_MS),
        takeUntilDestroyed(),
      )
      .subscribe(() => void this.undoStack.undo());
  }
}
