import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // private baseUrl = 'http://localhost:3000/usuarios';
  private baseUrl = 'https://matias-baez-tp2-prog4-2026-c1.onrender.com/usuarios';

  private obtenerHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken() || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, { headers: this.obtenerHeaders() });
  }

  crearUsuarioAdmin(datos: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, datos, { headers: this.obtenerHeaders() });
  }

  deshabilitar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`, { headers: this.obtenerHeaders() });
  }

  rehabilitar(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/rehabilitar`, {}, { headers: this.obtenerHeaders() });
  }
  
  actualizarAvatar(id: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', archivo);
    return this.http.patch<any>(`${this.baseUrl}/${id}/avatar`, formData, { headers: this.obtenerHeaders() });
  }
}