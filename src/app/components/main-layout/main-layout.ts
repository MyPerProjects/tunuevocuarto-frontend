import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent {
  // Lista de secciones indispensables
  menuItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'business', label: 'Propiedades', route: '/properties' },
    { icon: 'people', label: 'Inquilinos', route: '/tenants' },
    { icon: 'description', label: 'Contratos', route: '/leases' },
    { icon: 'smartphone', label: 'Vincular con Whatsapp', route: '/whatsapp' },
    { icon: 'person', label: 'Mi Perfil', route: '/profile' }
  ];
}