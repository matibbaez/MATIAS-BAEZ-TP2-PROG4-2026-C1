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
  
  // private baseUrl = 'http://localhost:3000/auth';
  private baseUrl = 'https://matias-baez-tp2-prog4-2026-c1.onrender.com/auth';

  verificandoSesion = signal<boolean>(true);
  mostrarModalSesion = signal<boolean>(false);
  
  private temporizadorSesion: any;
  private temporizadorVerdugo: any; 

  private readonly TIEMPO_HASTA_AVISO_MS = 600000; 
  private readonly TIEMPO_DE_GRACIA_MS = 300000;   

  constructor() {
    this.validarTokenAlIniciar();
  }

  private iniciarCronómetroSesion() {
    this.detenerTodosLosRelojes(); 

    this.temporizadorSesion = setTimeout(() => {
      console.log('⏰ [SESIÓN] Pasaron 10 minutos. Activando aviso y reloj de muerte...');
      this.mostrarModalSesion.set(true);

      this.temporizadorVerdugo = setTimeout(() => {
        console.log('💀 [SESIÓN] El usuario ignoró el cartel 5 minutos. Ejecutando auto-expulsión...');
        this.cerrarSesion();
      }, this.TIEMPO_DE_GRACIA_MS);

    }, this.TIEMPO_HASTA_AVISO_MS);
  }

  private detenerTodosLosRelojes() {
    if (this.temporizadorSesion) clearTimeout(this.temporizadorSesion);
    if (this.temporizadorVerdugo) clearTimeout(this.temporizadorVerdugo);
  }

  async extenderSesion() {
    this.detenerTodosLosRelojes(); 

    const token = this.obtenerToken();
    if (!token) {
      this.cerrarSesion();
      return;
    }

    try {
      const respuesta: any = await firstValueFrom(
        this.http.post(`${this.baseUrl}/refrescar`, { token })
      );

      if (respuesta && respuesta.token) {
        console.log('🔄 [SESIÓN] Token renovado. Salvado por la campana.');
        localStorage.setItem('jwt_token', respuesta.token);
        this.mostrarModalSesion.set(false); 
        this.iniciarCronómetroSesion();
      }
    } catch {
      console.log('❌ [SESIÓN] El token ya estaba muerto en el back. Cerrando...');
      this.cerrarSesion();
    }
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
        this.iniciarCronómetroSesion(); 

        if (this.router.url === '/login' || this.router.url === '/') {
          this.router.navigate(['/publicaciones']);
        }
      }
    } catch {
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

  async login(credenciales: any) {
    const payloadBackend = {
      loginInput: credenciales.loginInput || credenciales.correo || credenciales.email || credenciales.usuario,
      contrasena: credenciales.contrasena || credenciales.password || credenciales.clave
    };

    const respuesta: any = await firstValueFrom(
      this.http.post(`${this.baseUrl}/login`, payloadBackend)
    );
    
    if (respuesta && respuesta.token) {
      this.guardarSesionLocal(respuesta);
    }
    return respuesta.usuario || respuesta;
  }

  private guardarSesionLocal(respuesta: { usuario: any; token: string }) {
    localStorage.setItem('red_social_sesion', JSON.stringify(respuesta.usuario));
    localStorage.setItem('jwt_token', respuesta.token);
    this.iniciarCronómetroSesion();
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
    this.detenerTodosLosRelojes(); 
    this.mostrarModalSesion.set(false);
    localStorage.removeItem('red_social_sesion');
    localStorage.removeItem('jwt_token');
    this.router.navigate(['/login']);
  }
}