import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Responses } from '../responses.entity';

@Injectable({
  providedIn: 'root'
})
export class ResponsesService {
  private apiUrl = 'http://localhost:3000/response';

  constructor(private http: HttpClient) { }

  // Obtener todas las respuestas
  getAllResponses(): Observable<Responses[]> {
    return this.http.get<Responses[]>(this.apiUrl);
  }

  // Añadir nueva respuesta
  addResponse(response: Omit<Responses, 'id'>): Observable<Responses> {
    return this.http.post<Responses>(`${this.apiUrl}/add`, response);
  }

  // Actualizar respuesta existente
  updateResponse(id: number, response: Partial<Responses>): Observable<Responses> {
    return this.http.put<Responses>(`${this.apiUrl}/${id}`, response);
  }

  // Eliminar respuesta
  deleteResponse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Importar respuestas
  importResponses(data: any[]): Observable<{ imported: number }> {
    return this.http.post<{ imported: number }>(`${this.apiUrl}/import`, { data });
  }

  // Buscar respuesta por patrón (para el chatbot)
  findResponseByPattern(message: string): Observable<Responses | null> {
    return this.http.get<Responses | null>(`${this.apiUrl}/search`, {
      params: { message }
    });
  }
}
