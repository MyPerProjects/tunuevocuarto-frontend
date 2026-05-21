import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyService } from '../../services/property';
import { Property as BaseProperty, Floor, Unit } from '../../models/property.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

interface UIProperty extends BaseProperty {
  isExpanded?: boolean;
  isEditing?: boolean;
  backupFloors?: string;
  isAddingFloor?: boolean;
  newFloorNumbers?: {
    roomCount: number;
    miniCount: number;
    deptCount: number;
  };
}

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './property-list.html',
  styleUrl: './property-list.css',
})
export class PropertyListComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  properties: UIProperty[] = [];

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.propertyService.getAll().subscribe({
      next: (data) => {
        this.properties = data.map((prop) => ({
          ...prop,
          isExpanded: false,
          isEditing: false,
          isAddingFloor: false,
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar propiedades del dueño:', err),
    });
  }

  toggleExpand(property: UIProperty) {
    if (property.isExpanded && property.isEditing) {
      this.cancelEditing(property);
    }
    property.isExpanded = !property.isExpanded;
    this.cdr.detectChanges();
  }

  enableEditing(property: UIProperty) {
    property.backupFloors = JSON.stringify(property.floors);
    property.isExpanded = true;
    property.isEditing = true;
    property.isAddingFloor = false;
    this.cdr.detectChanges();
  }

  cancelEditing(property: UIProperty) {
    if (property.backupFloors) {
      property.floors = JSON.parse(property.backupFloors);
    }
    property.isEditing = false;
    property.isAddingFloor = false;
    this.cdr.detectChanges();
  }

  startNewFloorSetup(property: UIProperty) {
    property.isAddingFloor = true;
    property.newFloorNumbers = { roomCount: 0, miniCount: 0, deptCount: 0 };
    this.cdr.detectChanges();
  }

  toggleUnitStatus(unit: Unit) {
    if (unit.status === 'ocupado') return;

    if (unit.status === 'vacio') {
      unit.status = 'mantenimiento';
    } else if (unit.status === 'mantenimiento') {
      unit.status = 'vacio';
    }

    this.cdr.detectChanges();
  }

  generateInlineFloorUnits(property: UIProperty) {
    if (!property.newFloorNumbers) return;

    const nextFloorLevel = property.floors.length + 1;
    const generatedUnits: Unit[] = [];
    let currentUnitIndex = 1;
    const defaultBasePrice = 300;

    for (let i = 0; i < property.newFloorNumbers.roomCount; i++) {
      generatedUnits.push({
        unitNumber: `C-${nextFloorLevel}${String(currentUnitIndex).padStart(2, '0')}`,
        price: defaultBasePrice,
        status: 'vacio',
        type: 'Cuarto',
      });
      currentUnitIndex++;
    }

    for (let i = 0; i < property.newFloorNumbers.miniCount; i++) {
      generatedUnits.push({
        unitNumber: `M-${nextFloorLevel}${String(currentUnitIndex).padStart(2, '0')}`,
        price: Math.round(defaultBasePrice * 1.8),
        status: 'vacio',
        type: 'Mini-Depa',
      });
      currentUnitIndex++;
    }

    for (let i = 0; i < property.newFloorNumbers.deptCount; i++) {
      generatedUnits.push({
        unitNumber: `D-${nextFloorLevel}${String(currentUnitIndex).padStart(2, '0')}`,
        price: Math.round(defaultBasePrice * 2.5),
        status: 'vacio',
        type: 'Departamento',
      });
      currentUnitIndex++;
    }

    const newFloor: Floor = {
      level: nextFloorLevel,
      units: generatedUnits,
    };

    property.floors.push(newFloor);
    property.isAddingFloor = false;
    property.newFloorNumbers = { roomCount: 0, miniCount: 0, deptCount: 0 };
    this.cdr.detectChanges();
  }

  savePropertyChanges(property: UIProperty) {
    if (!property.id) return;

    const cleanPayload = {
      name: property.name,
      address: property.address,
      imageUrl: property.imageUrl,
      floors: property.floors.map((f) => ({
        id: f.id ? Number(f.id) : undefined,
        level: Number(f.level),
        units: f.units.map((u) => ({
          id: u.id ? Number(u.id) : undefined,
          unitNumber: u.unitNumber,
          price: Number(u.price),
          status: u.status,
          type: u.type,
        })),
      })),
    };

    this.propertyService.update(property.id, cleanPayload).subscribe({
      next: () => {
        alert('¡Propiedad e inventario actualizados con éxito!');
        property.isEditing = false;
        property.isAddingFloor = false;
        this.loadProperties();
      },
      error: (err) => {
        console.error('Error del servidor:', err);
        alert('Error de validación al guardar cambios.');
      },
    });
  }

  deleteProperty(id: number) {
    if (confirm('¿Estás seguro de eliminar esta propiedad?')) {
      this.propertyService.delete(id).subscribe({
        next: () => {
          this.properties = this.properties.filter((p) => p.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => alert('Error al eliminar la propiedad.'),
      });
    }
  }

  goToDesigner() {
    this.router.navigate(['/property-designer']);
  }
}
