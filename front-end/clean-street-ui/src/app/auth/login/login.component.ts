import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';
  loading = false;

  bgImage = 'assets/images/login.jpg';
  logo = 'assets/images/logo.png';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  handleLogin(event: Event) {

    event.preventDefault();

    if (!this.email || !this.password) {
      alert('Please enter email and password');
      return;
    }

    this.loading = true;

    // clear previous sessions
    localStorage.clear();
    sessionStorage.clear();

    this.api.login({
      email: this.email,
      password: this.password
    }).subscribe({

      next: (res: any) => {

        if (!res?.user) {
          alert('Invalid server response');
          return;
        }

        sessionStorage.setItem('user', JSON.stringify(res.user));

        // redirect based on role
        if (res.user.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (res.user.role === 'volunteer') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }

      },

      error: (err) => {

        console.error('Login error', err);

        alert(
          err?.error?.message ||
          'Login failed. Please check credentials.'
        );

        this.loading = false;

      },

      complete: () => {
        this.loading = false;
      }

    });

  }

}