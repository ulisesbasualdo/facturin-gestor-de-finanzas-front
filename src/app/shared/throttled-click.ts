import { Directive, ElementRef, inject } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { fromEvent, throttleTime } from 'rxjs';

/** Tiempo durante el cual se ignoran los clicks repetidos, en milisegundos. */
export const CLICK_THROTTLE_MS = 1000;

@Directive({ selector: '[appThrottledClick]' })
export class ThrottledClick {
  /** Se emite con el primer click e ignora los siguientes durante `CLICK_THROTTLE_MS`. */
  readonly throttledClick = outputFromObservable(
    fromEvent<MouseEvent>(inject(ElementRef).nativeElement, 'click').pipe(
      throttleTime(CLICK_THROTTLE_MS),
    ),
  );
}
