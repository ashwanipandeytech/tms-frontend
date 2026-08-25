import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnboardingService } from '../onboarding.service';

@Component({
  selector: 'app-company-setup',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="onboarding-page min-vh-100 bg-light">
      <header class="py-3 px-4 d-flex justify-content-between align-items-center bg-white shadow-sm mb-5">
        <a routerLink="/" class="fw-bold fs-4 text-primary text-decoration-none">
          <i class="bi bi-rocket-takeoff me-2"></i>TMS CRM
        </a>
        <div>
          <a routerLink="/login" class="btn btn-outline-primary fw-semibold px-4">Login</a>
        </div>
      </header>
      <div class="container pb-5">
        <!-- Progress Indicator -->
        <div class="row justify-content-center mb-5">
          <div class="col-lg-8">
            <div class="d-flex justify-content-between align-items-center position-relative">
              <div class="progress position-absolute top-50 start-0 w-100 translate-middle-y" style="height: 4px; z-index: 1;">
                <div class="progress-bar bg-primary" role="progressbar" style="width: 50%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <div class="step position-relative bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width: 40px; height: 40px; z-index: 2;">
                <i class="bi bi-check"></i>
              </div>
              <div class="step position-relative bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width: 40px; height: 40px; z-index: 2;">
                2
              </div>
              <div class="step position-relative bg-white text-muted border border-2 rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 40px; height: 40px; z-index: 2;">
                3
              </div>
            </div>
            <div class="d-flex justify-content-between mt-2 text-muted small fw-semibold">
              <span>Select Plan</span>
              <span class="text-primary">Company Details</span>
              <span>Complete Setup</span>
            </div>
          </div>
        </div>

        <div class="row g-4 justify-content-center">
          <!-- Main Form -->
          <div class="col-lg-7">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-body p-4 p-md-5">
                <h2 class="fw-bold mb-4">Tell us about your company</h2>
                
                <form [formGroup]="companyForm" (ngSubmit)="onSubmit()">
                  <!-- Logo Upload -->
                  <div class="mb-4">
                    <label class="form-label fw-semibold">Company Logo</label>
                    <div class="d-flex align-items-center gap-3">
                      <div class="bg-light border border-dashed rounded-3 d-flex align-items-center justify-content-center text-muted" style="width: 80px; height: 80px;">
                        <i class="bi bi-building fs-3" *ngIf="!logoPreview"></i>
                        <img *ngIf="logoPreview" [src]="logoPreview" alt="Logo" class="img-fluid rounded-3" style="max-height: 100%;">
                      </div>
                      <div>
                        <button type="button" class="btn btn-outline-primary btn-sm mb-1" (click)="fileInput.click()">Upload Logo</button>
                        <input type="file" #fileInput class="d-none" accept="image/*" (change)="onFileSelected($event)">
                        <div class="small text-muted">JPG, PNG or SVG. Max 2MB.</div>
                      </div>
                    </div>
                  </div>

                  <!-- Basic Info -->
                  <div class="row g-3 mb-4">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Company Name *</label>
                      <input type="text" class="form-control" formControlName="name" placeholder="Acme Inc." [class.is-invalid]="isInvalid('name')">
                      <div class="invalid-feedback">Company name is required.</div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Website *</label>
                      <input type="text" class="form-control" formControlName="website" placeholder="acme.com" [class.is-invalid]="isInvalid('website')">
                      <div class="invalid-feedback">Valid website is required.</div>
                    </div>
                  </div>

                  <div class="row g-3 mb-4">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Industry *</label>
                      <select class="form-select" formControlName="industry" [class.is-invalid]="isInvalid('industry')">
                        <option value="">Select Industry</option>
                        <option value="technology">Technology & Software</option>
                        <option value="retail">Retail & E-commerce</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="services">Professional Services</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Company Size *</label>
                      <select class="form-select" formControlName="size" [class.is-invalid]="isInvalid('size')">
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </div>
                  </div>

                  <!-- Localization -->
                  <h5 class="fw-bold mb-3 mt-4">Localization</h5>
                  <div class="row g-3 mb-4">
                    <div class="col-md-4">
                      <label class="form-label fw-semibold">Country *</label>
                      <select class="form-select" formControlName="country" [class.is-invalid]="isInvalid('country')">
                        <option value="">Select</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="IN">India</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label fw-semibold">Timezone *</label>
                      <select class="form-select" formControlName="timezone" [class.is-invalid]="isInvalid('timezone')">
                        <option value="">Select</option>
                        <option value="PST">Pacific Time (PT)</option>
                        <option value="EST">Eastern Time (ET)</option>
                        <option value="UTC">UTC</option>
                        <option value="IST">India Standard (IST)</option>
                      </select>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label fw-semibold">Currency *</label>
                      <select class="form-select" formControlName="currency" [class.is-invalid]="isInvalid('currency')">
                        <option value="">Select</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                  </div>

                  <!-- CRM Preferences -->
                  <h5 class="fw-bold mb-3 mt-4">CRM Preferences</h5>
                  <div class="mb-4">
                    <label class="form-label fw-semibold">Number of CRM Users *</label>
                    <div class="d-flex align-items-center gap-3">
                      <input type="range" class="form-range flex-grow-1" min="1" max="100" 
                             [value]="companyForm.get('users')?.value"
                             (input)="updateUsers($event)">
                      <input type="number" class="form-control text-center fw-bold" style="width: 80px;" formControlName="users">
                    </div>
                    <div class="small text-muted mt-1">Pricing dynamically updates based on users.</div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label fw-semibold d-block mb-2">Modules Needed (Select multiple)</label>
                    <div class="row g-2">
                      <div class="col-sm-6" *ngFor="let mod of availableModules">
                        <div class="form-check p-2 ps-4">
                          <input class="form-check-input" type="checkbox" [value]="mod.id" [id]="mod.id" (change)="toggleModule(mod.id)">
                          <label class="form-check-label w-100" [for]="mod.id">{{ mod.name }}</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label fw-semibold">Primary Business Goal</label>
                    <textarea class="form-control" formControlName="goal" rows="2" placeholder="e.g., Increase sales conversions, manage customer support..."></textarea>
                  </div>

                  <hr class="my-4">

                  <div class="d-flex justify-content-between align-items-center">
                    <button type="button" class="btn btn-light fw-semibold" routerLink="/pricing">Back</button>
                    <button type="submit" class="btn btn-primary fw-semibold px-4 py-2 d-flex align-items-center gap-2" [disabled]="loading || companyForm.invalid">
                      <span *ngIf="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Create My CRM Workspace
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>

          <!-- Sticky Subscription Summary -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm rounded-4 position-sticky" style="top: 2rem;">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-4">Subscription Summary</h5>
                
                <div class="d-flex justify-content-between align-items-start mb-3" *ngIf="onboardingService.selectedPlan() as plan">
                  <div>
                    <h6 class="fw-bold mb-1">{{ plan.name }} Plan</h6>
                    <span class="badge bg-primary-subtle text-primary rounded-pill text-capitalize">{{ formatBillingCycle(onboardingService.billingCycle()) }} Billing</span>
                  </div>
                  <div class="text-end">
                    <div class="fs-4 fw-bold">\${{ getBasePrice() }}</div>
                    <div class="small text-muted">/user/mo</div>
                  </div>
                </div>

                <hr class="my-3 border-dashed">

                <div class="d-flex justify-content-between mb-2 small">
                  <span class="text-muted">Base Price</span>
                  <span class="fw-medium">\${{ getBasePrice() }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2 small">
                  <span class="text-muted">Users</span>
                  <span class="fw-medium">x {{ companyForm.get('users')?.value || 1 }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2 small" *ngIf="onboardingService.billingCycle() !== 'monthly'">
                  <span class="text-muted">Billing Period</span>
                  <span class="fw-medium">{{ getMultiplier() }} Months</span>
                </div>

                <hr class="my-3 border-dashed">

                <div class="d-flex justify-content-between align-items-end">
                  <span class="fw-bold fs-5">Total Due Today</span>
                  <div class="text-end">
                    <span class="fw-bold fs-3 text-primary">\${{ calculateTotal() }}</span>
                  </div>
                </div>
                <p class="small text-muted mt-2 mb-0 text-center"><i class="bi bi-shield-lock me-1"></i> Secure 256-bit SSL encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .border-dashed { border-style: dashed !important; }
  `]
})
export class CompanySetupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public onboardingService = inject(OnboardingService);

  companyForm!: FormGroup;
  loading = false;
  logoPreview: string | null = null;
  selectedModules: Set<string> = new Set();

  availableModules = [
    { id: 'sales', name: 'Sales Pipeline' },
    { id: 'marketing', name: 'Marketing Automation' },
    { id: 'support', name: 'Customer Support' },
    { id: 'inventory', name: 'Inventory Management' },
    { id: 'invoicing', name: 'Invoicing & Billing' },
    { id: 'analytics', name: 'Advanced Analytics' }
  ];

  ngOnInit() {
    if (!this.onboardingService.selectedPlan()) {
      this.router.navigate(['/pricing']);
      return;
    }

    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      website: ['', Validators.required],
      industry: ['', Validators.required],
      size: ['', Validators.required],
      country: ['', Validators.required],
      timezone: ['', Validators.required],
      currency: ['', Validators.required],
      users: [1, [Validators.required, Validators.min(1)]],
      goal: ['']
    });
  }

  isInvalid(field: string): boolean {
    const control = this.companyForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  updateUsers(event: any) {
    this.companyForm.patchValue({ users: parseInt(event.target.value, 10) });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.logoPreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  toggleModule(moduleId: string) {
    if (this.selectedModules.has(moduleId)) {
      this.selectedModules.delete(moduleId);
    } else {
      this.selectedModules.add(moduleId);
    }
  }

  getBasePrice(): number {
    const plan = this.onboardingService.selectedPlan();
    if (!plan) return 0;
    switch(this.onboardingService.billingCycle()) {
      case 'monthly': return plan.priceMonthly;
      case 'quarterly': return plan.priceQuarterly;
      case 'half_yearly': return plan.priceHalfYearly;
      case 'yearly': return plan.priceYearly;
      default: return plan.priceMonthly;
    }
  }

  formatBillingCycle(cycle: string): string {
    return cycle.replace('_', ' ');
  }

  getMultiplier(): number {
    switch(this.onboardingService.billingCycle()) {
      case 'monthly': return 1;
      case 'quarterly': return 3;
      case 'half_yearly': return 6;
      case 'yearly': return 12;
      default: return 1;
    }
  }

  calculateTotal(): number {
    const users = this.companyForm?.get('users')?.value || 1;
    let multiplier = this.getMultiplier();
    return this.getBasePrice() * users * multiplier;
  }

  onSubmit() {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.onboardingService.setCompanyDetails({
        ...this.companyForm.value,
        modules: Array.from(this.selectedModules)
      });
      this.loading = false;
      this.router.navigate(['/onboarding/success']);
    }, 1500);
  }
}
