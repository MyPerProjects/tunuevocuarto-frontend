import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property';
import { Property, Floor, Unit } from '../../models/property.model';
import { Router } from '@angular/router';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface FloorMatrix {
  floorNumber: number;
  roomCount: number;
  miniCount: number;
  deptCount: number;
}

@Component({
  selector: 'app-property-designer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './property-designer.html',
  styleUrl: './property-designer.css',
})
export class PropertyDesignerComponent {
  private propertyService = inject(PropertyService);
  private router = inject(Router);

  propertyName = '';
  propertyAddress = '';

  floorsMatrix: FloorMatrix[] = [{ floorNumber: 1, roomCount: 0, miniCount: 0, deptCount: 0 }];

  generatedFloors: Floor[] = [];
  isGenerated = false;

  addFloorRow() {
    const nextFloor = this.floorsMatrix.length + 1;
    this.floorsMatrix.push({
      floorNumber: nextFloor,
      roomCount: 0,
      miniCount: 0,
      deptCount: 0,
    });
    this.isGenerated = false;
  }

  removeFloorRow(index: number) {
    if (this.floorsMatrix.length > 1) {
      this.floorsMatrix.splice(index, 1);
      this.floorsMatrix.forEach((f, i) => (f.floorNumber = i + 1));
      this.isGenerated = false;
    }
  }

  /**
   * Genera el inventario preliminar partiendo de un precio base estimado en el código (S/ 300)
   */
  previewInventory() {
    this.generatedFloors = [];
    const basePriceSugerido = 300;

    for (const matrix of this.floorsMatrix) {
      const floorUnits: Unit[] = [];
      let currentUnitIndex = 1;

      for (let i = 0; i < matrix.roomCount; i++) {
        const formattedIndex = String(currentUnitIndex).padStart(2, '0');
        floorUnits.push({
          unitNumber: `C-${matrix.floorNumber}${formattedIndex}`,
          price: basePriceSugerido,
          status: 'vacio',
          type: 'Cuarto',
        });
        currentUnitIndex++;
      }

      for (let i = 0; i < matrix.miniCount; i++) {
        const formattedIndex = String(currentUnitIndex).padStart(2, '0');
        floorUnits.push({
          unitNumber: `M-${matrix.floorNumber}${formattedIndex}`,
          price: Math.round(basePriceSugerido * 1.8),
          status: 'vacio',
          type: 'Mini-Depa',
        });
        currentUnitIndex++;
      }

      for (let i = 0; i < matrix.deptCount; i++) {
        const formattedIndex = String(currentUnitIndex).padStart(2, '0');
        floorUnits.push({
          unitNumber: `D-${matrix.floorNumber}${formattedIndex}`,
          price: Math.round(basePriceSugerido * 2.5),
          status: 'vacio',
          type: 'Departamento',
        });
        currentUnitIndex++;
      }

      this.generatedFloors.push({
        level: matrix.floorNumber, // <--- CAMBIADO: Guardamos directamente como level
        units: floorUnits,
      });
    }

    this.isGenerated = true;
  }

  saveProperty() {
    if (!this.propertyName || !this.propertyAddress) {
      alert('Por favor, completa el nombre y la dirección de la propiedad.');
      return;
    }

    if (this.generatedFloors.length === 0 || !this.isGenerated) {
      alert('Primero debes generar el desglose de unidades.');
      return;
    }

    // Como las interfaces ya coinciden al 100% con el DTO de NestJS, el payload es directo y limpio:
    const propertyPayload: Property = {
      name: this.propertyName,
      address: this.propertyAddress,
      floors: this.generatedFloors.map((f) => ({
        level: f.level,
        units: f.units.map((u) => ({
          ...u,
          price: Number(u.price), // Nos aseguramos de mantener el cast numérico de seguridad
        })),
      })),
    };

    this.propertyService.create(propertyPayload).subscribe({
      next: () => {
        alert('¡Propiedad guardada con éxito con tipado unificado!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        alert('Error al guardar: ' + (err.error?.message || 'Verifica los datos'));
      },
    });
  }
}
