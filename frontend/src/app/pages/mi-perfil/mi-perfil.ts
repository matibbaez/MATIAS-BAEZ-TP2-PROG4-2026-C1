import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';
import { PublicacionCardComponent } from '../../components/publicacion-card/publicacion-card'; 
import { AuthService } from '../../services/auth';
import { PublicacionesService } from '../../services/publicaciones';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, NavbarComponent, PublicacionCardComponent],
  templateUrl: './mi-perfil.html'
})
export class MiPerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);

  usuario: any = null;
  misUltimosPosteos: any[] = [];
  cargando = true;

  ngOnInit() {
    this.usuario = this.authService.obtenerUsuarioActual();
    this.cargarMisPublicaciones();
  }

  cargarMisPublicaciones() {
    if (!this.usuario?.nombreUsuario) {
      this.cargando = false;
      return;
    }

    this.publicacionesService.obtenerFeed('fecha', 3, 0, this.usuario.nombreUsuario)
      .subscribe({
        next: (data) => {
          this.misUltimosPosteos = data;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al solicitar posteos del perfil:', err);
          this.cargando = false;
        }
      });
  }

  onToggleLike(postId: string) {
    const miId = this.usuario?._id;
    if (!miId) return;

    const post = this.misUltimosPosteos.find(p => p._id === postId);
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
    const miId = this.usuario?._id;
    const miRol = this.usuario?.perfil || 'usuario';
    if (!miId) return;

    this.misUltimosPosteos = this.misUltimosPosteos.filter(p => p._id !== postId);
    this.publicacionesService.eliminar(postId, miId, miRol).subscribe({
      error: () => this.cargarMisPublicaciones()
    });
  }
}