import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/publicaciones';

  obtenerFeed(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  publicar(payload: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload);
  }
}