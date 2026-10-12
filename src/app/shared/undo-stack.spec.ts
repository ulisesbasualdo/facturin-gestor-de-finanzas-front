import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MonthStatus } from '../month/month-status';
import { MonthStore } from '../month/month-store';
import { Toaster } from './toaster';
import { UNDO_LIMIT, UndoableAction, UndoStack } from './undo-stack';

/** Doble de prueba de `MonthStore` con solo lo que usa la pila de deshacer. */
function createFakeMonthStore() {
  const leaveTasks: (() => Promise<unknown>)[] = [];
  return {
    status: signal<MonthStatus | undefined>('open'),
    onLeave: (task: () => Promise<unknown>) => void leaveTasks.push(task),
    refresh: vi.fn(),
    leave: () => Promise.all(leaveTasks.map((task) => task())),
  };
}

describe('UndoStack', () => {
  let stack: UndoStack;
  let store: ReturnType<typeof createFakeMonthStore>;
  let toaster: Toaster;

  beforeEach(() => {
    store = createFakeMonthStore();
    TestBed.configureTestingModule({ providers: [{ provide: MonthStore, useValue: store }] });
    stack = TestBed.inject(UndoStack);
    toaster = TestBed.inject(Toaster);
  });

  /** Crea una acción que registra en `log` cuando se deshace. */
  function action(name: string, log: string[]): UndoableAction {
    return { description: name, undo: () => of(log.push(name)) };
  }

  it('deshace en orden inverso: la última acción primero', async () => {
    const log: string[] = [];
    stack.push(action('a', log));
    stack.push(action('b', log));
    stack.push(action('c', log));

    await stack.undo();
    await stack.undo();
    await stack.undo();

    expect(log).toEqual(['c', 'b', 'a']);
    expect(stack.canUndo()).toBe(false);
  });

  it(`guarda como máximo ${UNDO_LIMIT} acciones y descarta las más viejas`, async () => {
    const log: string[] = [];
    ['a', 'b', 'c', 'd'].forEach((name) => stack.push(action(name, log)));

    for (let i = 0; i < UNDO_LIMIT + 1; i++) await stack.undo();

    expect(log).toEqual(['d', 'c', 'b']);
  });

  it('no hace nada si no hay acciones', async () => {
    await expect(stack.undo()).resolves.toBeUndefined();
    expect(toaster.toasts()).toEqual([]);
  });

  it('dos deshacer seguidos revierten dos acciones distintas, nunca la misma dos veces', async () => {
    const log: string[] = [];
    stack.push(action('a', log));
    stack.push(action('b', log));

    await Promise.all([stack.undo(), stack.undo()]);

    expect(log).toEqual(['b', 'a']);
  });

  it('avisa y recarga el mes al deshacer', async () => {
    stack.push(action('eliminar «Alquiler»', []));

    await stack.undo();

    expect(toaster.toasts()[0]).toMatchObject({
      kind: 'success',
      message: 'Deshiciste: eliminar «Alquiler».',
    });
    expect(store.refresh).toHaveBeenCalledOnce();
  });

  it('si deshacer falla, la acción vuelve a la pila y se avisa el error', async () => {
    const failing: UndoableAction = {
      description: 'eliminar «Alquiler»',
      undo: () => throwError(() => new HttpErrorResponse({ status: 500 })),
    };
    stack.push(failing);

    await stack.undo();

    expect(stack.canUndo()).toBe(true);
    expect(stack.nextDescription()).toBe('eliminar «Alquiler»');
    expect(toaster.toasts()[0]).toMatchObject({
      kind: 'error',
      message: 'No pudimos deshacer la acción.',
    });
  });

  it('se vacía al dejar el mes', async () => {
    stack.push(action('a', []));

    await store.leave();

    expect(stack.canUndo()).toBe(false);
  });

  it('se vacía cuando el mes queda cerrado', () => {
    stack.push(action('a', []));

    store.status.set('closed');
    TestBed.tick();

    expect(stack.canUndo()).toBe(false);
  });
});
