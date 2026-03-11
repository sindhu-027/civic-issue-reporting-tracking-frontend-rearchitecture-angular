// import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { io, Socket } from 'socket.io-client';
// //import { environment } from '../../../environments/environment.prod';

// @Component({
//   selector: 'app-dashboard',
//   standalone: false,
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css'],
//   encapsulation: ViewEncapsulation.None
// })
// export class DashboardComponent implements OnInit, OnDestroy {

//   user: any = null;
//   stats = {
//     total: 0,
//     pending: 0,
//     resolved: 0,
//     inProgress: 0,
//   };

//   myComplaints: any[] = [];
//   assignedComplaints: any[] = [];
//   nearbyComplaints: any[] = [];
//   viewingComplaint: any = null;

//   socket!: Socket;

//   API = 'http://localhost:5000/api';
//   SOCKET_URL = 'http://localhost:5000';
// //   API = environment.apiUrl;
//  // SOCKET_URL = environment.apiUrl;
//   //   API = environment.apiUrl; // UPDATED
//   // SOCKET_URL = environment.apiUrl.replace('/api', ''); // UPDATED

//   constructor(
//     private http: HttpClient,
//     public router: Router
//   ) {}

//   // ================= INIT =================
//   ngOnInit(): void {
//     this.fetchUser();
//     this.initSocket();
//   }

//   ngOnDestroy(): void {
//     if (this.socket) {
//       this.socket.disconnect();
//     }
//   }

//   // ================= SOCKET =================
//   initSocket() {
//     this.socket = io(this.SOCKET_URL, {
//       transports: ['websocket'],
//     });

//     this.socket.on('connect', () =>
//      console.log('🟢 Socket connected')
//     );

//     this.socket.on('newComplaint', () => this.fetchDashboardData());
//     this.socket.on('complaintUpdated', () => this.fetchDashboardData());
//     this.socket.on('complaintDeleted', () => this.fetchDashboardData());

//     this.socket.on('disconnect', () =>
//       console.log('🔴 Socket disconnected')
//     );
//   }

//   // ================= USER =================
//   fetchUser() {
//     this.http.get(`${this.API}/auth/profile`, { withCredentials: true })
//       .subscribe({
//         next: (data: any) => {
//           this.user = data;

//           if (this.user.role === 'admin') {
//             this.router.navigate(['/admin-dashboard']);
//             return;
//           }

//           this.fetchDashboardData();
//         },
//         error: () => this.router.navigate(['/login'])
//       });
//   }

//   // ================= DASHBOARD =================
//   fetchDashboardData() {
//     this.fetchStats();

//     if (this.user.role === 'volunteer') {
//       this.fetchAssigned();
//       this.fetchNearby();
//     } else {
//       this.fetchMyComplaints();
//     }
//   }

//   fetchStats() {
//     this.http.get<any>(`${this.API}/complaints/stats`, { withCredentials: true })
//       .subscribe(res => {
//         this.stats = {
//           total: res.total || 0,
//           pending: res.pending || 0,
//           resolved: res.resolved || 0,
//           inProgress: res.inProgress || 0,
//         };
//       });
//   }

//   fetchMyComplaints() {
//     this.http.get<any[]>(`${this.API}/complaints/my`, { withCredentials: true })
//       .subscribe(data => this.myComplaints = data || []);
//   }

//   fetchAssigned() {
//     this.http.get<any[]>(`${this.API}/complaints/assigned`, { withCredentials: true })
//       .subscribe(data => this.assignedComplaints = data || []);
//   }

//   // fetchNearby() {
//   //   navigator.geolocation.getCurrentPosition(pos => {
//   //     const lat = pos.coords.latitude;
//   //     const lng = pos.coords.longitude;

//   //     this.http.get<any[]>(
//   //       `${this.API}/complaints/nearby?latitude=${lat}&longitude=${lng}`,
//   //       { withCredentials: true }
//   //     ).subscribe(data => this.nearbyComplaints = data || []);
//   //   });
//   // }

// //   fetchNearby() {
// //   navigator.geolocation.getCurrentPosition(pos => {
// //     const lat = pos.coords.latitude;
// //     const lng = pos.coords.longitude;

// //     this.http.get<any[]>(
// //       `${this.API}/complaints/nearby?latitude=${lat}&longitude=${lng}`,
// //       { withCredentials: true }
// //     ).subscribe(data => {

// //       if (!data) {
// //         this.nearbyComplaints = [];
// //         return;
// //       }

// //       // Remove complaints already assigned
// //       //this.nearbyComplaints = data.filter(c => !c.volunteer);

// //       this.nearbyComplaints = data || [];

// //     });
// //   });
// // }


// fetchNearby() {

//   let lat = this.user?.lat;
//   let lng = this.user?.lng;

//   // If user location not saved, use GPS
//   if (!lat || !lng) {
//     navigator.geolocation.getCurrentPosition(pos => {
//       lat = pos.coords.latitude;
//       lng = pos.coords.longitude;

//       this.loadNearby(lat, lng);
//     });
//   } else {
//     this.loadNearby(lat, lng);
//   }
// }

// loadNearby(lat: number, lng: number) {
//   this.http.get<any[]>(
//     `${this.API}/complaints/nearby?latitude=${lat}&longitude=${lng}`,
//     { withCredentials: true }
//   ).subscribe(data => {
//     this.nearbyComplaints = data || [];
//   });
// }

//   // ================= VOLUNTEER ACTIONS =================
//   updateStatus(id: string, status: string) {
//     this.http.put(
//       `${this.API}/complaints/update-status/${id}`,
//       { status },
//       { withCredentials: true }
//     ).subscribe(() => this.fetchDashboardData());
//   }

//   assignToMe(id: string) {
//     this.http.put(
//       `${this.API}/complaints/${id}/self-assign`,
//       {},
//       { withCredentials: true }
//     ).subscribe(() => this.fetchDashboardData());
//   }

//   unassign(id: string) {
//     this.http.put(
//       `${this.API}/complaints/${id}/unassign`,
//       {},
//       { withCredentials: true }
//     ).subscribe(() => this.fetchDashboardData());
//   }

// //   viewComplaint(c: any) {
// //   alert(
// //     `Title: ${c.title}\n\nDescription: ${c.description}\n\nLocation: ${
// //       c.location?.address || c.location || 'Not specified'
// //     }`
// //   );
// // }

// viewComplaint(c: any) {
//   this.viewingComplaint = c;
// }

// closeComplaint() {
//   this.viewingComplaint = null;
// }

//   get complaints(): any[] {
//   return this.user?.role === 'volunteer'
//     ? this.assignedComplaints
//     : this.myComplaints;
// }


//   // ================= LOGOUT =================
//   logout() {
//     this.http.post(`${this.API}/auth/logout`, {}, { withCredentials: true })
//       .subscribe(() => {
//         localStorage.clear();
//         sessionStorage.clear();
//         this.router.navigate(['/']);
//       });
//   }
// }


 


import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {

  

  user: any = null;

  stats = {
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0,
  };

  myComplaints: any[] = [];
  assignedComplaints: any[] = [];
  nearbyComplaints: any[] = [];

  viewingComplaint: any = null;

  socket!: Socket;

  // API = 'http://localhost:5000/api';
  // SOCKET_URL = 'http://localhost:5000';

  API = environment.apiUrl;
SOCKET_URL = environment.socketUrl;

  constructor(
    private http: HttpClient,
    public router: Router
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.fetchUser();
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // ================= SOCKET =================
  initSocket() {

    this.socket = io(this.SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('🟢 Socket connected');
    });

    this.socket.on('newComplaint', () => this.fetchDashboardData());
    this.socket.on('complaintUpdated', () => this.fetchDashboardData());
    this.socket.on('complaintDeleted', () => this.fetchDashboardData());

    this.socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });

  }

  // ================= USER =================
  fetchUser() {

    this.http.get(`${this.API}/auth/profile`, { withCredentials: true })
      .subscribe({
        next: (data: any) => {

          this.user = data;

          if (this.user?.role === 'admin') {
            this.router.navigate(['/admin-dashboard']);
            return;
          }

          // start socket only after login
          this.initSocket();

          this.fetchDashboardData();
        },

        error: () => {
          this.router.navigate(['/login']);
        }

      });

  }

  // ================= DASHBOARD =================
  fetchDashboardData() {

    if (!this.user) return;

    this.fetchStats();

    if (this.user.role === 'volunteer') {

      this.fetchAssigned();
      this.fetchNearby();

    } else {

      this.fetchMyComplaints();

    }

  }


// ================= DASHBOARD =================
// fetchDashboardData() {

//   if (!this.user) return;

//   this.fetchStats();

//   const role = this.user?.role;

//   // Volunteer dashboard
//   if (role === 'volunteer') {

//     this.fetchAssigned();
//     this.fetchNearby();

//   }

//   // Normal user dashboard
//   else if (role === 'user') {

//     this.fetchMyComplaints();

//   }

// }

  // ================= STATS =================
  fetchStats() {

    this.http.get<any>(`${this.API}/complaints/stats`, { withCredentials: true })
      .subscribe(res => {

        this.stats = {
          total: res?.total || 0,
          pending: res?.pending || 0,
          resolved: res?.resolved || 0,
          inProgress: res?.inProgress || 0
        };

      });

  }

  // ================= USER COMPLAINTS =================
  fetchMyComplaints() {

    this.http.get<any[]>(`${this.API}/complaints/my`, { withCredentials: true })
      .subscribe(data => {

        this.myComplaints = data || [];

      });

  }

  // ================= ASSIGNED =================
  fetchAssigned() {

    this.http.get<any[]>(`${this.API}/complaints/assigned`, { withCredentials: true })
      .subscribe(data => {

        this.assignedComplaints = data || [];

      });

  }

  // ================= NEARBY =================
  fetchNearby() {

    let lat = this.user?.lat;
    let lng = this.user?.lng;

    if (!lat || !lng) {

      navigator.geolocation.getCurrentPosition(pos => {

        lat = pos.coords.latitude;
        lng = pos.coords.longitude;

        this.loadNearby(lat, lng);

      });

    } else {

      this.loadNearby(lat, lng);

    }

  }

  loadNearby(lat: number, lng: number) {

    this.http.get<any[]>(
      `${this.API}/complaints/nearby?latitude=${lat}&longitude=${lng}`,
      { withCredentials: true }
    ).subscribe(data => {

      this.nearbyComplaints = data || [];

    });

  }

  // ================= VOLUNTEER ACTIONS =================
  updateStatus(id: string, status: string) {

    this.http.put(
      `${this.API}/complaints/update-status/${id}`,
      { status },
      { withCredentials: true }
    ).subscribe(() => this.fetchDashboardData());

  }

  assignToMe(id: string) {

    this.http.put(
      `${this.API}/complaints/${id}/self-assign`,
      {},
      { withCredentials: true }
    ).subscribe(() => this.fetchDashboardData());

  }

  unassign(id: string) {

    this.http.put(
      `${this.API}/complaints/${id}/unassign`,
      {},
      { withCredentials: true }
    ).subscribe(() => this.fetchDashboardData());

  }

  // ================= VIEW COMPLAINT =================
  viewComplaint(c: any) {

    this.viewingComplaint = c;

  }

  closeComplaint() {

    this.viewingComplaint = null;

  }

  get complaints(): any[] {

    if (!this.user) return [];

    return this.user.role === 'volunteer'
      ? this.assignedComplaints
      : this.myComplaints;

  }

  // ================= LOGOUT =================
  logout() {

    this.http.post(`${this.API}/auth/logout`, {}, { withCredentials: true })
      .subscribe(() => {

        localStorage.clear();
        sessionStorage.clear();

        this.router.navigate(['/']);

      });

  }

}






// import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { io, Socket } from 'socket.io-client';
// //import { environment } from '../../environments/environment'; // UPDATED
// import { environment } from '../../../environments/environment.prod';

// @Component({
//   selector: 'app-dashboard',
//   standalone: false,
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css'],
//   encapsulation: ViewEncapsulation.None
// })
// export class DashboardComponent implements OnInit, OnDestroy {

//   user: any = null;

//   stats = {
//     total: 0,
//     pending: 0,
//     resolved: 0,
//     inProgress: 0,
//   };

//   myComplaints: any[] = [];
//   assignedComplaints: any[] = [];
//   nearbyComplaints: any[] = [];

//   viewingComplaint: any = null;

//   socket!: Socket;

//   API = environment.apiUrl; // UPDATED
//   SOCKET_URL = environment.apiUrl.replace('/api', ''); // UPDATED

//   constructor(
//     private http: HttpClient,
//     public router: Router
//   ) {}

//   // ================= INIT =================
//   ngOnInit(): void {
//     this.fetchUser();
//     this.initSocket();
//   }

//   ngOnDestroy(): void {
//     if (this.socket) {
//       this.socket.disconnect();
//     }
//   }

//   // ================= SOCKET =================
//   initSocket() {

//     this.socket = io(this.SOCKET_URL, {  // UPDATED
//       transports: ['websocket']
//     });

//     this.socket.on('connect', () => {
//       console.log('Socket connected'); // UPDATED
//     });

//     this.socket.on('newComplaint', () => this.fetchDashboardData());
//     this.socket.on('complaintUpdated', () => this.fetchDashboardData());
//     this.socket.on('complaintDeleted', () => this.fetchDashboardData());

//     this.socket.on('disconnect', () => {
//       console.log('Socket disconnected'); // UPDATED
//     });
//   }

//   // ================= USER =================
//   fetchUser() {

//     this.http.get(`${this.API}/auth/profile`, { withCredentials: true })
//       .subscribe({

//         next: (data: any) => {

//           this.user = data;

//           if (this.user.role === 'admin') {
//             this.router.navigate(['/admin-dashboard']);
//             return;
//           }

//           this.fetchDashboardData();
//         },

//         error: () => {
//           this.router.navigate(['/login']);
//         }

//       });
//   }

//   // ================= DASHBOARD =================
//   fetchDashboardData() {

//     this.fetchStats();

//     if (!this.user) return; // UPDATED

//     if (this.user.role === 'volunteer') {

//       this.fetchAssigned();
//       this.fetchNearby();

//     } else {

//       this.fetchMyComplaints();

//     }
//   }

//   fetchStats() {

//     this.http.get<any>(`${this.API}/complaints/stats`, { withCredentials: true })
//       .subscribe(res => {

//         this.stats = {
//           total: res?.total || 0, // UPDATED
//           pending: res?.pending || 0, // UPDATED
//           resolved: res?.resolved || 0, // UPDATED
//           inProgress: res?.inProgress || 0 // UPDATED
//         };

//       });
//   }

//   fetchMyComplaints() {

//     this.http.get<any[]>(`${this.API}/complaints/my`, { withCredentials: true })
//       .subscribe(data => {
//         this.myComplaints = data || [];
//       });
//   }

//   fetchAssigned() {

//     this.http.get<any[]>(`${this.API}/complaints/assigned`, { withCredentials: true })
//       .subscribe(data => {
//         this.assignedComplaints = data || [];
//       });
//   }

//   // ================= NEARBY =================
//   fetchNearby() {

//     let lat = this.user?.lat;
//     let lng = this.user?.lng;

//     if (!lat || !lng) {

//       navigator.geolocation.getCurrentPosition(pos => {

//         lat = pos.coords.latitude;
//         lng = pos.coords.longitude;

//         this.loadNearby(lat, lng);

//       });

//     } else {

//       this.loadNearby(lat, lng);

//     }
//   }

//   loadNearby(lat: number, lng: number) {

//     this.http.get<any[]>(
//       `${this.API}/complaints/nearby?latitude=${lat}&longitude=${lng}`,
//       { withCredentials: true }
//     ).subscribe(data => {

//       this.nearbyComplaints = data || [];

//     });
//   }

//   // ================= VOLUNTEER ACTIONS =================
//   updateStatus(id: string, status: string) {

//     this.http.put(
//       `${this.API}/complaints/update-status/${id}`,
//       { status },
//       { withCredentials: true }
//     ).subscribe(() => this.fetchDashboardData());

//   }

//   assignToMe(id: string) {

//     this.http.put(
//       `${this.API}/complaints/${id}/self-assign`,
//       {},
//       { withCredentials: true }
//     ).subscribe(() => this.fetchDashboardData());

//   }

//   unassign(id: string) {

//     this.http.put(
//       `${this.API}/complaints/${id}/unassign`,
//       {},
//       { withCredentials: true }
//     ).subscribe(() => this.fetchDashboardData());

//   }

//   // ================= VIEW COMPLAINT =================
//   viewComplaint(c: any) {
//     this.viewingComplaint = c;
//   }

//   closeComplaint() {
//     this.viewingComplaint = null;
//   }

//   get complaints(): any[] {

//     return this.user?.role === 'volunteer'
//       ? this.assignedComplaints
//       : this.myComplaints;

//   }

//   // ================= LOGOUT =================
//   logout() {

//     this.http.post(`${this.API}/auth/logout`, {}, { withCredentials: true })
//       .subscribe(() => {

//         localStorage.clear();
//         sessionStorage.clear();

//         this.router.navigate(['/']);

//       });
//   }

// }


















// import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { io, Socket } from 'socket.io-client';
// //import { environment } from '../../../environments/environment';
// import { environment } from '../../../environments/environment.prod';

// @Component({
//   selector: 'app-dashboard',
//   standalone: false,
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css'],
//   encapsulation: ViewEncapsulation.None
// })
// export class DashboardComponent implements OnInit, OnDestroy {

//   user: any = null;

//   stats = {
//     total: 0,
//     pending: 0,
//     resolved: 0,
//     inProgress: 0,
//   };

//   myComplaints: any[] = [];
//   assignedComplaints: any[] = [];
//   nearbyComplaints: any[] = [];

//   viewingComplaint: any = null;

//   socket!: Socket;

//   API = environment.apiUrl;
//   SOCKET_URL = environment.apiUrl.replace('/api', '');

//   constructor(
//     private http: HttpClient,
//     public router: Router
//   ) {}

//   // ================= INIT =================
//   ngOnInit(): void {
//     this.fetchUser();
//   }

//   ngOnDestroy(): void {
//     if (this.socket) {
//       this.socket.disconnect();
//     }
//   }

//   // ================= SOCKET =================
//   initSocket() {

//     this.socket = io(this.SOCKET_URL, {
//       transports: ['websocket'],
//       withCredentials: true
//     });

//     this.socket.on('connect', () => {
//       console.log('🟢 Socket connected');
//     });

//     this.socket.on('newComplaint', () => this.fetchDashboardData());
//     this.socket.on('complaintUpdated', () => this.fetchDashboardData());
//     this.socket.on('complaintDeleted', () => this.fetchDashboardData());

//     this.socket.on('disconnect', () => {
//       console.log('🔴 Socket disconnected');
//     });
//   }

//   // ================= USER =================
//   fetchUser() {

//     this.http.get(`${this.API}/auth/profile`, { withCredentials: true })
//       .subscribe({
//         next: (data: any) => {

//           this.user = data;

//           if (this.user.role === 'admin') {
//             this.router.navigate(['/admin-dashboard']);
//             return;
//           }

//           // start socket after login
//           this.initSocket();

//           this.fetchDashboardData();
//         },

//         error: () => this.router.navigate(['/login'])
//       });

//   }

//   // ================= DASHBOARD =================
//   fetchDashboardData() {

//     this.fetchStats();

//     if (this.user?.role === 'volunteer') {
//       this.fetchAssigned();
//       this.fetchNearby();
//     } else {
//       this.fetchMyComplaints();
//     }

//   }

//   // ================= STATS =================
//   fetchStats() {

//     this.http.get<any>(`${this.API}/complaints/stats`, { withCredentials: true })
//       .subscribe(res => {

//         this.stats = {
//           total: res?.total || 0,
//           pending: res?.pending || 0,
//           resolved: res?.resolved || 0,
//           inProgress: res?.inProgress || 0,
//         };

//       });

//   }

//   // ================= USER COMPLAINTS =================
//   fetchMyComplaints() {

//     this.http.get<any[]>(`${this.API}/complaints/my`, { withCredentials: true })
//       .subscribe(data => {
//         this.myComplaints = data || [];
//       });

//   }

//   // ================= ASSIGNED =================
//   fetchAssigned() {

//     this.http.get<any[]>(`${this.API}/complaints/assigned`, { withCredentials: true })
//       .subscribe(data => {
//         this.assignedComplaints = data || [];
//       });

//   }

//   // ================= NEARBY =================
//   fetchNearby() {

//     let lat = this.user?.lat;
//     let lng = this.user?.lng;

//     if (!lat || !lng) {

//       navigator.geolocation.getCurrentPosition(pos => {

//         lat = pos.coords.latitude;
//         lng = pos.coords.longitude;

//         this.loadNearby(lat, lng);

//       });

//     } else {
//       this.loadNearby(lat, lng);
//     }

//   }

//   loadNearby(lat: number, lng: number) {

//     this.http.get<any[]>(
//       `${this.API}/complaints/nearby?latitude=${lat}&longitude=${lng}`,
//       { withCredentials: true }
//     ).subscribe(data => {

//       if (!data) {
//         this.nearbyComplaints = [];
//         return;
//       }

//       // Remove already assigned complaints
//       this.nearbyComplaints = data.filter(c => !c.volunteer);

//     });

//   }

//   // ================= VOLUNTEER ACTIONS =================
//   updateStatus(id: string, status: string) {

//     this.http.put(
//       `${this.API}/complaints/update-status/${id}`,
//       { status },
//       { withCredentials: true }
//     ).subscribe(() => this.fetchDashboardData());

//   }

//   assignToMe(id: string) {

//     this.http.put(
//       `${this.API}/complaints/${id}/self-assign`,
//       {},
//       { withCredentials: true }
//     ).subscribe(() => this.fetchDashboardData());

//   }

//   unassign(id: string) {

//     this.http.put(
//       `${this.API}/complaints/${id}/unassign`,
//       {},
//       { withCredentials: true }
//     ).subscribe(() => this.fetchDashboardData());

//   }

//   // ================= VIEW COMPLAINT =================
//   viewComplaint(c: any) {
//     this.viewingComplaint = c;
//   }

//   closeComplaint() {
//     this.viewingComplaint = null;
//   }

//   get complaints(): any[] {

//     if (!this.user) return [];

//     return this.user.role === 'volunteer'
//       ? this.assignedComplaints
//       : this.myComplaints;

//   }

//   // ================= LOGOUT =================
//   logout() {

//     this.http.post(`${this.API}/auth/logout`, {}, { withCredentials: true })
//       .subscribe(() => {

//         localStorage.clear();
//         sessionStorage.clear();

//         this.router.navigate(['/']);

//       });

//   }

// }