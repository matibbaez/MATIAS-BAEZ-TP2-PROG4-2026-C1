import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'hashtag', standalone: true })
export class HashtagPipe implements PipeTransform {
  transform(palabra: string): string {
    if (!palabra) return '';
    return `#${palabra.trim().replace(/\s+/g, '').toLowerCase()}`;
  }
}