import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsappService } from '../../services/whatsapp';
import { Subscription } from 'rxjs';
import * as QRCode from 'qrcode';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-whatsapp-connect',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  templateUrl: './whatsapp-connect.html',
  styleUrl: './whatsapp-connect.css',
})
export class WhatsappConnectComponent implements OnInit, OnDestroy {
  private whatsappService = inject(WhatsappService);
  private cdr = inject(ChangeDetectorRef);

  status: 'DISCONNECTED' | 'LOADING' | 'CONNECTED' = 'LOADING';
  qrCodeDataUrl: string = '';

  private subs: Subscription[] = [];

  ngOnInit() {
    // 1. Abrimos el canal síncrono del WebSocket enviando las credenciales de mi sesión
    this.whatsappService.connectSocket();

    // Función reutilizable para cargar el estado inicial aislado por HTTP
    const cargarEstadoHttp = () => {
      this.whatsappService.getInitialStatus().subscribe({
        next: (res) => {
          this.status = res.status;
          if (res.qr) {
            this.generateNativeQr(res.qr);
          } else {
            this.qrCodeDataUrl = '';
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener estado inicial por HTTP:', err);
          this.status = 'DISCONNECTED';
          this.cdr.detectChanges();
        },
      });
    };

    // 2. Ejecutamos la carga inicial al montar el componente
    cargarEstadoHttp();

    // 3. Escucha de cambios de estado en tiempo real filtrados por usuario
    const statusSub = this.whatsappService.onStatusChanged.subscribe((newStatus) => {
      this.status = newStatus;

      if (newStatus === 'CONNECTED') {
        this.qrCodeDataUrl = '';
      }

      if (newStatus === 'DISCONNECTED') {
        this.qrCodeDataUrl = '';
        this.status = 'LOADING'; // Muestra el spinner con gracia

        setTimeout(() => {
          console.log('Reenganchando flujo de QR tras desvinculación pacífica...');
          cargarEstadoHttp();
        }, 3000); // Damos 3 segundos para que el backend destruya y re-inicialice Puppeteer
      }

      this.cdr.detectChanges();
    });

    // 4. Escucha de códigos QR en tiempo real filtrados por usuario
    const qrSub = this.whatsappService.onQrCodeGenerated.subscribe((qrText) => {
      this.status = 'DISCONNECTED';
      this.generateNativeQr(qrText);
      this.cdr.detectChanges();
    });

    this.subs.push(statusSub, qrSub);
  }

  async generateNativeQr(qrText: string) {
    try {
      this.qrCodeDataUrl = await QRCode.toDataURL(qrText, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error generando el código QR nativo:', err);
    }
  }

  onLogout() {
    this.status = 'LOADING';
    this.cdr.detectChanges();

    this.whatsappService.logoutSession().subscribe({
      next: (res) => {
        console.log(res.message);
        this.qrCodeDataUrl = '';
        this.status = 'DISCONNECTED';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cerrar sesión de WhatsApp:', err);
        this.status = 'CONNECTED';
        this.cdr.detectChanges();
      },
    });
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
    this.whatsappService.disconnectSocket();
  }
}
