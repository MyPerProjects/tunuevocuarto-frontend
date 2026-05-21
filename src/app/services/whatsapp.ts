import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class WhatsappService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/whatsapp`;

  private socket!: Socket;
  private qrSubject = new Subject<string>();
  private statusSubject = new Subject<'DISCONNECTED' | 'LOADING' | 'CONNECTED'>();

  constructor() {
    // Inicializamos la conexión inyectando el token Bearer en el saludo inicial (Handshake) del WS
    this.socket = io(`${environment.apiUrl}/whatsapp`, {
      autoConnect: false,
      transports: ['websocket'],
      auth: (cb) => {
        cb({ token: localStorage.getItem('access_token') });
      },
    });

    this.listenToSocketEvents();
  }

  connectSocket() {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnectSocket() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  private listenToSocketEvents() {
    // Escuchamos el nuevo formato de objeto multipropietario enviado por el backend
    this.socket.on('qr_code', (data: { userId: number; qr: string }) => {
      const currentUserId = parseInt(localStorage.getItem('user_id') || '0', 10);

      // REGLA DE AISLAMIENTO: Solo reaccionamos si el evento pertenece a mi sesión activa
      if (data.userId === currentUserId) {
        this.qrSubject.next(data.qr);
      }
    });

    this.socket.on(
      'connection_status',
      (data: { userId: number; status: 'DISCONNECTED' | 'LOADING' | 'CONNECTED' }) => {
        const currentUserId = parseInt(localStorage.getItem('user_id') || '0', 10);

        // REGLA DE AISLAMIENTO: Solo reaccionamos si el cambio de estado pertenece a mi sesión activa
        if (data.userId === currentUserId) {
          this.statusSubject.next(data.status);
        }
      },
    );
  }

  get onQrCodeGenerated(): Observable<string> {
    return this.qrSubject.asObservable();
  }

  get onStatusChanged(): Observable<'DISCONNECTED' | 'LOADING' | 'CONNECTED'> {
    return this.statusSubject.asObservable();
  }

  /**
   * HTTP: Obtiene el estado inicial aislado del dueño logueado
   */
  getInitialStatus(): Observable<{ status: 'DISCONNECTED' | 'LOADING' | 'CONNECTED'; qr: string }> {
    return this.http.get<{ status: 'DISCONNECTED' | 'LOADING' | 'CONNECTED'; qr: string }>(
      `${this.API_URL}/status`,
    );
  }

  logoutSession(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/logout`, {});
  }
}
