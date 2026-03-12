import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
//import { environment } from '../../environments/environment';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ---------- GENERIC METHODS ----------
  get(endpoint: string): Observable<any> {
    return this.http.get(`${this.baseUrl}${endpoint}`, {
      withCredentials: true
    });
  }

  post(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${endpoint}`, data, {
      withCredentials: true
    });
  }

  put(endpoint: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${endpoint}`, data, {
      withCredentials: true
    });
  }

  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${endpoint}`, {
      withCredentials: true
    });
  }

  upload(endpoint: string, data: FormData) {
    return this.http.put(`${this.baseUrl}${endpoint}`, data, {
      withCredentials: true
    });
  }

  // ---------- AUTH ----------
  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data, {
      withCredentials: true
    });
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data, {
      withCredentials: true
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/profile`, {
      withCredentials: true
    });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/profile/update`, data, {
      withCredentials: true
    });
  }

  uploadProfilePic(data: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/profile/upload`, data, {
      withCredentials: true
    });
  }

  changePassword(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/change-password`, data, {
      withCredentials: true
    });
  }

  // ---------- COMPLAINTS ----------
  createComplaint(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/complaints`, data, {
      withCredentials: true
    });
  }

  getComplaints(): Observable<any> {
    return this.http.get(`${this.baseUrl}/complaints`, {
      withCredentials: true
    });
  }
}