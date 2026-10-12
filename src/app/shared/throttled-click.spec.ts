import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CLICK_THROTTLE_MS, ThrottledClick } from './throttled-click';

@Component({
  imports: [ThrottledClick],
  template: `<button type="button" appThrottledClick (throttledClick)="clicks = clicks + 1">x</button>`,
})
class Host {
  /** Cantidad de clicks que llegaron al componente. */
  clicks = 0;
}

describe('ThrottledClick', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('ignora los clicks repetidos durante el intervalo', () => {
    const fixture = TestBed.createComponent(Host);
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;

    button.click();
    button.click();
    button.click();
    expect(fixture.componentInstance.clicks).toBe(1);

    vi.advanceTimersByTime(CLICK_THROTTLE_MS);
    button.click();
    expect(fixture.componentInstance.clicks).toBe(2);
  });
});
