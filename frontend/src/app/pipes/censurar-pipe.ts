import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'censurar', standalone: true })
export class CensurarPipe implements PipeTransform {
  private malasPalabras = ['boludo', 'pelotudo', 'idiota', 'estupido', 'mierda'];

  transform(texto: string): string {
    if (!texto) return '';
    let textoLimpio = texto;

    this.malasPalabras.forEach(insulto => {
      const regex = new RegExp(insulto, 'gi');
      textoLimpio = textoLimpio.replace(regex, '***');
    });

    return textoLimpio;
  }
}