import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar';
import { PublicacionesService } from '../../services/publicaciones';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './publicaciones.html'
})
export class PublicacionesComponent implements OnInit {
  private publicacionesService = inject(PublicacionesService);
  private authService = inject(AuthService);

  feed: any[] = [];
  nuevoPostTexto = '';
  usuarioLogueado: any = null;
  publicando = false;
  cargandoFeed = true;

  ngOnInit() {
    this.usuarioLogueado = this.authService.obtenerUsuarioActual();
    this.cargarPublicaciones();
  }

  cargarPublicaciones() {
    this.cargandoFeed = true;
    
    this.publicacionesService.obtenerFeed().subscribe({
      next: (producido) => {
        this.feed = producido;
        this.cargandoFeed = false;
      },
      error: (err) => {
        console.error('Error al solicitar el feed:', err);
        this.cargandoFeed = false;
      }
    });
  }

  realizarPosteo() {
    if (!this.nuevoPostTexto || this.nuevoPostTexto.trim().length === 0) {
      return;
    }

    this.publicando = true;

    const payload = {
      texto: this.nuevoPostTexto.trim(),
      autorId: this.usuarioLogueado?._id || 'anonimo',
      autorNombre: `${this.usuarioLogueado?.nombre} ${this.usuarioLogueado?.apellido}`,
      autorUsuario: this.usuarioLogueado?.nombreUsuario || 'anonimo',
      autorImagen: this.usuarioLogueado?.imagenPerfil || ''
    };

    this.publicacionesService.publicar(payload).subscribe({
      next: () => {
        this.nuevoPostTexto = ''; 
        this.publicando = false;  
        this.cargarPublicaciones(); 
      },
      error: (err) => {
        console.error('Error al intentar guardar:', err);
        this.publicando = false;
      }
    });
  }
}