import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'recortar', standalone: true })
export class RecortarPipe implements PipeTransform {
  transform(texto: string, limite: number = 80): string {
    if (!texto) return '';
    return texto.length > limite ? `${texto.substring(0, limite)}...` : texto;
  }
}