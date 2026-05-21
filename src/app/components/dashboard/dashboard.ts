import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardSummaryData } from '../../services/dashboard';
import { Subscription } from 'rxjs';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('occupancyChart') occupancyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;

  data: DashboardSummaryData | null = null;
  loading: boolean = true;

  private chartInstances: Chart[] = [];
  private sub!: Subscription;

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.sub = this.dashboardService.getSummary().subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.initCharts();
        }, 50);
      },
      error: (err) => {
        console.error('Error al cargar métricas reales del Dashboard:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private initCharts() {
    if (!this.data) return;

    this.chartInstances.forEach((chart) => chart.destroy());
    this.chartInstances = [];

    // 1. GRÁFICO DE DONA: ESTADO DEL INVENTARIO
    const occupancyCtx = this.occupancyChartRef.nativeElement.getContext('2d');
    if (occupancyCtx) {
      const occupancyChart = new Chart(occupancyCtx, {
        type: 'doughnut',
        data: {
          labels: ['Ocupados', 'Disponibles', 'Mantenimiento'],
          datasets: [
            {
              data: [
                this.data.kpis.occupiedUnits,
                this.data.kpis.availableUnits,
                this.data.kpis.maintenanceUnits,
              ],
              backgroundColor: ['#ef4444', '#10b981', '#64748b'],
              borderWidth: 2,
              borderColor: '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
          },
        },
      });
      this.chartInstances.push(occupancyChart);
    }

    // 2. GRÁFICO DE BARRAS REALES: HISTORIAL
    const revenueCtx = this.revenueChartRef.nativeElement.getContext('2d');
    if (revenueCtx) {
      const labels = this.data.monthlyRevenueHistory.map((h) => h.monthName);
      const amounts = this.data.monthlyRevenueHistory.map((h) => h.amount);

      const revenueChart = new Chart(revenueCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Recaudación Real (S/)',
              data: amounts,
              backgroundColor: '#0ea5e9',
              borderRadius: 6,
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
            },
            x: {
              grid: { display: false },
            },
          },
        },
      });
      this.chartInstances.push(revenueChart);
    }
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    this.chartInstances.forEach((chart) => chart.destroy());
  }
}
