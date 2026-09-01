import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface TenantEmployee {
  id: number;
  name: string;
  email: string;
  status: string;
  role_name: string;
  demo_password?: string;
}

export interface TenantSubscription {
  plan_name: string;
  status: string;
  starts_at: string;
  ends_at: string;
  days_remaining: number;
  is_expiring_soon: boolean;
}

export interface Tenant {
  id: number;
  company_name: string;
  subdomain: string;
  status: string;
  created_at: string;
  subscription: TenantSubscription;
  total_employees: number;
  total_allowed_seats: number;
  employees: TenantEmployee[];
}

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getTenants(page: number = 1, perPage: number = 15): Observable<ApiResponse<Tenant[]>> {
    return this.http.get<ApiResponse<Tenant[]>>(`${this.apiUrl}/admin/tenants?page=${page}&per_page=${perPage}`);
  }
}
