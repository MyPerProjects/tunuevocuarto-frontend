import { Tenant } from './tenant.model';

export interface LeaseSummary {
  leaseId: number;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  monthlyRent: number;
  paymentStatus: string;
  startDate: string;
  nextPaymentDate: string;
}

// Estructura para la tabla general con filtros avanzados
export interface Lease {
  id: number;
  startDate: string;
  terminatedAt?: string;
  status: 'activo' | 'finalizado';
  paymentStatus: 'al_dia' | 'pendiente';
  monthlyRent: number;
  createdAt: string;
  tenant: Tenant;
  unit: {
    id: number;
    unitNumber: string;
    type: string;
    floor: {
      level: number;
      property: {
        id: number;
        name: string;
      };
    };
  };
}
