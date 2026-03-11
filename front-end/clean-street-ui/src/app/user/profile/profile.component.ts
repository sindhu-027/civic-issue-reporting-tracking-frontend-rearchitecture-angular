import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  loading = true;
  editMode = false;
  showPasswordModal = false;

  selectedFile: File | null = null;

  formData: any = {
    username: '',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    joinDate: '',
    profilePic: ''
  };

  passwords = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.fetchProfile();
  }

  // ================= FETCH PROFILE =================
  fetchProfile(): void {
    this.api.get('/auth/profile').subscribe({
      next: (res: any) => {
        const user = res.user ?? res;

        this.formData = {
          username: user.username || '',
          fullName: user.fullName || user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          location: user.address || '',
          bio: user.bio || '',
          joinDate: user.createdAt || '',
          profilePic: user.profilePic || ''
        };

        this.loading = false;
      },
      error: () => {
        alert('Profile fetch failed');
        this.loading = false;
      }
    });
  }

  // ================= SAVE PROFILE (TEXT ONLY) =================
  saveProfile(): void {
    const payload = {
      username: this.formData.username,
      address: this.formData.location,
      bio: this.formData.bio
    };

    this.api.put('/auth/profile/update', payload).subscribe({
      next: (res: any) => {
        const user = res.user ?? res;
        this.formData = { ...this.formData, ...user };
        this.editMode = false;
        alert('✅ Profile updated successfully');
      },
      error: () => {
        alert('❌ Failed to update profile');
      }
    });
  }

  // ================= FILE CHANGE =================
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.uploadProfileImage();
  }

  // ================= UPLOAD IMAGE =================
  uploadProfileImage(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();

    // MUST MATCH multer field name
    formData.append('profilePic', this.selectedFile);

    this.api.uploadProfilePic(formData).subscribe({           //uploadProfilePic
      next: (res: any) => {
        
        const user = res.user ?? res;

        // 🔥 Force refresh to avoid cache
        this.formData.profilePic =
          user.profilePic + '?v=' + Date.now();

        alert('✅ Profile image updated successfully');
      },
      error: (err) => {
        console.error(err);
        alert('❌ Image upload failed');
      }
    });
  }

  // ================= CHANGE PASSWORD =================
  changePassword(): void {
    if (this.passwords.newPassword !== this.passwords.confirmPassword) {
      alert('⚠️ Passwords do not match');
      return;
    }

    this.api.put('/auth/change-password', {
      oldPassword: this.passwords.oldPassword,
      newPassword: this.passwords.newPassword
    }).subscribe({
      next: () => {
        alert('✅ Password changed successfully');
        this.showPasswordModal = false;

        this.passwords = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      },
      error: () => {
        alert('❌ Failed to change password');
      }
    });
  }

  // ================= LOGOUT =================
  logout(): void {
    this.api.post('/auth/logout', {}).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}











