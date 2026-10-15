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
