import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaseService } from '../../services/lease';
import { PropertyService } from '../../services/property';
import { TenantService } from '../../services/tenant';

import { Property, Unit, Floor } from '../../models/property.model';
import { Tenant } from '../../models/tenant.model';
import { forkJoin } from 'rxjs';

import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
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
    MatDatepickerModule,
    MatNativeDateModule,
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

  availableFloors: Floor[] = []; // Colección de pisos dinámicos
  availableUnits: Unit[] = []; // Colección de habitaciones dinámicas

  selectedPropertyId?: number;
  selectedFloorId?: number; // Variable de control para el piso elegido

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

  // Paso 1: Al cambiar de propiedad, extraemos sus pisos que tengan cuartos vacíos
  onPropertyChange(propertyId: number) {
    this.availableFloors = [];
    this.availableUnits = [];
    this.selectedFloorId = undefined;
    this.contract.unitId = 0;
    this.contract.monthlyRent = 0;

    const currentProperty = this.properties.find((p) => p.id === propertyId);
    if (currentProperty && currentProperty.floors) {
      // Solo mostramos los pisos que tengan al menos una habitación con estado 'vacio'
      this.availableFloors = currentProperty.floors.filter((floor) =>
        floor.units.some((unit) => unit.status === 'vacio'),
      );
    }
    this.cdr.detectChanges();
  }

  // Paso 2: Al cambiar de piso, extraemos únicamente sus cuartos disponibles
  onFloorChange(floorId: number) {
    this.availableUnits = [];
    this.contract.unitId = 0;
    this.contract.monthlyRent = 0;

    const currentFloor = this.availableFloors.find((f) => f.id === floorId);
    if (currentFloor && currentFloor.units) {
      this.availableUnits = currentFloor.units.filter((unit) => unit.status === 'vacio');
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
      startDate: formattedStartDate,
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
