import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegistroComponent } from './pages/registro/registro';
import { PublicacionesComponent } from './pages/publicaciones/publicaciones';
import { MiPerfilComponent } from './pages/mi-perfil/mi-perfil';
import { DetallePublicacionComponent } from './pages/detalle-publicacion/detalle-publicacion'; 
import { DashboardUsuariosComponent } from './pages/dashboard-usuarios/dashboard-usuarios'; // <-- NUEVO IMPORT
import { authGuard, noAuthGuard, adminGuard } from './guards/auth'; // <-- AGREGAMOS adminGuard

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'registro', component: RegistroComponent, canActivate: [noAuthGuard] },

  { path: 'publicaciones', component: PublicacionesComponent, canActivate: [authGuard] },
  { path: 'mi-perfil', component: MiPerfilComponent, canActivate: [authGuard] },
  { path: 'publicacion/:id', component: DetallePublicacionComponent, canActivate: [authGuard] },

  { path: 'dashboard/usuarios', component: DashboardUsuariosComponent, canActivate: [authGuard, adminGuard] },

  { path: '**', redirectTo: '/login' } 
];