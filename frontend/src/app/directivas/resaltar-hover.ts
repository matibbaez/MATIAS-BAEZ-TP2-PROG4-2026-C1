import { Directive, ElementRef, HostListener, Renderer2, inject } from '@angular/core';

@Directive({ selector: '[appResaltarHover]', standalone: true })
export class ResaltarHoverDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @HostListener('mouseenter') alEntrar() {
    this.renderer.addClass(this.el.nativeElement, 'border-blue-500/80');
    this.renderer.addClass(this.el.nativeElement, 'shadow-lg');
    this.renderer.addClass(this.el.nativeElement, 'shadow-blue-500/10');
  }

  @HostListener('mouseleave') alSalir() {
    this.renderer.removeClass(this.el.nativeElement, 'border-blue-500/80');
    this.renderer.removeClass(this.el.nativeElement, 'shadow-lg');
    this.renderer.removeClass(this.el.nativeElement, 'shadow-blue-500/10');
  }
}