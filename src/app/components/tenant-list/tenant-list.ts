import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TenantService } from '../../services/tenant';
import { Tenant } from '../../models/tenant.model';

// Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './tenant-list.html',
  styleUrl: './tenant-list.css',
})
export class TenantListComponent implements OnInit {
  private tenantService = inject(TenantService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  tenants: Tenant[] = [];

  // Nombres de las columnas que pintará la tabla de Angular Material
  displayedColumns: string[] = ['name', 'dni', 'phone', 'actions'];

  ngOnInit() {
    this.loadTenants();
  }

  loadTenants() {
    this.tenantService.getAll().subscribe({
      next: (data) => {
        this.tenants = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al traer inquilinos', err),
    });
  }

  goToCreate() {
    this.router.navigate(['/tenants/new']);
  }

  goToEdit(id: number) {
    this.router.navigate([`/tenants/edit/${id}`]);
  }

  deleteTenant(id: number) {
    if (confirm('¿Estás seguro de eliminar permanentemente a este inquilino del padrón maestro?')) {
      this.tenantService.delete(id).subscribe({
        next: () => {
          this.tenants = this.tenants.filter((t) => t.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => alert('No se pudo eliminar el registro.'),
      });
    }
  }
}
