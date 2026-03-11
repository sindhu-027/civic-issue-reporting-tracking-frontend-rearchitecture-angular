import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-home',
  standalone:false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  isLoggedIn = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuth();
  }

  checkAuth() {
    this.apiService.get('/auth/check').subscribe({
      next: () => {
        this.isLoggedIn = true;
      },
      error: () => {
        this.isLoggedIn = false;
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
