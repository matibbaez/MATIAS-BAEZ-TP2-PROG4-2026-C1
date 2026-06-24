import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {
  private http = inject(HttpClient);
  private baseUrl = 'https://matias-baez-tp2-prog4-2026-c1.onrender.com/publicaciones'; 

  obtenerFeed(orden: string = 'fecha', limit: number = 5, offset: number = 0, usuario?: string): Observable<any[]> {
    let params = new HttpParams()
      .set('orden', orden)
      .set('limit', limit)
      .set('offset', offset);

    if (usuario) {
      params = params.set('usuario', usuario);
    }

    return this.http.get<any[]>(this.baseUrl, { params });
  }

  publicar(formData: FormData): Observable<any> {
    return this.http.post<any>(this.baseUrl, formData);
  }

  darLike(id: string, usuarioId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/like`, { usuarioId });
  }

  quitarLike(id: string, usuarioId: string): Observable<any> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.delete<any>(`${this.baseUrl}/${id}/like`, { params });
  }

  eliminar(id: string, usuarioId: string, rol: string): Observable<any> {
    const params = new HttpParams().set('usuarioId', usuarioId).set('rol', rol);
    return this.http.delete<any>(`${this.baseUrl}/${id}`, { params });
  }
}