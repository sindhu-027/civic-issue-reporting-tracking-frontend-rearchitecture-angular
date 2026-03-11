


import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// ---------------- COMPONENTS ----------------

// Layout
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

// Pages
import { HomeComponent } from './pages/home/home.component';

// User
import { DashboardComponent } from './user/dashboard/dashboard.component';
import { ReportIssueComponent } from './user/report-issue/report-issue.component';
import { ViewComplaintsComponent } from './user/view-complaints/view-complaints.component';
import { ProfileComponent } from './user/profile/profile.component';

// Auth
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

// Admin
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminLogsComponent } from './admin/admin-logs/admin-logs.component';

// ---------------- ANGULAR MODULES ----------------
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
//import {provideCharts, withDefaultRegisterables} from 'ng2-charts';
import { LucideAngularModule } from 'lucide-angular';
//import {NgChartsModule} from 'ng2-charts'

import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    HomeComponent,

    // Auth
    LoginComponent,
    RegisterComponent,

    // User
    DashboardComponent,
    ReportIssueComponent,
    ViewComplaintsComponent,
    ProfileComponent,

    // Admin
    AdminDashboardComponent,
    AdminLogsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    LucideAngularModule,
    FontAwesomeModule,
    RouterModule
    //NgChartsModule

    
  ],
  // providers:[
  //   provideCharts(withDefaultRegisterables())
  // ],
  bootstrap: [AppComponent]
})
export class AppModule {}
