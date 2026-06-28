import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { PublicacionesService } from '../../services/publicaciones';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-detalle-publicacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './detalle-publicacion.html'
})
export class DetallePublicacionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pubService = inject(PublicacionesService);
  private authService = inject(AuthService);

  post: any = null;
  usuarioLogueado: any = null;
  cargando = true;
  error = '';
  errorComentario = '';
  limiteComentarios = 5; 
  textoComentario = '';
  enviandoComentario = false;
  modoEdicion = false;
  textoEdicion = '';
  guardandoEdicion = false;

  ngOnInit() {
    this.usuarioLogueado = this.authService.obtenerUsuarioActual();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPublicacion(id);
    }
  }

  cargarPublicacion(id: string) {
    this.cargando = true;
    this.pubService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.post = data;
        this.aplicarOrdenamientoComentarios();
        this.cargando = false;
      },
      error: () => {
        this.error = 'La publicación no existe o fue eliminada.';
        this.cargando = false;
      }
    });
  }

  private aplicarOrdenamientoComentarios() {
    if (!this.post?.comentarios) return;
    this.post.comentarios.sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA; 
    });
  }

  get comentariosRenderizados() {
    if (!this.post?.comentarios) return [];
    return this.post.comentarios.slice(0, this.limiteComentarios);
  }

  cargarMasComentarios() {
    this.limiteComentarios += 5; 
  }

  enviarComentario() {
    const textoLimpiado = this.textoComentario.trim();

    if (!textoLimpiado || !this.post) return;

    if (textoLimpiado.length > 300) {
      this.errorComentario = 'El comentario no puede superar los 300 caracteres.';
      return;
    }

    this.enviandoComentario = true;
    this.errorComentario = ''; 

    const payload = {
      autorId: this.usuarioLogueado?._id || 'anonimo',
      autorNombre: `${this.usuarioLogueado?.nombre} ${this.usuarioLogueado?.apellido}`,
      autorUsuario: this.usuarioLogueado?.nombreUsuario || 'anonimo',
      autorImagen: this.usuarioLogueado?.imagenPerfil || '',
      texto: textoLimpiado
    };

    this.pubService.agregarComentario(this.post._id, payload).subscribe({
      next: (postActualizado) => {
        this.post = postActualizado;
        this.aplicarOrdenamientoComentarios();
        this.textoComentario = '';
        this.enviandoComentario = false;
      },
      error: (err) => {
        this.enviandoComentario = false;
        this.errorComentario = err.error?.message || 'No se pudo publicar el comentario.';
        setTimeout(() => this.errorComentario = '', 4500);
      }
    });
  }

  activarEdicion() {
    this.modoEdicion = true;
    this.textoEdicion = this.post.descripcion;
  }

  cancelarEdicion() {
    this.modoEdicion = false;
  }

  guardarEdicion() {
    if (!this.textoEdicion.trim() || !this.post) return;

    this.guardandoEdicion = true;
    this.pubService.editarPublicacion(this.post._id, this.usuarioLogueado._id, this.textoEdicion.trim()).subscribe({
      next: (postModificado) => {
        this.post = postModificado;
        this.modoEdicion = false;
        this.guardandoEdicion = false;
      },
      error: () => this.guardandoEdicion = false
    });
  }
}