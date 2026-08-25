import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';


export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  monthly_price: string;
  yearly_price: string;
  base_user_seats: number;
  addon_seat_price: string;
  modules: string[];
  database_type: string;
  status: string;
  is_current_plan?: boolean;
}

export interface CompanyDetails {
  name: string;
  website: string;
  industry: string;
  size: string;
  businessType: string;
  country: string;
  timezone: string;
  currency: string;
  modules: string[];
  goal: string;
  users: number;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  selectedPlan = signal<SubscriptionPlan | null>(null);
  billingCycle = signal<BillingCycle>('monthly');
  companyDetails = signal<any | null>(null);

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  setPlan(plan: SubscriptionPlan, cycle: BillingCycle) {
    this.selectedPlan.set(plan);
    this.billingCycle.set(cycle);
  }

  setCompanyDetails(details: any) {
    this.companyDetails.set(details);
  }

  createTenant(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/tenants`, payload);
  }

  clear() {
    this.selectedPlan.set(null);
    this.billingCycle.set('monthly');
    this.companyDetails.set(null);
  }
}
