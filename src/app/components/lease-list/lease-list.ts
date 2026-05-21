import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeaseService } from '../../services/lease';
import { PropertyService } from '../../services/property';
import { Lease } from '../../models/lease.model';
import { Property } from '../../models/property.model';

// Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-lease-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './lease-list.html',
  styleUrl: './lease-list.css',
})
export class LeaseListComponent implements OnInit {
  private leaseService = inject(LeaseService);
  private propertyService = inject(PropertyService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  leases: Lease[] = [];
  properties: Property[] = [];

  selectedProperty?: number;
  selectedStatus: string = '';
  selectedPaymentStatus: string = '';

  displayedColumns: string[] = ['tenant', 'room', 'rent', 'status', 'actions'];

  ngOnInit() {
    this.loadFiltersData();
    this.applyFilters();
  }

  loadFiltersData() {
    this.propertyService.getAll().subscribe({
      next: (data) => {
        this.properties = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar propiedades para filtros', err),
    });
  }

  applyFilters() {
    this.leaseService
      .getAll(
        this.selectedProperty,
        this.selectedStatus || undefined,
        this.selectedPaymentStatus || undefined,
      )
      .subscribe({
        next: (data) => {
          this.leases = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al filtrar contratos', err),
      });
  }

  /**
   * OPCIÓN A: Freno de mano de UX. Abre una advertencia explícita en el Galaxy A16
   * para prevenir que se envíen mensajes de cobranza o confirmación por error.
   */
  togglePaymentStatus(lease: Lease) {
    const nextStatus = lease.paymentStatus === 'al_dia' ? 'pendiente' : 'al_dia';

    const mensajeAlerta =
      nextStatus === 'pendiente'
        ? `⚠️ ¿Estás seguro de cambiar el estado a PENDIENTE?\nSe enviará AUTOMÁTICAMENTE una notificación de cobranza por WhatsApp con tus datos de Yape/BCP a ${lease.tenant?.firstName}.`
        : `✅ ¿Deseas confirmar que el inquilino ya pagó?\nSe enviará un mensaje de agradecimiento por WhatsApp a ${lease.tenant?.firstName} calculando su próximo aniversario de pago.`;

    if (confirm(mensajeAlerta)) {
      this.leaseService.updatePaymentStatus(lease.id, nextStatus).subscribe({
        next: () => {
          this.applyFilters();
        },
        error: (err) => alert('No se pudo actualizar el estado de pago de la renta.'),
      });
    }
  }

  terminateContract(id: number) {
    if (
      confirm(
        '¿Estás seguro de finalizar este contrato? Se registrará la fecha de salida y el cuarto volverá a estar DISPONIBLE de inmediato.',
      )
    ) {
      this.leaseService.terminate(id).subscribe({
        next: () => {
          alert('Contrato finalizado con éxito.');
          this.applyFilters();
        },
        error: (err) => alert('Error al finalizar el contrato.'),
      });
    }
  }

  deleteContract(id: number) {
    if (
      confirm(
        '🚨 ¿Deseas ELIMINAR permanentemente este contrato? Esto liberará la habitación a estado disponible y borrará el historial de raíz.',
      )
    ) {
      this.leaseService.delete(id).subscribe({
        next: () => {
          alert('Contrato eliminado del sistema.');
          this.applyFilters();
        },
        error: (err) => alert('Error al eliminar.'),
      });
    }
  }

  goToCreate() {
    this.router.navigate(['/leases/new']);
  }
}
