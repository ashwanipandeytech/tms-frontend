import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CompanyIntegrationDetail } from './tenant.service';

export interface CompanyProfilePayload {
  id: number;
  name: string;
  subdomain: string;
  email?: string;
  phone?: string;
  address?: string;
  default_max_daily_leads: number;
  auto_assign_enabled: boolean;
  subscription_status: string;
  billing_cycle: string;
  subscription_starts_at?: string;
  subscription_ends_at?: string;
  plan_id?: number;
  plan?: {
    id: number;
    name: string;
    price: number;
    base_user_seats: number;
    features?: string[];
  };
  addon_user_seats: number;
  base_user_seats: number;
  total_allowed_seats: number;
  active_users_count: number;
}

export interface CompanyIntegrationsPayload {
  company_id: number;
  company_name: string;
  subdomain: string;
  integrations: {
    meta: CompanyIntegrationDetail;
    google: CompanyIntegrationDetail;
    whatsapp: CompanyIntegrationDetail;
  };
  webhook_urls: {
    meta: string;
    google: string;
    whatsapp: string;
    website: string;
  };
}

export interface UpdateIntegrationRequest {
  company_id?: number;
  provider: 'meta' | 'google' | 'whatsapp';
  is_active?: boolean;
  verify_token?: string;
  webhook_secret?: string;
  access_token?: string;
  app_id?: string;
  app_secret?: string;
  account_id?: string;
  phone_number_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyIntegrationService {
  private apiUrl = `${environment.apiUrl}/company/integrations`;
  private profileUrl = `${environment.apiUrl}/company/profile`;
  private planUrl = `${environment.apiUrl}/company/plan`;
  private plansUrl = `${environment.apiUrl}/plans`;

  constructor(private http: HttpClient) {}

  getCompanyProfile(): Observable<ApiResponse<CompanyProfilePayload>> {
    return this.http.get<ApiResponse<CompanyProfilePayload>>(this.profileUrl);
  }

  updateCompanyProfile(data: any): Observable<ApiResponse<CompanyProfilePayload>> {
    return this.http.put<ApiResponse<CompanyProfilePayload>>(this.profileUrl, data);
  }

  changePlan(data: { plan_id: number; billing_cycle?: string; addon_user_seats?: number }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(this.planUrl, data);
  }

  getPlans(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.plansUrl);
  }

  getIntegrations(companyId?: number): Observable<ApiResponse<CompanyIntegrationsPayload>> {
    const url = companyId ? `${this.apiUrl}?company_id=${companyId}` : this.apiUrl;
    return this.http.get<ApiResponse<CompanyIntegrationsPayload>>(url);
  }

  updateIntegration(payload: UpdateIntegrationRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(this.apiUrl, payload);
  }
}
