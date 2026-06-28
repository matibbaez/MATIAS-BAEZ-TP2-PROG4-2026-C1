import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private baseUrl = 'http://localhost:3000/estadisticas';
  // private baseUrl = 'https://matias-baez-tp2-prog4-2026-c1.onrender.com/estadisticas';

  private obtenerHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${this.authService.obtenerToken() || ''}`);
  }

  private armarParametros(inicio?: string, fin?: string): HttpParams {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fin) params = params.set('fin', fin);
    return params;
  }

  getPubsPorUsuario(inicio?: string, fin?: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/publicaciones-usuario`, {
      headers: this.obtenerHeaders(),
      params: this.armarParametros(inicio, fin)
    });
  }

  getComentariosTiempo(inicio?: string, fin?: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/comentarios-tiempo`, {
      headers: this.obtenerHeaders(),
      params: this.armarParametros(inicio, fin)
    });
  }

  getComentariosPorPost(inicio?: string, fin?: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/comentarios-post`, {
      headers: this.obtenerHeaders(),
      params: this.armarParametros(inicio, fin)
    });
  }
}