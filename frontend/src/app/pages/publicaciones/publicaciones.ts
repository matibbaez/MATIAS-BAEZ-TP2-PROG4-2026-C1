import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar';
import { PublicacionCardComponent } from '../../components/publicacion-card/publicacion-card'; 
import { PublicacionesService } from '../../services/publicaciones';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, PublicacionCardComponent],
  templateUrl: './publicaciones.html'
})
export class PublicacionesComponent implements OnInit {
  private publicacionesService = inject(PublicacionesService);
  private authService = inject(AuthService);

  feed: any[] = [];
  usuarioLogueado: any = null;
  publicando = false;
  cargandoFeed = true;
  mensajeError = '';

  nuevoTitulo = '';
  nuevaDescripcion = '';
  archivoSeleccionado: File | null = null;
  previewUrl: string | null = null;

  ordenActual: 'fecha' | 'likes' = 'fecha';
  limit = 5; 
  paginaActual = 0;

  ngOnInit() {
    this.usuarioLogueado = this.authService.obtenerUsuarioActual();
    this.cargarPublicaciones();
  }

  cargarPublicaciones() {
    this.cargandoFeed = true;
    const offset = this.paginaActual * this.limit;

    this.publicacionesService.obtenerFeed(this.ordenActual, this.limit, offset).subscribe({
      next: (data) => {
        this.feed = data;
        this.cargandoFeed = false;
      },
      error: (err) => {
        console.error('Error al cargar feed:', err);
        this.cargandoFeed = false;
      }
    });
  }

  alCambiarOrden() {
    this.paginaActual = 0; 
    this.cargarPublicaciones();
  }

  paginaSiguiente() {
    this.paginaActual++;
    this.cargarPublicaciones();
  }

  paginaAnterior() {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.cargarPublicaciones();
    }
  }

  seleccionarImagen(event: any) {
    const archivo = event.target.files[0];
    this.mensajeError = ''; 

    if (archivo && archivo.type.startsWith('image/')) {
      this.archivoSeleccionado = archivo;
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result as string;
      reader.readAsDataURL(archivo);
    } else {
      this.archivoSeleccionado = null;
      this.previewUrl = null;
      
      this.mensajeError = 'Formato no soportado: Solo se permiten imágenes (PNG, JPG, WEBP).';
      
      setTimeout(() => this.mensajeError = '', 4000);
    }
  }

  realizarPosteo() {
    if (!this.nuevoTitulo.trim() || !this.nuevaDescripcion.trim()) return;

    this.publicando = true;
    const formData = new FormData();
    formData.append('titulo', this.nuevoTitulo.trim());
    formData.append('descripcion', this.nuevaDescripcion.trim());
    formData.append('autorId', this.usuarioLogueado?._id || 'anonimo');
    formData.append('autorNombre', `${this.usuarioLogueado?.nombre} ${this.usuarioLogueado?.apellido}`);
    formData.append('autorUsuario', this.usuarioLogueado?.nombreUsuario || 'anonimo');
    formData.append('autorImagen', this.usuarioLogueado?.imagenPerfil || '');

    if (this.archivoSeleccionado) {
      formData.append('file', this.archivoSeleccionado);
    }

    this.publicacionesService.publicar(formData).subscribe({
      next: () => {
        this.nuevoTitulo = '';
        this.nuevaDescripcion = '';
        this.archivoSeleccionado = null;
        this.previewUrl = null;
        this.publicando = false;
        this.paginaActual = 0; 
        this.cargarPublicaciones();
      },
      error: () => this.publicando = false
    });
  }

  onToggleLike(postId: string) {
    const miId = this.usuarioLogueado?._id;
    if (!miId) return;

    const post = this.feed.find(p => p._id === postId);
    if (!post) return;

    const yaDiLike = post.likes.includes(miId);

    if (yaDiLike) {
      post.likes = post.likes.filter((id: string) => id !== miId);
      this.publicacionesService.quitarLike(postId, miId).subscribe();
    } else {
      post.likes.push(miId);
      this.publicacionesService.darLike(postId, miId).subscribe();
    }
  }

  onEliminarPost(postId: string) {
    const miId = this.usuarioLogueado?._id;
    const miRol = this.usuarioLogueado?.perfil || 'usuario';
    if (!miId) return;

    this.feed = this.feed.filter(p => p._id !== postId);

    this.publicacionesService.eliminar(postId, miId, miRol).subscribe({
      error: () => this.cargarPublicaciones() 
    });
  }
}