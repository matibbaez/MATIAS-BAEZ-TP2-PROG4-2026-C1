import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaLogueado()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estaLogueado()) {
    return true;
  }

  router.navigate(['/publicaciones']);
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuarioActual = authService.obtenerUsuarioActual();

  if (authService.estaLogueado() && usuarioActual?.perfil === 'administrador') {
    return true;
  }

  console.warn('⛔ [ADMIN GUARD]: Intento de acceso a ruta VIP por un usuario mortal.');
  router.navigate(['/publicaciones']);
  return false;
};