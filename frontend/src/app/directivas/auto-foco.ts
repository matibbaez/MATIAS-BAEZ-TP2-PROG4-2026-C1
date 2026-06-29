import { Directive, ElementRef, AfterViewInit, inject } from '@angular/core';

@Directive({ selector: '[appAutoFoco]', standalone: true })
export class AutoFocoDirective implements AfterViewInit {
  private el = inject(ElementRef);

  ngAfterViewInit() {
    setTimeout(() => this.el.nativeElement.focus(), 150);
  }
}