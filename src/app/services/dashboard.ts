import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

// Definimos las interfaces exactas que armamos en el Backend para tener tipado fuerte
export interface KpiSummary {
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  maintenanceUnits: number;
  occupancyPercentage: number;
  collectedRevenueThisMonth: number;
  pendingRevenueThisMonth: number;
  activeTenantsCount: number;
}

export interface MonthlyRevenue {
  monthName: string;
  amount: number;
}

export interface CriticalAlert {
  leaseId: number;
  tenantName: string;
  tenantPhone: string;
  unitNumber: string;
  propertyName: string;
  monthlyRent: number;
  daysDelayed: number;
}

export interface RecentActivity {
  type: 'CHECK_IN' | 'CHECK_OUT';
  tenantName: string;
  unitNumber: string;
  propertyName: string;
  date: Date;
}

export interface DashboardSummaryData {
  kpis: KpiSummary;
  monthlyRevenueHistory: MonthlyRevenue[];
  criticalAlerts: CriticalAlert[];
  recentActivity: RecentActivity[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/dashboard`;

  /**
   * Obtiene de forma segura el consolidado estadístico del dueño logueado
   */
  getSummary(): Observable<DashboardSummaryData> {
    return this.http.get<DashboardSummaryData>(`${this.API_URL}/summary`);
  }
}
