import { Component, computed, inject } from '@angular/core';
import { ThrottledClick } from './throttled-click';
import { Toaster } from './toaster';

@Component({
  selector: 'app-toast-list',
  imports: [ThrottledClick],
  template: `
    <div class="live" role="status">
      @for (toast of successes(); track toast.id) {
        <div class="toast">
          <span class="message">{{ toast.message }}</span>
          @if (toast.action; as action) {
            <button
              type="button"
              class="action"
              appThrottledClick
              (throttledClick)="toaster.runAction(toast)"
            >
              {{ action.label }}
            </button>
          }
          <button type="button" class="close" aria-label="Cerrar aviso" (click)="toaster.dismiss(toast.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>
      }
    </div>
    <div class="live" role="alert">
      @for (toast of errors(); track toast.id) {
        <div class="toast error">
          <span class="message">{{ toast.message }}</span>
          <button type="button" class="close" aria-label="Cerrar aviso de error" (click)="toaster.dismiss(toast.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      position: fixed;
      left: 50%;
      bottom: 32px;
      transform: translateX(-50%);
      z-index: 20;
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: min(440px, calc(100vw - 32px));
      pointer-events: none;
    }
    .live {
      display: contents;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 8px 10px 16px;
      border-radius: 14px;
      background: var(--fx-surface-2);
      border: 1px solid var(--fx-border);
      box-shadow: 0 16px 40px -16px rgba(0, 0, 0, 0.8);
      font-size: 14px;
      line-height: 1.4;
      pointer-events: auto;
    }
    .error {
      border-color: var(--fx-danger-border);
      background: #1d1416;
    }
    .message {
      flex: 1;
      min-width: 0;
    }
    button {
      flex: none;
      height: 32px;
      border-radius: var(--fx-radius-sm);
      transition: background var(--fx-duration-fast) ease;
    }
    .action {
      padding: 0 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--fx-text-1);
    }
    .close {
      display: grid;
      place-items: center;
      width: 32px;
      color: var(--fx-text-3);
    }
    button:hover {
      background: rgba(255, 255, 255, 0.06);
      color: var(--fx-text-1);
    }
    svg {
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
    }
    @media (max-width: 640px) {
      :host {
        bottom: 84px;
      }
    }
  `,
})
export class ToastList {
  /** Servicio que guarda las tostadas visibles. */
  protected readonly toaster = inject(Toaster);

  /** Tostadas de confirmación visibles. */
  protected readonly successes = computed(() =>
    this.toaster.toasts().filter((toast) => toast.kind === 'success'),
  );
  /** Tostadas de error visibles. */
  protected readonly errors = computed(() =>
    this.toaster.toasts().filter((toast) => toast.kind === 'error'),
  );
}
