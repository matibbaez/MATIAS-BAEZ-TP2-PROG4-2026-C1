import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private baseUrl = 'http://localhost:3000/auth';
  // private baseUrl = 'https://matias-baez-tp2-prog4-2026-c1.onrender.com/auth';

  verificandoSesion = signal<boolean>(true);

  constructor() {
    this.validarTokenAlIniciar();
  }

  private async validarTokenAlIniciar() {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
      this.verificandoSesion.set(false);
      return;
    }

    try {
      const usuarioValido: any = await firstValueFrom(
        this.http.post(`${this.baseUrl}/autorizar`, { token })
      );

      if (usuarioValido && usuarioValido._id) {
        localStorage.setItem('red_social_sesion', JSON.stringify(usuarioValido));
        
        if (this.router.url === '/login' || this.router.url === '/') {
          this.router.navigate(['/publicaciones']);
        }
      }
    } catch (error) {
      this.cerrarSesion();
    } finally {
      this.verificandoSesion.set(false);
    }
  }

  async registrar(formData: FormData) {
    const respuesta: any = await firstValueFrom(
      this.http.post(`${this.baseUrl}/register`, formData)
    );

    if (respuesta && respuesta.token) {
      this.guardarSesionLocal(respuesta);
    }
    return respuesta.usuario || respuesta;
  }

  async login(credenciales: { loginInput: string; contrasena: string }) {
    const respuesta: any = await firstValueFrom(
      this.http.post(`${this.baseUrl}/login`, credenciales)
    );
    
    if (respuesta && respuesta.token) {
      this.guardarSesionLocal(respuesta);
    }
    return respuesta.usuario || respuesta;
  }

  private guardarSesionLocal(respuesta: { usuario: any; token: string }) {
    localStorage.setItem('red_social_sesion', JSON.stringify(respuesta.usuario));
    localStorage.setItem('jwt_token', respuesta.token); 
  }

  obtenerUsuarioActual() {
    const data = localStorage.getItem('red_social_sesion');
    return data ? JSON.parse(data) : null;
  }

  obtenerToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  estaLogueado(): boolean {
    return localStorage.getItem('red_social_sesion') !== null && localStorage.getItem('jwt_token') !== null;
  }

  cerrarSesion() {
    localStorage.removeItem('red_social_sesion');
    localStorage.removeItem('jwt_token');
    this.router.navigate(['/login']);
  }
}