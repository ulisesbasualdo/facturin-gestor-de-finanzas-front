import { Service, signal } from '@angular/core';

/** Tiempo que una tostada de éxito queda visible, en milisegundos. */
const SUCCESS_DURATION_MS = 5000;

/** Mensaje breve que informa el resultado de una acción. */
export interface Toast {
  /** Identificador único. */
  id: number;
  /** Texto a mostrar. */
  message: string;
  /** Tipo: confirmación (`success`) o problema (`error`). */
  kind: 'success' | 'error';
}

@Service()
export class Toaster {
  /** Próximo identificador a asignar. */
  private nextId = 1;
  /** Tostadas visibles, modificables solo desde este servicio. */
  private readonly visible = signal<Toast[]>([]);
  /** Tostadas visibles, de la más vieja a la más nueva. */
  readonly toasts = this.visible.asReadonly();

  /** Muestra una confirmación que desaparece sola. */
  success(message: string): void {
    const id = this.show(message, 'success');
    setTimeout(() => this.dismiss(id), SUCCESS_DURATION_MS);
  }

  /** Muestra un error que queda visible hasta que el usuario lo cierre. */
  error(message: string): void {
    this.show(message, 'error');
  }

  /** Quita una tostada. */
  dismiss(id: number): void {
    this.visible.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  /** Agrega una tostada y devuelve su identificador. */
  private show(message: string, kind: Toast['kind']): number {
    const id = this.nextId++;
    this.visible.update((toasts) => [...toasts, { id, message, kind }]);
    return id;
  }
}
