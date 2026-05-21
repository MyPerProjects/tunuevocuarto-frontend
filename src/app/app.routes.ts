import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome';
import { MainLayoutComponent } from './components/main-layout/main-layout';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ProfileComponent } from './components/profile/profile';
import { authGuard } from './core/guards/auth-guard'; // Importar el guard
import { PropertyListComponent } from './components/property-list/property-list';
import { PropertyDesignerComponent } from './components/property-designer/property-designer';
import { TenantListComponent } from './components/tenant-list/tenant-list';
import { TenantFormComponent } from './components/tenant-form/tenant-form';
import { LeaseListComponent } from './components/lease-list/lease-list';
import { LeaseFormComponent } from './components/lease-form/lease-form';
import { WhatsappConnectComponent } from './components/whatsapp-connect/whatsapp-connect';

export const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard], // <--- PROTECCIÓN TOTAL: El layout y sus hijos requieren login
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'properties', component: PropertyListComponent },
      { path: 'property-designer', component: PropertyDesignerComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'tenants', component: TenantListComponent },
      { path: 'tenants/new', component: TenantFormComponent },
      { path: 'tenants/edit/:id', component: TenantFormComponent },
      { path: 'leases', component: LeaseListComponent },
      { path: 'leases/new', component: LeaseFormComponent },
      { path: 'whatsapp', component: WhatsappConnectComponent },
    ],
  },
  { path: '**', redirectTo: 'welcome' },
];
