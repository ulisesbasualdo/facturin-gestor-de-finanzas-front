import { afterNextRender, Directive, ElementRef, inject, input } from '@angular/core';
import { FocusReturn } from './_definitions';
import { ItemEditSession } from './item-edit-session';

@Directive({ selector: '[appReturnFocus]' })
export class ReturnFocus {
  /** A qué edición corresponde este elemento: la fila de un movimiento o el botón de agregar de un tipo. */
  readonly appReturnFocus = input.required<FocusReturn>();

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const session = inject(ItemEditSession);
    afterNextRender(() => {
      if (session.takeFocus(this.appReturnFocus())) element.focus();
    });
  }
}
