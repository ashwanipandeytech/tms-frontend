import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OnboardingService, SubscriptionPlan, BillingCycle } from '../onboarding/onboarding.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="pricing-page">
      <header class="py-3 px-4 d-flex justify-content-between align-items-center bg-white shadow-sm mb-5">
        <a routerLink="/" class="fw-bold fs-4 text-primary text-decoration-none">
          <i class="bi bi-rocket-takeoff me-2"></i>TMS CRM
        </a>
        <div>
          <a routerLink="/login" class="btn btn-outline-primary fw-semibold px-4">Login</a>
        </div>
      </header>
      <div class="container py-4">
        <div class="text-center mb-5">
          <h1 class="display-5 fw-bold mb-3">Choose the perfect plan for your CRM</h1>
          <p class="lead text-muted mb-4">Scale your business with our flexible pricing options.</p>
          
          <div class="d-inline-flex bg-white rounded-pill p-1 shadow-sm flex-wrap justify-content-center">
            <button class="btn rounded-pill px-3 px-sm-4 mb-1 mb-sm-0" 
                    [class.btn-primary]="billingCycle === 'monthly'"
                    [class.text-muted]="billingCycle !== 'monthly'"
                    [class.btn-light]="billingCycle !== 'monthly'"
                    (click)="setBilling('monthly')">Monthly</button>
            <button class="btn rounded-pill px-3 px-sm-4 mb-1 mb-sm-0" 
                    [class.btn-primary]="billingCycle === 'quarterly'"
                    [class.text-muted]="billingCycle !== 'quarterly'"
                    [class.btn-light]="billingCycle !== 'quarterly'"
                    (click)="setBilling('quarterly')">Quarterly</button>
            <button class="btn rounded-pill px-3 px-sm-4 mb-1 mb-sm-0" 
                    [class.btn-primary]="billingCycle === 'half_yearly'"
                    [class.text-muted]="billingCycle !== 'half_yearly'"
                    [class.btn-light]="billingCycle !== 'half_yearly'"
                    (click)="setBilling('half_yearly')">Half Year</button>
            <button class="btn rounded-pill px-3 px-sm-4 mb-1 mb-sm-0" 
                    [class.btn-primary]="billingCycle === 'yearly'"
                    [class.text-muted]="billingCycle !== 'yearly'"
                    [class.btn-light]="billingCycle !== 'yearly'"
                    (click)="setBilling('yearly')">
              Full Year <span class="badge bg-success ms-1">Save 20%</span>
            </button>
          </div>
        </div>

        <div class="row g-4 justify-content-center mb-5">
          <div class="col-md-6 col-lg-3" *ngFor="let plan of plans">
            <div class="card h-100 shadow-sm border-0 position-relative" [class.border-primary]="plan.id === 'professional'" [class.border]="plan.id === 'professional'">
              <div class="position-absolute top-0 start-50 translate-middle" *ngIf="plan.id === 'professional'">
                <span class="badge bg-primary rounded-pill px-3 py-2 text-uppercase fw-bold">Most Popular</span>
              </div>
              <div class="card-body p-4 d-flex flex-column">
                <h4 class="card-title fw-bold">{{ plan.name }}</h4>
                <div class="my-4">
                  <span class="fs-1 fw-bold">\${{ getPrice(plan) }}</span>
                  <span class="text-muted">/user/mo</span>
                </div>
                <ul class="list-unstyled mb-4 flex-grow-1">
                  <li class="mb-3 d-flex" *ngFor="let feature of plan.features">
                    <i class="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                    <span>{{ feature }}</span>
                  </li>
                </ul>
                <button class="btn w-100 py-2 fw-semibold" 
                        [class.btn-primary]="plan.id === 'professional'"
                        [class.btn-outline-primary]="plan.id !== 'professional'"
                        (click)="selectPlan(plan)">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="row mt-5 pt-5">
          <div class="col-lg-8 mx-auto">
            <h2 class="text-center mb-4 fw-bold">Frequently Asked Questions</h2>
            <div class="accordion" id="pricingFaq">
              <div class="accordion-item border-0 border-bottom mb-3 pb-2 bg-transparent">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed bg-transparent fw-semibold fs-5 px-0" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                    Can I change my plan later?
                  </button>
                </h2>
                <div id="faq1" class="accordion-collapse collapse" data-bs-parent="#pricingFaq">
                  <div class="accordion-body px-0 text-muted">
                    Yes, you can upgrade, downgrade, or cancel your plan at any time from your account settings.
                  </div>
                </div>
              </div>
              <div class="accordion-item border-0 border-bottom mb-3 pb-2 bg-transparent">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed bg-transparent fw-semibold fs-5 px-0" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                    What payment methods do you accept?
                  </button>
                </h2>
                <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#pricingFaq">
                  <div class="accordion-body px-0 text-muted">
                    We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.
                  </div>
                </div>
              </div>
              <div class="accordion-item border-0 bg-transparent">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed bg-transparent fw-semibold fs-5 px-0" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                    Is there a setup fee?
                  </button>
                </h2>
                <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#pricingFaq">
                  <div class="accordion-body px-0 text-muted">
                    No, there are no hidden fees or setup costs. You only pay the monthly or annual subscription fee.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .pricing-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }
    .accordion-button:not(.collapsed) {
      color: var(--bs-primary);
      box-shadow: none;
    }
    .accordion-button:focus {
      box-shadow: none;
    }
    `
  ]
})
export class PricingComponent {
  private router = inject(Router);
  private onboardingService = inject(OnboardingService);

  billingCycle: BillingCycle = 'monthly';

  plans: SubscriptionPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      priceMonthly: 19,
      priceQuarterly: 18,
      priceHalfYearly: 17,
      priceYearly: 15,
      features: ['Up to 5 Users', 'Basic Contact Management', 'Standard Reports', 'Email Support']
    },
    {
      id: 'professional',
      name: 'Professional',
      priceMonthly: 49,
      priceQuarterly: 46,
      priceHalfYearly: 43,
      priceYearly: 39,
      features: ['Up to 20 Users', 'Advanced CRM Features', 'Custom Dashboards', 'Priority Support', 'API Access']
    },
    {
      id: 'business',
      name: 'Business',
      priceMonthly: 99,
      priceQuarterly: 94,
      priceHalfYearly: 89,
      priceYearly: 79,
      features: ['Unlimited Users', 'Workflow Automation', 'Advanced Analytics', '24/7 Phone Support', 'Custom Integrations']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      priceMonthly: 199,
      priceQuarterly: 189,
      priceHalfYearly: 179,
      priceYearly: 159,
      features: ['Unlimited Everything', 'Dedicated Account Manager', 'On-premise Deployment', 'SLA Guarantee', 'Custom Development']
    }
  ];

  getPrice(plan: SubscriptionPlan): number {
    switch(this.billingCycle) {
      case 'monthly': return plan.priceMonthly;
      case 'quarterly': return plan.priceQuarterly;
      case 'half_yearly': return plan.priceHalfYearly;
      case 'yearly': return plan.priceYearly;
      default: return plan.priceMonthly;
    }
  }

  setBilling(cycle: BillingCycle) {
    this.billingCycle = cycle;
  }

  selectPlan(plan: SubscriptionPlan) {
    this.onboardingService.setPlan(plan, this.billingCycle);
    this.router.navigate(['/onboarding/company']);
  }
}
