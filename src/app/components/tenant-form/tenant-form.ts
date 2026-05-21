import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantService } from '../../services/tenant';
import { Tenant } from '../../models/tenant.model';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tenant-form',
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
  templateUrl: './tenant-form.html',
  styleUrl: './tenant-form.css',
})
export class TenantFormComponent implements OnInit {
  private tenantService = inject(TenantService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  tenantId?: number;
  isEditMode = false;

  // Objeto base ligado al formulario
  tenant: Tenant = {
    firstName: '',
    lastName: '',
    dni: '',
    phoneNumber: '',
  };

  ngOnInit() {
    // Verificamos si la ruta viene con un parámetro id (Modo Edición)
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.tenantId = Number(idParam);
      this.isEditMode = true;
      this.loadTenantData(this.tenantId);
    }
  }

  // Abre tu src/app/components/tenant-form/tenant-form.ts y reemplaza estos dos métodos:

  loadTenantData(id: number) {
    this.tenantService.getById(id).subscribe({
      next: (data) => {
        this.tenant = data;

        // CORRECCIÓN DE CARGA: Si el número de la DB empieza con '+51', lo limpiamos para la vista
        if (this.tenant.phoneNumber && this.tenant.phoneNumber.startsWith('+51')) {
          this.tenant.phoneNumber = this.tenant.phoneNumber.replace('+51', '').trim();
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Error al cargar los datos del inquilino.');
        this.goBack();
      },
    });
  }

  saveTenant() {
    if (
      !this.tenant.firstName ||
      !this.tenant.lastName ||
      !this.tenant.dni ||
      !this.tenant.phoneNumber
    ) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (this.tenant.dni.length !== 8) {
      alert('El DNI debe tener exactamente 8 dígitos.');
      return;
    }

    // VALIDACIÓN LOCAL: Verificar que tenga exactamente 9 números y empiece con 9 (estándar Perú)
    const phoneClean = this.tenant.phoneNumber.trim();
    if (phoneClean.length !== 9 || !phoneClean.startsWith('9')) {
      alert('El número de celular debe tener 9 dígitos y empezar con 9.');
      return;
    }

    // CLAVE DE ALTA INGENIERÍA: Concatenamos el prefijo automáticamente antes de viajar a NestJS
    const bodyPayload = {
      firstName: this.tenant.firstName,
      lastName: this.tenant.lastName,
      dni: this.tenant.dni,
      phoneNumber: `+51${phoneClean}`, // Guarda "+51987654321" limpio en Postgres
    };

    if (this.isEditMode && this.tenantId) {
      this.tenantService.update(this.tenantId, bodyPayload).subscribe({
        next: () => {
          alert('¡Inquilino actualizado con éxito!');
          this.goBack();
        },
        error: (err) => {
          console.error('Error del servidor:', err);
          alert('Error al actualizar: ' + (err.error?.message || 'Verifica los campos.'));
        },
      });
    } else {
      this.tenantService.create(bodyPayload).subscribe({
        next: () => {
          alert('¡Inquilino registrado con éxito!');
          this.goBack();
        },
        error: (err) => {
          console.error('Error del servidor:', err);
          alert('Error al registrar: ' + (err.error?.message || 'El DNI podría estar duplicado.'));
        },
      });
    }
  }

  goBack() {
    this.router.navigate(['/tenants']);
  }
}
