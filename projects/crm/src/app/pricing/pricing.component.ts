import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OnboardingService, SubscriptionPlan, BillingCycle } from '../onboarding/onboarding.service';
import { PlanService } from '../core/services/plan.service';

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
        </div>

        <div class="row g-4 justify-content-center mb-5">
          <div class="col-md-6 col-lg-3" *ngFor="let plan of plans()">
            <div class="card h-100 shadow-sm border-0 position-relative" [class.border-primary]="plan.slug === 'professional-plan'" [class.border]="plan.slug === 'professional-plan'">
              <div class="position-absolute top-0 start-50 translate-middle" *ngIf="plan.slug === 'professional-plan'">
                <span class="badge bg-primary rounded-pill px-3 py-2 text-uppercase fw-bold">Most Popular</span>
              </div>
              <div class="card-body p-4 d-flex flex-column">
                <h4 class="card-title fw-bold">{{ plan.name }}</h4>
                <div class="my-4">
                  <span class="fs-1 fw-bold">₹{{ getPrice(plan) }}</span>
                  <span class="text-muted">/user/mo</span>
                </div>
                <div class="text-muted small mb-3">
                  Base users: {{ plan.base_user_seats }} <br>
                  Add-on seat: ₹{{ plan.addon_seat_price }}
                </div>
                <ul class="list-unstyled mb-4 flex-grow-1">
                  <li class="mb-3 d-flex" *ngFor="let module of plan.modules">
                    <i class="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                    <span class="text-capitalize">{{ module }}</span>
                  </li>
                </ul>
                <button class="btn w-100 py-2 fw-semibold" 
                        [class.btn-primary]="plan.slug === 'professional-plan'"
                        [class.btn-outline-primary]="plan.slug !== 'professional-plan'"
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
export class PricingComponent implements OnInit {
  private router = inject(Router);
  private onboardingService = inject(OnboardingService);
  private planService = inject(PlanService);

  billingCycle: BillingCycle = 'monthly';
  plans = signal<SubscriptionPlan[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    console.log('Fetching plans...');
    this.planService.getPlans().subscribe({
      next: (res: any) => {
        console.log('Plans response:', res);
        let fetchedPlans: SubscriptionPlan[] = [];
        
        if (Array.isArray(res)) {
          fetchedPlans = res;
        } else if (res && res.data) {
          fetchedPlans = res.data;
        }

        // Sort so that 'Free Trial Plan' is always first
        fetchedPlans.sort((a, b) => {
          if (a.slug === 'free-trial-plan') return -1;
          if (b.slug === 'free-trial-plan') return 1;
          return 0;
        });

        this.plans.set(fetchedPlans);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching plans:', err);
        this.loading.set(false);
      }
    });
  }

  getPrice(plan: SubscriptionPlan): number {
    switch(this.billingCycle) {
      case 'monthly': return parseFloat(plan.monthly_price);
      case 'yearly': return parseFloat(plan.yearly_price) / 12; // Display monthly equivalent
      default: return parseFloat(plan.monthly_price);
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
