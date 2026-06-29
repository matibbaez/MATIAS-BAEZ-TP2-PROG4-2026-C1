import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { ImagenFallidaDirective } from '../../directivas/imagen-fallida';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ImagenFallidaDirective],
  templateUrl: './navbar.html'
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = this.authService.obtenerUsuarioActual();
  mostrarModalLogout = false; 

  abrirModal() {
    this.mostrarModalLogout = true;
  }

  cancelar() {
    this.mostrarModalLogout = false;
  }

  confirmarLogout() {
    this.mostrarModalLogout = false;
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}