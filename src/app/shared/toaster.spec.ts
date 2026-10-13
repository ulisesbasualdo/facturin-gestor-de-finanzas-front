import { TestBed } from '@angular/core/testing';
import { SUCCESS_DURATION_MS, Toaster } from './toaster';

describe('Toaster', () => {
  let toaster: Toaster;

  beforeEach(() => {
    vi.useFakeTimers();
    toaster = TestBed.inject(Toaster);
  });

  afterEach(() => vi.useRealTimers());

  /** Mensajes de las tostadas visibles. */
  function messages(): string[] {
    return toaster.toasts().map((toast) => toast.message);
  }

  it('las confirmaciones sin botón desaparecen solas', () => {
    toaster.success('Duplicaste «Alquiler».');

    vi.advanceTimersByTime(SUCCESS_DURATION_MS - 1);
    expect(messages()).toEqual(['Duplicaste «Alquiler».']);

    vi.advanceTimersByTime(1);
    expect(messages()).toEqual([]);
  });

  it('las confirmaciones con botón quedan fijas hasta cerrarlas', () => {
    toaster.successWithAction('Eliminaste «Alquiler».', { label: 'Deshacer', run: vi.fn() });

    vi.advanceTimersByTime(60 * 60 * 1000);
    expect(messages()).toEqual(['Eliminaste «Alquiler».']);

    toaster.dismiss(toaster.toasts()[0].id);
    expect(messages()).toEqual([]);
  });

  it('los errores quedan fijos hasta cerrarlos', () => {
    toaster.error('No pudimos eliminar el movimiento.');

    vi.advanceTimersByTime(60 * 60 * 1000);
    expect(messages()).toEqual(['No pudimos eliminar el movimiento.']);
  });

  it('al usar el botón ejecuta la acción y quita la tostada', () => {
    const run = vi.fn();
    toaster.successWithAction('Eliminaste «Alquiler».', { label: 'Deshacer', run });

    toaster.runAction(toaster.toasts()[0]);

    expect(run).toHaveBeenCalledOnce();
    expect(messages()).toEqual([]);
  });

  it('al cambiar de mes quita solo las tostadas con botón', () => {
    toaster.successWithAction('Eliminaste «Alquiler».', { label: 'Deshacer', run: vi.fn() });
    toaster.success('Duplicaste «Luz».');
    toaster.error('No pudimos duplicar el movimiento.');

    toaster.dismissActions();

    expect(messages()).toEqual(['Duplicaste «Luz».', 'No pudimos duplicar el movimiento.']);
  });
});
