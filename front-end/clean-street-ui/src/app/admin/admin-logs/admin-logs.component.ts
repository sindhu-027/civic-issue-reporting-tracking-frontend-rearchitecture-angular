import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/api.service';
import { SocketService } from '../../shared/socket.service';
import { Socket } from 'socket.io-client';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-logs',
  standalone: false,
  templateUrl: './admin-logs.component.html',
  styleUrls: ['./admin-logs.component.css']
})
export class AdminLogsComponent implements OnInit, OnDestroy {

  logs: any[] = [];
  loading = true;

  currentPage = 1;
  logsPerPage = 10;

  private socket!: Socket;
  private logsSub!: Subscription;

  constructor(
    private api: ApiService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchLogs();
    this.initSocket();
  }

  ngOnDestroy(): void {

    // unsubscribe API
    if (this.logsSub) {
      this.logsSub.unsubscribe();
    }

    // remove socket listener
    if (this.socket) {
      this.socket.off('newAdminLog');
    }
  }

  /* ---------------- FETCH LOGS ---------------- */

  fetchLogs(): void {
    this.logsSub = this.api.get('/complaints/admin/logs').subscribe({
      next: (res: any) => {
        this.logs = res || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch logs', err);
        this.logs = [];
        this.loading = false;
      }
    });
  }

  /* ---------------- SOCKET ---------------- */

  initSocket(): void {

    this.socketService.connect();
    this.socket = this.socketService.getSocket();

    this.socket.on('newAdminLog', (log: any) => {

      if (!log) return;

      this.logs = [log, ...this.logs];

      // keep logs list reasonable
      if (this.logs.length > 500) {
        this.logs.pop();
      }

    });
  }

  /* ---------------- NAVIGATION ---------------- */

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  /* ---------------- FORMAT TIME ---------------- */

  formatTime(time: string): string {
    if (!time) return '';

    return new Date(time).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }

  /* ---------------- PAGINATION ---------------- */

  get currentLogs(): any[] {
    const start = (this.currentPage - 1) * this.logsPerPage;
    return this.logs.slice(start, start + this.logsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.logs.length / this.logsPerPage);
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  /* ---------------- LOG COLOR ---------------- */

  actionClass(text: string): string {

    if (!text) return 'text-gray-700';

    const t = text.toLowerCase();

    if (t.includes('assigned')) return 'text-blue-600 font-semibold';
    if (t.includes('resolved')) return 'text-green-600 font-semibold';
    if (t.includes('deleted')) return 'text-red-600 font-semibold';
    if (t.includes('pending')) return 'text-orange-600 font-semibold';
    if (t.includes('progress')) return 'text-yellow-600 font-semibold';

    return 'text-gray-700';
  }

}
