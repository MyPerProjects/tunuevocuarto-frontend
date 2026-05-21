import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaseService } from '../../services/lease';
import { PropertyService } from '../../services/property';
import { TenantService } from '../../services/tenant';

import { Property, Unit } from '../../models/property.model';
import { Tenant } from '../../models/tenant.model';
import { forkJoin } from 'rxjs';

// Material Core & Inputs
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// MEJORA: Componentes oficiales de Angular Material para Calendarios Estrictos
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-lease-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule, // Requerido para <mat-datepicker>
    MatNativeDateModule, // Requerido para parsear fechas nativas JS
  ],
  templateUrl: './lease-form.html',
  styleUrl: './lease-form.css',
})
export class LeaseFormComponent implements OnInit {
  private leaseService = inject(LeaseService);
  private propertyService = inject(PropertyService);
  private tenantService = inject(TenantService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  properties: Property[] = [];
  tenants: Tenant[] = [];
  availableUnits: Unit[] = [];

  selectedPropertyId?: number;

  // El datepicker de Angular Material trabaja nativamente con objetos Date en memoria
  contract = {
    tenantId: 0,
    unitId: 0,
    startDate: new Date(),
    monthlyRent: 0,
  };

  ngOnInit() {
    this.loadFormCatalogs();
  }

  loadFormCatalogs() {
    forkJoin({
      allProperties: this.propertyService.getAll(),
      allTenants: this.tenantService.getAll(),
      allLeases: this.leaseService.getAll(undefined, 'activo', undefined),
    }).subscribe({
      next: (res) => {
        this.properties = res.allProperties;

        const busyTenantIds = res.allLeases.map((lease) => lease.tenant?.id);
        this.tenants = res.allTenants.filter((tenant) => !busyTenantIds.includes(tenant.id));

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al sincronizar catálogos en cascada', err),
    });
  }

  onPropertyChange(propertyId: number) {
    this.availableUnits = [];
    this.contract.unitId = 0;
    this.contract.monthlyRent = 0;

    const currentProperty = this.properties.find((p) => p.id === propertyId);
    if (currentProperty) {
      const unitsList: Unit[] = [];
      currentProperty.floors.forEach((floor) => {
        floor.units.forEach((unit) => {
          if (unit.status === 'vacio') {
            unitsList.push(unit);
          }
        });
      });
      this.availableUnits = unitsList;
    }
    this.cdr.detectChanges();
  }

  onUnitChange(unitId: number) {
    const selectedUnit = this.availableUnits.find((u) => u.id === unitId);
    if (selectedUnit) {
      this.contract.monthlyRent = Number(selectedUnit.price);
    }
    this.cdr.detectChanges();
  }

  saveContract() {
    if (
      !this.contract.tenantId ||
      !this.contract.unitId ||
      !this.contract.startDate ||
      !this.contract.monthlyRent
    ) {
      alert('Por favor, rellena todos los campos del contrato.');
      return;
    }

    const dateSelected = new Date(this.contract.startDate);
    const year = dateSelected.getFullYear();
    const month = String(dateSelected.getMonth() + 1).padStart(2, '0');
    const day = String(dateSelected.getDate()).padStart(2, '0');
    const formattedStartDate = `${year}-${month}-${day}`;

    const payload = {
      ...this.contract,
      startDate: formattedStartDate, // Reemplazamos por la cadena limpia
    };

    this.leaseService.create(payload).subscribe({
      next: () => {
        alert('¡Contrato generado con éxito! El cuarto ha pasado a estado OCUPADO.');
        this.goBack();
      },
      error: (err) => alert('Error al generar: ' + (err.error?.message || 'Verifica los datos.')),
    });
  }

  goBack() {
    this.router.navigate(['/leases']);
  }
}
