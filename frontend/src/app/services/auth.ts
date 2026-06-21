import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/auth';

  async registrar(formData: FormData) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/register`, formData)
    );
  }

  async login(credenciales: { loginInput: string; contrasena: string }) {
    const respuesta: any = await firstValueFrom(
      this.http.post(`${this.baseUrl}/login`, credenciales)
    );
    
    if (respuesta && respuesta._id) {
      localStorage.setItem('red_social_sesion', JSON.stringify(respuesta));
    }
    return respuesta;
  }

  obtenerUsuarioActual() {
    const data = localStorage.getItem('red_social_sesion');
    return data ? JSON.parse(data) : null;
  }

  estaLogueado(): boolean {
    return localStorage.getItem('red_social_sesion') !== null;
  }

  cerrarSesion() {
    localStorage.removeItem('red_social_sesion');
  }
}