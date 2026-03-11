import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
//import { environment } from '../../environments/environment'; // UPDATED
import { environment } from '../../../environments/environment.prod';

/*✅ STEP 2 – FORCE LEAFLET ICON*/

// remove leaflet internal icon path logic
delete (L.Icon.Default.prototype as any)._getIconUrl;

// define icon manually
const defaultIcon = L.icon({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// apply icon globally
L.Marker.prototype.options.icon = defaultIcon;

@Component({
  selector: 'app-report-issue',
  standalone: false,
  templateUrl: './report-issue.component.html',
  styleUrls: ['./report-issue.component.css']
})
export class ReportIssueComponent implements OnInit, AfterViewInit {

API = environment.apiUrl;

  formData = {
    issueTitle: '',
    issueType: '',
    priorityLevel: '',
    address: '',
    landmark: '',
    description: '',
    location: null as { lat: number; lng: number } | null,
    photos: [] as File[]
  };

  previews: string[] = [];
  fetchingAddress = false;
  addressError = '';
  submitting = false;

  map!: L.Map;
  marker!: L.Marker;
  addressTimeout: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  /* ============================
     ✅ STEP 3 – INIT MAP AFTER VIEW
     ============================ */
  ngAfterViewInit(): void {
    this.initMap();
  }

  // 🌍 Address → Coordinates
  onAddressChange() {
    if (!this.formData.address.trim()) return;

    clearTimeout(this.addressTimeout);

    this.addressTimeout = setTimeout(() => {
      this.fetchingAddress = true;

      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.formData.address)}`
      )
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);

            this.formData.location = { lat, lng };
            this.addressError = '';
            this.updateMap(lat, lng);
          } else {
            this.addressError = '⚠️ Unable to find location.';
          }
        })
        .catch(() => {
          this.addressError = '❌ Address lookup failed.';
        })
        .finally(() => {
          this.fetchingAddress = false;
        });
    }, 1000);
  }

  // 🖼️ Image preview
  onFileChange(event: any) {
    const files: File[] = Array.from(event.target.files);
    this.formData.photos = files;
    this.previews = files.map(file => URL.createObjectURL(file));
  }

  // 🗺️ Map Init
  initMap() {
    if (this.map) return;

    this.map = L.map('map').setView([13.0827, 80.2707], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      this.formData.location = e.latlng;
      this.updateMarker(e.latlng.lat, e.latlng.lng);
    });
  }

  updateMap(lat: number, lng: number) {
    this.map.setView([lat, lng], 15);
    this.updateMarker(lat, lng);
  }

  updateMarker(lat: number, lng: number) {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }
  }

  // 📤 Submit Complaint
  submit() {
    if (this.submitting) return;

    if (!this.formData.location) {
      alert('📍 Please select a location.');
      return;
    }

    this.submitting = true;

    const data = new FormData();
    data.append('title', this.formData.issueTitle);
    data.append('description', this.formData.description);
    data.append('category', this.formData.issueType);
    data.append('location', this.formData.address);
    data.append('latitude', String(this.formData.location.lat));
    data.append('longitude', String(this.formData.location.lng));
    data.append('priorityLevel', this.formData.priorityLevel);
    data.append('landmark', this.formData.landmark);

    this.formData.photos.forEach(photo => {
      data.append('photos', photo);
    });
this.http.post(`${this.API}/complaints`, data, {
  withCredentials: true
}).subscribe({
      next: () => {
        alert('✅ Complaint submitted successfully!');
        window.location.href = '/dashboard';
      },
      error: (err) => {
        alert(err.error?.message || '❌ Network error');
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }
}




    // this.http.post('http://localhost:5000/api/complaints', data, {
    //   withCredentials: true
    // })



// import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import * as L from 'leaflet';
// //import { environment } from '../../environments/environment';
// import { environment } from '../../../environments/environment.prod';

// /* FORCE LEAFLET ICON */

// delete (L.Icon.Default.prototype as any)._getIconUrl;

// const defaultIcon = L.icon({
//   iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
//   iconUrl: 'assets/leaflet/marker-icon.png',
//   shadowUrl: 'assets/leaflet/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });

// L.Marker.prototype.options.icon = defaultIcon;

// @Component({
//   selector: 'app-report-issue',
//   standalone: false,
//   templateUrl: './report-issue.component.html',
//   styleUrls: ['./report-issue.component.css']
// })
// export class ReportIssueComponent implements OnInit, AfterViewInit, OnDestroy {

//   API = environment.apiUrl;

//   formData = {
//     issueTitle: '',
//     issueType: '',
//     priorityLevel: '',
//     address: '',
//     landmark: '',
//     description: '',
//     location: null as { lat: number; lng: number } | null,
//     photos: [] as File[]
//   };

//   previews: string[] = [];
//   fetchingAddress = false;
//   addressError = '';
//   submitting = false;

//   map!: L.Map;
//   marker!: L.Marker;
//   addressTimeout: any;

//   constructor(private http: HttpClient) {}

//   ngOnInit(): void {}

//   ngAfterViewInit(): void {
//     this.initMap();
//   }

//   ngOnDestroy(): void {
//     if (this.addressTimeout) clearTimeout(this.addressTimeout);
//     if (this.map) this.map.remove();
//   }

//   /* ADDRESS → COORDINATES */
//   onAddressChange() {

//     if (!this.formData.address.trim()) return;

//     clearTimeout(this.addressTimeout);

//     this.addressTimeout = setTimeout(() => {

//       this.fetchingAddress = true;

//       fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.formData.address)}`
//       )
//         .then(res => res.json())
//         .then(data => {

//           if (data.length > 0) {

//             const lat = parseFloat(data[0].lat);
//             const lng = parseFloat(data[0].lon);

//             this.formData.location = { lat, lng };
//             this.addressError = '';

//             this.updateMap(lat, lng);

//           } else {
//             this.addressError = 'Location not found';
//           }

//         })
//         .catch(() => {
//           this.addressError = 'Address lookup failed';
//         })
//         .finally(() => {
//           this.fetchingAddress = false;
//         });

//     }, 1000);
//   }

//   /* IMAGE PREVIEW */

//   onFileChange(event: any) {

//     const files: File[] = Array.from(event.target.files || []);

//     this.formData.photos = files;

//     this.previews = files.map(file => URL.createObjectURL(file));
//   }

//   /* MAP INIT */

//   initMap() {

//     if (this.map) return;

//     this.map = L.map('map').setView([13.0827, 80.2707], 13);

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution: '© OpenStreetMap contributors'
//     }).addTo(this.map);

//     this.map.on('click', (e: any) => {

//       this.formData.location = e.latlng;

//       this.updateMarker(e.latlng.lat, e.latlng.lng);

//     });
//   }

//   updateMap(lat: number, lng: number) {

//     if (!this.map) return;

//     this.map.setView([lat, lng], 15);

//     this.updateMarker(lat, lng);
//   }

//   updateMarker(lat: number, lng: number) {

//     if (this.marker) {

//       this.marker.setLatLng([lat, lng]);

//     } else {

//       this.marker = L.marker([lat, lng]).addTo(this.map);

//     }
//   }

//   /* SUBMIT COMPLAINT */

//   submit() {

//     if (this.submitting) return;

//     if (!this.formData.location) {
//       alert('Please select a location');
//       return;
//     }

//     this.submitting = true;

//     const data = new FormData();

//     data.append('title', this.formData.issueTitle);
//     data.append('description', this.formData.description);
//     data.append('category', this.formData.issueType);
//     data.append('location', this.formData.address);
//     data.append('latitude', String(this.formData.location.lat));
//     data.append('longitude', String(this.formData.location.lng));
//     data.append('priorityLevel', this.formData.priorityLevel);
//     data.append('landmark', this.formData.landmark);

//     this.formData.photos.forEach(photo => {
//       data.append('photos', photo);
//     });

//     this.http.post(`${this.API}/complaints`, data, {
//       withCredentials: true
//     }).subscribe({

//       next: () => {
//         alert('Complaint submitted successfully');
//         window.location.href = '/dashboard';
//       },

//       error: (err) => {
//         alert(err?.error?.message || 'Network error');
//       },

//       complete: () => {
//         this.submitting = false;
//       }

//     });
//   }
// }