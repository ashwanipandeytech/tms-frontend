import { Injectable, signal } from '@angular/core';

export type BillingCycle = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceQuarterly: number;
  priceHalfYearly: number;
  priceYearly: number;
  features: string[];
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
  companyDetails = signal<CompanyDetails | null>(null);

  setPlan(plan: SubscriptionPlan, cycle: BillingCycle) {
    this.selectedPlan.set(plan);
    this.billingCycle.set(cycle);
  }

  setCompanyDetails(details: CompanyDetails) {
    this.companyDetails.set(details);
  }

  clear() {
    this.selectedPlan.set(null);
    this.billingCycle.set('monthly');
    this.companyDetails.set(null);
  }
}
