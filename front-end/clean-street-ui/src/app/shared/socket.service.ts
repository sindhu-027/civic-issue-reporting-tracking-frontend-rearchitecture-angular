

import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;

  connect(): void {
    if (!this.socket) {
      this.socket = io(environment.apiUrl, {
        transports: ['websocket'],
        withCredentials: true
      });
    }
  }

  getSocket(): Socket {
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined as any;
    }
  }
}



