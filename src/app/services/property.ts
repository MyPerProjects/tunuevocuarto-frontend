import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Property } from '../models/property.model';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/properties`;

  /**
   * Obtiene todas las propiedades asociadas exclusivamente al dueño autenticado vía JWT.
   */
  getAll(): Observable<Property[]> {
    return this.http.get<Property[]>(this.API_URL);
  }

  /**
   * Crea una nueva propiedad asignándole el inventario estructurado.
   */
  create(property: Property): Observable<Property> {
    return this.http.post<Property>(this.API_URL, property);
  }

  /**
   * Actualiza los datos generales o nuevos pisos de una propiedad en caliente.
   */
  update(id: number, property: any): Observable<Property> {
    return this.http.put<Property>(`${this.API_URL}/${id}`, property);
  }

  /**
   * Elimina una propiedad por completo junto con sus pisos y cuartos asociados (Cascade).
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtiene los detalles e inventario de una sola propiedad específica por su ID.
   */
  getById(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.API_URL}/${id}`);
  }
}
