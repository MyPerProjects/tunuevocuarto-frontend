import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { LeaseSummary, Lease } from '../models/lease.model';

@Injectable({
  providedIn: 'root',
})
export class LeaseService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/leases`;

  getDashboardSummary(): Observable<LeaseSummary[]> {
    return this.http.get<LeaseSummary[]>(`${this.API_URL}/dashboard`);
  }

  /**
   * Obtiene todos los contratos aplicando filtros opcionales por Query Params
   */
  getAll(propertyId?: number, status?: string, paymentStatus?: string): Observable<Lease[]> {
    let params = new HttpParams();
    if (propertyId) params = params.set('propertyId', propertyId.toString());
    if (status) params = params.set('status', status);
    if (paymentStatus) params = params.set('paymentStatus', paymentStatus);

    return this.http.get<Lease[]>(this.API_URL, { params });
  }

  create(leaseData: {
    tenantId: number;
    unitId: number;
    startDate: string;
    monthlyRent: number;
  }): Observable<Lease> {
    return this.http.post<Lease>(this.API_URL, leaseData);
  }

  updatePaymentStatus(leaseId: number, status: string): Observable<Lease> {
    return this.http.patch<Lease>(`${this.API_URL}/${leaseId}/payment-status?status=${status}`, {});
  }

  terminate(leaseId: number): Observable<Lease> {
    return this.http.patch<Lease>(`${this.API_URL}/${leaseId}/terminate`, {});
  }

  delete(leaseId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${leaseId}`);
  }
}
