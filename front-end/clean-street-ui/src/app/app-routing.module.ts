


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

import { DashboardComponent } from './user/dashboard/dashboard.component';
import { ReportIssueComponent } from './user/report-issue/report-issue.component';
import { ViewComplaintsComponent } from './user/view-complaints/view-complaints.component';
import { ProfileComponent } from './user/profile/profile.component';

import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminLogsComponent } from './admin/admin-logs/admin-logs.component';

import { HomeComponent } from './pages/home/home.component';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { BlankComponent } from './shared/blank/blank.component';

const routes: Routes = [

  // ✅ Blank page when app opens
  //{ path: '', component: BlankComponent },
    { path: '', component: HomeComponent },

  // ✅ Auth pages (NO layout)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // ✅ User layout (Navbar / Sidebar)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'report', component: ReportIssueComponent },
      { path: 'complaints', component: ViewComplaintsComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  },

  // ✅ Admin routes (can later move to admin-layout)
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'admin-logs', component: AdminLogsComponent },

  // ✅ Wildcard → blank page
  { path: '**', component: BlankComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
