import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-publicacion-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publicacion-card.html'
})
export class PublicacionCardComponent {
  @Input({ required: true }) post!: any;
  @Input({ required: true }) miUsuarioId!: string;
  @Input() miRol: string = 'usuario';

  @Output() toggleLike = new EventEmitter<string>();
  @Output() eliminar = new EventEmitter<string>();

  mostrarModalBorrar = false;

  get diLike(): boolean {
    if (!this.post?.likes || !this.miUsuarioId) return false;
    return this.post.likes.includes(this.miUsuarioId);
  }

  onLikeClick() {
    this.toggleLike.emit(this.post._id);
  }

  abrirModalEliminar() {
    this.mostrarModalBorrar = true;
  }

  cancelarEliminacion() {
    this.mostrarModalBorrar = false;
  }

  confirmarEliminacion() {
    this.eliminar.emit(this.post._id);
    this.mostrarModalBorrar = false; 
  }
}