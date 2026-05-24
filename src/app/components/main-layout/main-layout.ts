import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
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
    MatButtonModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {
  private screenWidth: number = window.innerWidth;

  menuItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'business', label: 'Propiedades', route: '/properties' },
    { icon: 'people', label: 'Inquilinos', route: '/tenants' },
    { icon: 'description', label: 'Contratos', route: '/leases' },
    { icon: 'smartphone', label: 'Vincular con Whatsapp', route: '/whatsapp' },
    { icon: 'person', label: 'Mi Perfil', route: '/profile' },
  ];

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = event.target.innerWidth;
  }

  isMobile(): boolean {
    return this.screenWidth <= 768;
  }

  closeOnMobile(drawer: MatSidenav) {
    if (this.isMobile()) {
      drawer.close();
    }
  }
}
