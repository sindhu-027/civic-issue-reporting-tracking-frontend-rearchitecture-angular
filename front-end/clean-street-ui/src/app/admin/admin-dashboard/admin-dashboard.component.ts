// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { ApiService } from '../../shared/api.service';
// import { environment } from '../../../environments/environment';

// import {
//   Chart,
//   ChartConfiguration,
//   ChartTypeRegistry,
//   registerables
// } from 'chart.js';

// import {
//   faUsers,
//   faUserTie,
//   faExclamationCircle,
//   faCheckCircle,
//   faTrash,
//   faEdit,
//   faUserCircle,
// } from '@fortawesome/free-solid-svg-icons';

// Chart.register(...registerables);

// @Component({
//   selector: 'app-admin-dashboard',
//   standalone: false,
//   templateUrl: './admin-dashboard.component.html',
//   styleUrls: ['./admin-dashboard.component.css']
// })
// export class AdminDashboardComponent implements OnInit {

//     /* ---------------- ICONS ---------------- */
//     icons = {
//       users: faUsers,
//       volunteer: faUserTie,
//       complaint: faExclamationCircle,
//       resolved: faCheckCircle,
//       delete: faTrash,
//       edit: faEdit,
//       profile: faUserCircle
//     };

//   /* ---------------- NAV ---------------- */
//   user: any = null;
//   activeTab: 'overview' | 'manageUsers' | 'viewComplaints' = 'overview';

//   /* ---------------- DATA ---------------- */
//   users: any[] = [];
//   complaints: any[] = [];
//   complaintList: any[] = [];

//   stats = {
//     totalUsers: 0,
//     volunteers: 0,
//     complaints: 0,
//     resolved: 0
//   };

//   monthlyStats: any = {
//     complaints: {},
//     userVsVolunteer: {}
//   };

//   statusDistribution: Record<string, number> = {};

//   /* ---------------- CHARTS (STRICT TYPES) ---------------- */
//   complaintTrendChart!: Chart<'line', number[], string>;
//   userVsVolunteerChart!: Chart<'bar', number[], string>;
//   statusChart!: Chart<'pie', number[], string>;

//   /* ---------------- MANAGE USERS ---------------- */
//   filterLocation = 'all';
//   filterRole = 'all';
//   searchLocation = '';
//   editUserId: string | null = null;
//   editedRole = '';

//   //nearbyVolunteers: Record<string, any[]> = {};
//   nearbyVolunteers: { [key: string]: any[] } = {};

//   constructor(private api: ApiService, private router: Router) {}

//   ngOnInit(): void {
//     this.fetchUser();
//     this.fetchAdminData();
//   }

//   /* ---------------- NAV ACTIONS ---------------- */
//   goToProfile() {
//     this.router.navigate(['/profile']);
//   }

//   logout() {
//     localStorage.clear();
//     this.router.navigate(['/login']);
//   }

//   generateReport() {
//     window.open(`${environment.apiUrl}/complaints/monthly-report`, '_blank');
//   }
   

//     // generateReport() {
//     // const link = document.createElement('a');
//     // link.href = '/api/complaints/monthly-report';
//     // link.download = 'monthly-complaint-report.pdf';
//     // link.click();
//     // }


//   /* ---------------- FETCH USER ---------------- */
//   async fetchUser() {
//     try {
//       this.user = await this.api.get('/auth/profile').toPromise();
//     } catch {
//       const stored = localStorage.getItem('user');
//       if (stored) this.user = JSON.parse(stored);
//     }
//   }

//   /* ---------------- FETCH DATA ---------------- */
//   async fetchAdminData() {
//     try {
//       const [usersRes, complaintsRes, statsRes, monthlyRes]: any =
//         await Promise.all([
//           this.api.get('/auth/all').toPromise(),
//           this.api.get('/complaints/all').toPromise(),
//           this.api.get('/complaints/admin-overview').toPromise(),
//           this.api.get('/complaints/monthly-stats').toPromise()
//         ]);

//       this.users = usersRes || [];
//       this.complaints = complaintsRes || [];
//       this.complaintList = [...this.complaints];

//       this.stats = {
//         totalUsers: statsRes.totalUsers || 0,
//         volunteers: statsRes.volunteers || 0,
//         complaints: statsRes.totalComplaints || 0,
//         resolved: statsRes.resolved || 0
//       };

//       this.monthlyStats = monthlyRes || {};

//       this.statusDistribution = this.complaints.reduce((acc: any, c: any) => {
//         const status = (c.status || 'pending').toLowerCase();
//         acc[status] = (acc[status] || 0) + 1;
//         return acc;
//       }, {});

//       setTimeout(() => {
//         this.createUserVsVolunteerChart();
//         this.createStatusChart();
//         this.createComplaintTrendChart();
//       });

//     } catch (err) {
//       console.error(err);
//     }
//   }

//   /* ---------------- CHARTS (NO TYPE ERRORS) ---------------- */

//   createComplaintTrendChart() {
//     if (this.complaintTrendChart) this.complaintTrendChart.destroy();

//     const labels = Object.keys(this.monthlyStats.complaints || {});
//     const data = Object.values(this.monthlyStats.complaints || {}) as number[];

//     const config: ChartConfiguration<'line', number[], string> = {
//       type: 'line',
//       data: {
//         labels,
//         datasets: [{
//           label: 'Complaints',
//           data,
//           borderColor: '#3b82f6',
//           backgroundColor: 'rgba(59,130,246,0.2)',
//           tension: 0.3
//         }]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false
//       }
//     };

//     this.complaintTrendChart = new Chart('complaintTrendChart', config);
//   }

//   createUserVsVolunteerChart() {
//     if (this.userVsVolunteerChart) this.userVsVolunteerChart.destroy();

//     const labels = Object.keys(this.monthlyStats.userVsVolunteer || {});
//     const users = labels.map(m => this.monthlyStats.userVsVolunteer[m]?.users || 0);
//     const volunteers = labels.map(m => this.monthlyStats.userVsVolunteer[m]?.volunteers || 0);

//     const config: ChartConfiguration<'bar', number[], string> = {
//       type: 'bar',
//       data: {
//         labels,
//         datasets: [
//           { label: 'Users', data: users, backgroundColor: '#2563eb' },
//           { label: 'Volunteers', data: volunteers, backgroundColor: '#16a34a' }
//         ]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false
//       }
//     };

//     this.userVsVolunteerChart = new Chart('userVsVolunteerChart', config);
//   }

//   createStatusChart() {
//     if (this.statusChart) this.statusChart.destroy();

//     const config: ChartConfiguration<'pie', number[], string> = {
//       type: 'pie',
//       data: {
//         labels: Object.keys(this.statusDistribution),
//         datasets: [{
//           data: Object.values(this.statusDistribution),
//           backgroundColor: ['#ef4444', '#eab308', '#3b82f6', '#22c55e']
//         }]
//       }
//     };

//     this.statusChart = new Chart('statusChart', config);
//   }

//   /* ---------------- MANAGE USERS ---------------- */
//   get filteredUsers() {
//     return this.users.filter(u => {
//       const loc =
//         this.filterLocation === 'all' || u.address === this.filterLocation;
//       const role =
//         this.filterRole === 'all' || u.role === this.filterRole;
//       const search =
//         !this.searchLocation ||
//         u.address?.toLowerCase().includes(this.searchLocation.toLowerCase());
//       return loc && role && search;
//     });
//   }

  

//   get locations(): string[] {
//   return Array.from(
//     new Set(this.users.map(u => u.address).filter(Boolean))
//   );
// }


//   async saveRole(userId: string) {
//     await this.api.put('/complaints/updateRole', {
//       userId,
//       role: this.editedRole
//     }).toPromise();

//     this.users = this.users.map(u =>
//       u._id === userId ? { ...u, role: this.editedRole } : u
//     );

//     this.editUserId = null;
//   }

//   roleColors: Record<string, string> = {
//   admin: 'bg-red-100 text-red-700',
//   volunteer: 'bg-blue-100 text-blue-700',
//   user: 'bg-green-100 text-green-700'
// };


//   /* ---------------- COMPLAINTS ---------------- */
//   async updateStatus(id: string, status: string) {
//     await this.api.put(`/complaints/update-status/${id}`, { status }).toPromise();
//     this.complaintList = this.complaintList.map(c =>
//       c._id === id ? { ...c, status } : c
//     );
//   }

//   async deleteComplaint(id: string) {
//     if (!confirm('Delete complaint?')) return;
//     await this.api.delete(`/complaints/${id}`).toPromise();
//     this.complaintList = this.complaintList.filter(c => c._id !== id);
//   }

//   async fetchNearbyVolunteers(id: string) {
//     const res: any =
//       await this.api.get(`/complaints/${id}/nearby-volunteers`).toPromise();
//     this.nearbyVolunteers[id] = res || [];
//   }

//   async assignVolunteer(complaintId: string, volunteerId: string) {
//     const res: any =
//       await this.api.put(`/complaints/${complaintId}/assign`, { volunteerId }).toPromise();

//     this.complaintList = this.complaintList.map(c =>
//       c._id === complaintId ? res.complaint : c
//     );

//     this.nearbyVolunteers[complaintId] = [];
//   }
// }


//prod....................


// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { ApiService } from '../../shared/api.service';
// //import { environment } from '../../../environments/environment';
// import { environment } from '../../../environments/environment.prod';

// import {
//   Chart,
//   ChartConfiguration,
//   registerables
// } from 'chart.js';

// import {
//   faUsers,
//   faUserTie,
//   faExclamationCircle,
//   faCheckCircle,
//   faTrash,
//   faEdit,
//   faUserCircle
// } from '@fortawesome/free-solid-svg-icons';

// Chart.register(...registerables);

// @Component({
//   selector: 'app-admin-dashboard',
//   standalone: false,
//   templateUrl: './admin-dashboard.component.html',
//   styleUrls: ['./admin-dashboard.component.css']
// })
// export class AdminDashboardComponent implements OnInit {

//   /* ---------------- ICONS ---------------- */
//   icons = {
//     users: faUsers,
//     volunteer: faUserTie,
//     complaint: faExclamationCircle,
//     resolved: faCheckCircle,
//     delete: faTrash,
//     edit: faEdit,
//     profile: faUserCircle
//   };

//   /* ---------------- NAV ---------------- */
//   user: any = null;
//   activeTab: 'overview' | 'manageUsers' | 'viewComplaints' = 'overview';

//   /* ---------------- DATA ---------------- */
//   users: any[] = [];
//   complaints: any[] = [];
//   complaintList: any[] = [];

//   stats = {
//     totalUsers: 0,
//     volunteers: 0,
//     complaints: 0,
//     resolved: 0
//   };

//   monthlyStats: any = {
//     complaints: {},
//     userVsVolunteer: {}
//   };

//   statusDistribution: Record<string, number> = {};

//   /* ---------------- CHARTS ---------------- */
//   complaintTrendChart!: Chart<'line', number[], string>;
//   userVsVolunteerChart!: Chart<'bar', number[], string>;
//   statusChart!: Chart<'pie', number[], string>;

//   /* ---------------- MANAGE USERS ---------------- */
//   filterLocation = 'all';
//   filterRole = 'all';
//   searchLocation = '';
//   editUserId: string | null = null;
//   editedRole = '';

//   nearbyVolunteers: { [key: string]: any[] } = {};

//   constructor(private api: ApiService, private router: Router) {}

//   ngOnInit(): void {
//     this.fetchUser();
//     this.fetchAdminData();
//   }

//   /* ---------------- NAV ACTIONS ---------------- */

//   goToProfile() {
//     this.router.navigate(['/profile']);
//   }

//   logout() {
//     localStorage.clear();
//     sessionStorage.clear(); // UPDATED
//     this.router.navigate(['/login']);
//   }

//   generateReport() {
//     window.open(`${environment.apiUrl}/complaints/monthly-report`, '_blank');
//   }

//   /* ---------------- FETCH USER ---------------- */

//   async fetchUser() {

//     try {

//       this.user = await this.api.get('/auth/profile').toPromise();

//       if (!this.user || this.user.role !== 'admin') { // UPDATED
//         this.router.navigate(['/login']);
//       }

//     } catch {

//       const stored = localStorage.getItem('user');

//       if (stored) {
//         this.user = JSON.parse(stored);
//       } else {
//         this.router.navigate(['/login']); // UPDATED
//       }

//     }
//   }

//   /* ---------------- FETCH DATA ---------------- */

//   async fetchAdminData() {

//     try {

//       const [usersRes, complaintsRes, statsRes, monthlyRes]: any =
//         await Promise.all([
//           this.api.get('/auth/all').toPromise(),
//           this.api.get('/complaints/all').toPromise(),
//           this.api.get('/complaints/admin-overview').toPromise(),
//           this.api.get('/complaints/monthly-stats').toPromise()
//         ]);

//       this.users = usersRes || [];
//       this.complaints = complaintsRes || [];
//       this.complaintList = [...this.complaints];

//       this.stats = {
//         totalUsers: statsRes?.totalUsers || 0, // UPDATED
//         volunteers: statsRes?.volunteers || 0, // UPDATED
//         complaints: statsRes?.totalComplaints || 0, // UPDATED
//         resolved: statsRes?.resolved || 0 // UPDATED
//       };

//       this.monthlyStats = monthlyRes || {};

//       this.statusDistribution = this.complaints.reduce((acc: any, c: any) => {

//         const status = (c.status || 'pending').toLowerCase();

//         acc[status] = (acc[status] || 0) + 1;

//         return acc;

//       }, {});

//       setTimeout(() => {

//         this.createUserVsVolunteerChart();
//         this.createStatusChart();
//         this.createComplaintTrendChart();

//       });

//     } catch (err) {

//       console.error('Admin data fetch error', err); // UPDATED

//     }
//   }

//   /* ---------------- CHARTS ---------------- */

//   createComplaintTrendChart() {

//     if (this.complaintTrendChart) this.complaintTrendChart.destroy();

//     const labels = Object.keys(this.monthlyStats?.complaints || {});
//     const data = Object.values(this.monthlyStats?.complaints || {}) as number[];

//     const config: ChartConfiguration<'line', number[], string> = {

//       type: 'line',

//       data: {
//         labels,
//         datasets: [{
//           label: 'Complaints',
//           data,
//           borderColor: '#3b82f6',
//           backgroundColor: 'rgba(59,130,246,0.2)',
//           tension: 0.3
//         }]
//       },

//       options: {
//         responsive: true,
//         maintainAspectRatio: false
//       }

//     };

//     this.complaintTrendChart = new Chart('complaintTrendChart', config);
//   }

//   createUserVsVolunteerChart() {

//     if (this.userVsVolunteerChart) this.userVsVolunteerChart.destroy();

//     const labels = Object.keys(this.monthlyStats?.userVsVolunteer || {});

//     const users = labels.map(
//       m => this.monthlyStats?.userVsVolunteer?.[m]?.users || 0
//     );

//     const volunteers = labels.map(
//       m => this.monthlyStats?.userVsVolunteer?.[m]?.volunteers || 0
//     );

//     const config: ChartConfiguration<'bar', number[], string> = {

//       type: 'bar',

//       data: {
//         labels,
//         datasets: [
//           { label: 'Users', data: users, backgroundColor: '#2563eb' },
//           { label: 'Volunteers', data: volunteers, backgroundColor: '#16a34a' }
//         ]
//       },

//       options: {
//         responsive: true,
//         maintainAspectRatio: false
//       }

//     };

//     this.userVsVolunteerChart = new Chart('userVsVolunteerChart', config);
//   }

//   createStatusChart() {

//     if (this.statusChart) this.statusChart.destroy();

//     const config: ChartConfiguration<'pie', number[], string> = {

//       type: 'pie',

//       data: {
//         labels: Object.keys(this.statusDistribution),
//         datasets: [{
//           data: Object.values(this.statusDistribution),
//           backgroundColor: ['#ef4444', '#eab308', '#3b82f6', '#22c55e']
//         }]
//       }

//     };

//     this.statusChart = new Chart('statusChart', config);
//   }

//   /* ---------------- USERS FILTER ---------------- */

//   get filteredUsers() {

//     return this.users.filter(u => {

//       const loc =
//         this.filterLocation === 'all' || u.address === this.filterLocation;

//       const role =
//         this.filterRole === 'all' || u.role === this.filterRole;

//       const search =
//         !this.searchLocation ||
//         u.address?.toLowerCase().includes(this.searchLocation.toLowerCase());

//       return loc && role && search;

//     });

//   }

//   get locations(): string[] {

//     return Array.from(
//       new Set(this.users.map(u => u.address).filter(Boolean))
//     );

//   }

//   async saveRole(userId: string) {

//     await this.api.put('/complaints/updateRole', {
//       userId,
//       role: this.editedRole
//     }).toPromise();

//     this.users = this.users.map(u =>
//       u._id === userId ? { ...u, role: this.editedRole } : u
//     );

//     this.editUserId = null;

//   }

//   roleColors: Record<string, string> = {
//     admin: 'bg-red-100 text-red-700',
//     volunteer: 'bg-blue-100 text-blue-700',
//     user: 'bg-green-100 text-green-700'
//   };

//   /* ---------------- COMPLAINT ACTIONS ---------------- */

//   async updateStatus(id: string, status: string) {

//     await this.api.put(`/complaints/update-status/${id}`, { status }).toPromise();

//     this.complaintList = this.complaintList.map(c =>
//       c._id === id ? { ...c, status } : c
//     );

//   }

//   async deleteComplaint(id: string) {

//     if (!confirm('Delete complaint?')) return;

//     await this.api.delete(`/complaints/${id}`).toPromise();

//     this.complaintList =
//       this.complaintList.filter(c => c._id !== id);

//   }

//   async fetchNearbyVolunteers(id: string) {

//     const res: any =
//       await this.api.get(`/complaints/${id}/nearby-volunteers`).toPromise();

//     this.nearbyVolunteers[id] = res || [];

//   }

//   async assignVolunteer(complaintId: string, volunteerId: string) {

//     const res: any =
//       await this.api.put(`/complaints/${complaintId}/assign`, { volunteerId }).toPromise();

//     this.complaintList = this.complaintList.map(c =>
//       c._id === complaintId ? res?.complaint : c
//     );

//     this.nearbyVolunteers[complaintId] = [];

//   }

// }













//with socket

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/api.service';
import { SocketService } from '../../shared/socket.service'; // SOCKET ADDED
import { Socket } from 'socket.io-client'; // SOCKET ADDED
import { environment } from '../../../environments/environment.prod';

import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';

import {
  faUsers,
  faUserTie,
  faExclamationCircle,
  faCheckCircle,
  faTrash,
  faEdit,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  /* ---------------- ICONS ---------------- */

  icons = {
    users: faUsers,
    volunteer: faUserTie,
    complaint: faExclamationCircle,
    resolved: faCheckCircle,
    delete: faTrash,
    edit: faEdit,
    profile: faUserCircle
  };

  /* ---------------- SOCKET ---------------- */

  private socket!: Socket; // SOCKET ADDED

  /* ---------------- NAV ---------------- */

  user: any = null;
  activeTab: 'overview' | 'manageUsers' | 'viewComplaints' = 'overview';

  /* ---------------- DATA ---------------- */

  users: any[] = [];
  complaints: any[] = [];
  complaintList: any[] = [];

  stats = {
    totalUsers: 0,
    volunteers: 0,
    complaints: 0,
    resolved: 0
  };

  monthlyStats: any = {
    complaints: {},
    userVsVolunteer: {}
  };

  statusDistribution: Record<string, number> = {};

  /* ---------------- CHARTS ---------------- */

  complaintTrendChart!: Chart<'line', number[], string>;
  userVsVolunteerChart!: Chart<'bar', number[], string>;
  statusChart!: Chart<'pie', number[], string>;

  /* ---------------- USERS ---------------- */

  filterLocation = 'all';
  filterRole = 'all';
  searchLocation = '';
  editUserId: string | null = null;
  editedRole = '';

  nearbyVolunteers: { [key: string]: any[] } = {};

  roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    volunteer: 'bg-blue-100 text-blue-700',
    user: 'bg-green-100 text-green-700'
  };

  constructor(
    private api: ApiService,
    private socketService: SocketService, // SOCKET ADDED
    private router: Router
  ) {}

  /* ---------------- INIT ---------------- */

  ngOnInit(): void {

    this.fetchUser();
    this.fetchAdminData();
    this.initSocket(); // SOCKET ADDED

  }

  ngOnDestroy(): void {

    if (this.socket) {
      this.socket.off('newComplaint');
      this.socket.off('complaintUpdated');
      this.socket.off('complaintDeleted');
    }

  }

  /* ---------------- SOCKET ---------------- */

  initSocket() {

    this.socketService.connect();

    this.socket = this.socketService.getSocket();

    this.socket.on('newComplaint', (complaint: any) => {

      this.complaintList.unshift(complaint);
      this.complaints.unshift(complaint);

    });

    this.socket.on('complaintUpdated', (updated: any) => {

      this.complaintList = this.complaintList.map(c =>
        c._id === updated._id ? updated : c
      );

    });

    this.socket.on('complaintDeleted', (id: string) => {

      this.complaintList =
        this.complaintList.filter(c => c._id !== id);

    });

  }

  /* ---------------- NAV ---------------- */

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  generateReport() {
    window.open(`${environment.apiUrl}/complaints/monthly-report`, '_blank');
  }

  /* ---------------- FETCH USER ---------------- */

  async fetchUser() {

    try {

      this.user = await this.api.get('/auth/profile').toPromise();

      if (!this.user || this.user.role !== 'admin') {
        this.router.navigate(['/login']);
      }

    } catch {

      const stored = localStorage.getItem('user');

      if (stored) {
        this.user = JSON.parse(stored);
      } else {
        this.router.navigate(['/login']);
      }

    }

  }

  /* ---------------- FETCH DATA ---------------- */

  async fetchAdminData() {

    try {

      const [usersRes, complaintsRes, statsRes, monthlyRes]: any =
        await Promise.all([
          this.api.get('/auth/all').toPromise(),
          this.api.get('/complaints/all').toPromise(),
          this.api.get('/complaints/admin-overview').toPromise(),
          this.api.get('/complaints/monthly-stats').toPromise()
        ]);

      this.users = usersRes || [];
      this.complaints = complaintsRes || [];
      this.complaintList = [...this.complaints];

      this.stats = {
        totalUsers: statsRes?.totalUsers || 0,
        volunteers: statsRes?.volunteers || 0,
        complaints: statsRes?.totalComplaints || 0,
        resolved: statsRes?.resolved || 0
      };

      this.monthlyStats = monthlyRes || {};

      this.statusDistribution = this.complaints.reduce((acc: any, c: any) => {

        const status = (c.status || 'pending').toLowerCase();

        acc[status] = (acc[status] || 0) + 1;

        return acc;

      }, {});

      setTimeout(() => {

        this.createUserVsVolunteerChart();
        this.createStatusChart();
        this.createComplaintTrendChart();

      });

    } catch (err) {

      console.error('Admin data fetch error', err);

    }

  }

  /* ---------------- CHARTS ---------------- */

  createComplaintTrendChart() {

    if (this.complaintTrendChart) this.complaintTrendChart.destroy();

    const labels = Object.keys(this.monthlyStats?.complaints || {});
    const data = Object.values(this.monthlyStats?.complaints || {}) as number[];

    const config: ChartConfiguration<'line', number[], string> = {

      type: 'line',

      data: {
        labels,
        datasets: [{
          label: 'Complaints',
          data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.2)',
          tension: 0.3
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false
      }

    };

    this.complaintTrendChart = new Chart('complaintTrendChart', config);

  }

  createUserVsVolunteerChart() {

    if (this.userVsVolunteerChart) this.userVsVolunteerChart.destroy();

    const labels = Object.keys(this.monthlyStats?.userVsVolunteer || {});

    const users = labels.map(
      m => this.monthlyStats?.userVsVolunteer?.[m]?.users || 0
    );

    const volunteers = labels.map(
      m => this.monthlyStats?.userVsVolunteer?.[m]?.volunteers || 0
    );

    const config: ChartConfiguration<'bar', number[], string> = {

      type: 'bar',

      data: {
        labels,
        datasets: [
          { label: 'Users', data: users, backgroundColor: '#2563eb' },
          { label: 'Volunteers', data: volunteers, backgroundColor: '#16a34a' }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false
      }

    };

    this.userVsVolunteerChart =
      new Chart('userVsVolunteerChart', config);

  }

  createStatusChart() {

    if (this.statusChart) this.statusChart.destroy();

    const config: ChartConfiguration<'pie', number[], string> = {

      type: 'pie',

      data: {
        labels: Object.keys(this.statusDistribution),
        datasets: [{
          data: Object.values(this.statusDistribution),
          backgroundColor: ['#ef4444', '#eab308', '#3b82f6', '#22c55e']
        }]
      }

    };

    this.statusChart = new Chart('statusChart', config);

  }

  /* ---------------- USERS FILTER ---------------- */

  get filteredUsers() {

    return this.users.filter(u => {

      const loc =
        this.filterLocation === 'all' || u.address === this.filterLocation;

      const role =
        this.filterRole === 'all' || u.role === this.filterRole;

      const search =
        !this.searchLocation ||
        u.address?.toLowerCase().includes(this.searchLocation.toLowerCase());

      return loc && role && search;

    });

  }

  get locations(): string[] {

    return Array.from(
      new Set(this.users.map(u => u.address).filter(Boolean))
    );

  }

  async saveRole(userId: string) {

    await this.api.put('/complaints/updateRole', {
      userId,
      role: this.editedRole
    }).toPromise();

    this.users = this.users.map(u =>
      u._id === userId ? { ...u, role: this.editedRole } : u
    );

    this.editUserId = null;

  }

  /* ---------------- COMPLAINT ACTIONS ---------------- */

  async updateStatus(id: string, status: string) {

    await this.api.put(`/complaints/update-status/${id}`, { status }).toPromise();

    this.complaintList = this.complaintList.map(c =>
      c._id === id ? { ...c, status } : c
    );

  }

  async deleteComplaint(id: string) {

    if (!confirm('Delete complaint?')) return;

    await this.api.delete(`/complaints/${id}`).toPromise();

    this.complaintList =
      this.complaintList.filter(c => c._id !== id);

  }

  async fetchNearbyVolunteers(id: string) {

    const res: any =
      await this.api.get(`/complaints/${id}/nearby-volunteers`).toPromise();

    this.nearbyVolunteers[id] = res || [];

  }

  async assignVolunteer(complaintId: string, volunteerId: string) {

    const res: any =
      await this.api.put(`/complaints/${complaintId}/assign`, { volunteerId }).toPromise();

    this.complaintList = this.complaintList.map(c =>
      c._id === complaintId ? res?.complaint : c
    );

    this.nearbyVolunteers[complaintId] = [];

  }

}