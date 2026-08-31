import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface CompanyEmployee {
  id: number;
  name: string;
  email: string;
  status: string;
  role_name: string;
}

export interface CompanySubscription {
  plan_name: string;
  status: string;
  starts_at: string;
  ends_at: string;
  days_remaining: number;
  is_expiring_soon: boolean;
}

export interface Company {
  id: number;
  company_name: string;
  subdomain: string;
  status: string;
  created_at: string;
  subscription: CompanySubscription;
  total_employees: number;
  total_allowed_seats: number;
  employees: CompanyEmployee[];
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getCompanies(page: number = 1, perPage: number = 15): Observable<ApiResponse<Company[]>> {
    return this.http.get<ApiResponse<Company[]>>(`${this.apiUrl}/admin/companies?page=${page}&per_page=${perPage}`);
  }
}
