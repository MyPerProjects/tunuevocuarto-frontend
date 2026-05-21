import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Tenant } from '../models/tenant.model';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/tenants`;

  getAll(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(this.API_URL);
  }

  getById(id: number): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.API_URL}/${id}`);
  }

  create(tenant: Tenant): Observable<Tenant> {
    return this.http.post<Tenant>(this.API_URL, tenant);
  }

  update(id: number, tenant: Tenant): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.API_URL}/${id}`, tenant);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
