import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  profilePic = '';
  preview: string | null = null;
  role = 'user';
  address = '';
  lat: number | null = null;
  lng: number | null = null;
  autoDetected = false;

  bgImage = 'assets/images/street-bg.jpg';
  logo = 'assets/images/logo.png';

  // ✅ SAME KEY AS REACT
  OPENCAGE_API_KEY =
    '21d0fc89a07b4c92ba5ec05aea6eb365';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.autoDetectLocation();
  }

  // 📍 Auto-detect location (React useEffect equivalent)
  autoDetectLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        this.lat = pos.coords.latitude;
        this.lng = pos.coords.longitude;
        this.autoDetected = true;

        try {
          const res: any = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${this.lat}+${this.lng}&key=${this.OPENCAGE_API_KEY}`
          ).then(r => r.json());

          if (res.results?.length) {
            this.address = res.results[0].formatted;
          }
        } catch (err) {
          console.error(err);
        }
      },
      () => this.autoDetected = false
    );
  }

  // 🖼 Profile picture upload
  handleProfileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.preview = URL.createObjectURL(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      this.profilePic = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // 📍 Manual address → lat/lng
  async handleAddressChange(event: any) {
    this.address = event.target.value;

    if (this.address.trim().length <= 3) return;

    try {
      const res: any = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(this.address)}&key=${this.OPENCAGE_API_KEY}`
      ).then(r => r.json());

      if (res.results?.length) {
        this.lat = res.results[0].geometry.lat;
        this.lng = res.results[0].geometry.lng;
      }
    } catch (err) {
      console.error(err);
    }
  }

  handleSubmit(event: Event) {
  event.preventDefault();

  if (this.password !== this.confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  const userData = {
    username: this.username,
    email: this.email,
    password: this.password,
    profilePic: this.profilePic,
    role: this.role,
    address: this.address,
    lat: this.lat,
    lng: this.lng
  };

  this.apiService.register(userData).subscribe({
    next: () => {
      alert('Registration successful');
      this.router.navigate(['/login']);
    },
    error: (err) => {
      alert(err?.error?.message || 'Registration failed');
    }
  });
}
}
