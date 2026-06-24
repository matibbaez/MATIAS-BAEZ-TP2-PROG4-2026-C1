import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegistroComponent } from './pages/registro/registro';
import { PublicacionesComponent } from './pages/publicaciones/publicaciones';
import { MiPerfilComponent } from './pages/mi-perfil/mi-perfil';
import { authGuard, noAuthGuard } from './guards/auth';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'registro', component: RegistroComponent, canActivate: [noAuthGuard] },

  { path: 'publicaciones', component: PublicacionesComponent, canActivate: [authGuard] },
  { path: 'mi-perfil', component: MiPerfilComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: '/login' } 
];