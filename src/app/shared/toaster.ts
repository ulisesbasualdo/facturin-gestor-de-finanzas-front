import { Service, signal } from '@angular/core';

/** Tiempo que una tostada de éxito sin acción queda visible, en milisegundos. */
export const SUCCESS_DURATION_MS = 5000;

/** Botón que una tostada ofrece para reaccionar al aviso (`Deshacer`). */
export interface ToastAction {
  /** Texto del botón. */
  label: string;
  /** Qué hace el botón. */
  run: () => void;
}

/** Mensaje breve que informa el resultado de una acción. */
export interface Toast {
  /** Identificador único. */
  id: number;
  /** Texto a mostrar. */
  message: string;
  /** Tipo: confirmación (`success`) o problema (`error`). */
  kind: 'success' | 'error';
  /** Botón opcional para reaccionar al aviso. */
  action?: ToastAction;
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
    const id = this.show({ message, kind: 'success' });
    setTimeout(() => this.dismiss(id), SUCCESS_DURATION_MS);
  }

  /** Muestra una confirmación con un botón, que queda fija hasta que se cierre o se cambie de mes. */
  successWithAction(message: string, action: ToastAction): void {
    this.show({ message, kind: 'success', action });
  }

  /** Muestra un error que queda visible hasta que el usuario lo cierre. */
  error(message: string): void {
    this.show({ message, kind: 'error' });
  }

  /** Ejecuta el botón de una tostada y la quita. */
  runAction(toast: Toast): void {
    this.dismiss(toast.id);
    toast.action?.run();
  }

  /** Quita una tostada. */
  dismiss(id: number): void {
    this.visible.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  /** Quita las tostadas con botón, que dejan de tener sentido al cambiar de mes. */
  dismissActions(): void {
    this.visible.update((toasts) => toasts.filter((toast) => !toast.action));
  }

  /** Agrega una tostada y devuelve su identificador. */
  private show(toast: Omit<Toast, 'id'>): number {
    const id = this.nextId++;
    this.visible.update((toasts) => [...toasts, { ...toast, id }]);
    return id;
  }
}
