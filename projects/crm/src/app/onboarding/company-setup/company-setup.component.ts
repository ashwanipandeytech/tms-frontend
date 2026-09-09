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
                  <div class="mb-4">
                    <label class="form-label fw-semibold">Company Name *</label>
                    <input type="text" class="form-control" formControlName="company_name" placeholder="Acme Inc." [class.is-invalid]="isInvalid('company_name')">
                    <div class="invalid-feedback">Company name is required.</div>
                  </div>

                  <div class="mb-4 d-none">
                    <label class="form-label fw-semibold">Subdomain Prefix *</label>
                    <div class="input-group">
                      <input type="text" class="form-control" formControlName="subdomain" placeholder="acme" [class.is-invalid]="isInvalid('subdomain')">
                      <span class="input-group-text bg-light text-muted">.demohandler.in</span>
                    </div>
                    <div class="invalid-feedback" [class.d-block]="isInvalid('subdomain')">Subdomain is required.</div>
                  </div>

                  <div class="row g-3 mb-4">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Primary Contact Name *</label>
                      <input type="text" class="form-control" formControlName="admin_name" placeholder="John Doe" [class.is-invalid]="isInvalid('admin_name')">
                      <div class="invalid-feedback">Contact name is required.</div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Phone Number *</label>
                      <div class="input-group">
                        <select class="form-select bg-light text-muted" style="max-width: 100px;" formControlName="country_code">
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                        </select>
                        <input type="text" class="form-control" formControlName="admin_phone" placeholder="9811122334" [class.is-invalid]="isInvalid('admin_phone')">
                        <div class="invalid-feedback">Valid 10-digit phone number is required.</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="row g-3 mb-4">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Email *</label>
                      <input type="email" class="form-control" formControlName="admin_email" placeholder="admin@acme.com" [class.is-invalid]="isInvalid('admin_email')">
                      <div class="invalid-feedback">Valid email is required.</div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Password *</label>
                      <input type="password" class="form-control" formControlName="initial_password" placeholder="Password@123" [class.is-invalid]="isInvalid('initial_password')">
                      <div class="invalid-feedback">Password must be at least 8 characters.</div>
                    </div>
                  </div>

                  <!-- Optional Integrations Section -->
                  <div class="mb-4">
                    <div class="card border border-light-subtle rounded-3 overflow-hidden">
                      <div class="card-header bg-white py-3 cursor-pointer d-flex justify-content-between align-items-center" (click)="toggleIntegrations()" style="cursor: pointer;">
                        <div>
                          <h6 class="fw-bold mb-0 text-dark"><i class="bi bi-plug-fill me-2 text-primary"></i>Lead Ads & Webhook Integrations <span class="badge bg-secondary-subtle text-secondary ms-2 fw-normal">Optional</span></h6>
                          <span class="small text-muted">Configure Meta Ads, Google Ads, and WhatsApp credentials (or set up later in Settings)</span>
                        </div>
                        <i class="bi" [ngClass]="showIntegrations ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                      </div>
                      <div class="card-body p-3 bg-light" *ngIf="showIntegrations">
                        <!-- Meta Ads -->
                        <h6 class="fw-bold text-primary mb-2"><i class="bi bi-facebook me-1"></i> Meta / Facebook Ads Credentials</h6>
                        <div class="row g-2 mb-3">
                          <div class="col-md-6">
                            <label class="form-label small fw-medium text-muted">Webhook Verify Token</label>
                            <input type="text" class="form-control form-control-sm" formControlName="meta_verify_token" placeholder="safarsystem_meta_token_2026">
                          </div>
                          <div class="col-md-6">
                            <label class="form-label small fw-medium text-muted">Meta App ID</label>
                            <input type="text" class="form-control form-control-sm" formControlName="meta_app_id" placeholder="App ID">
                          </div>
                          <div class="col-md-6">
                            <label class="form-label small fw-medium text-muted">Meta App Secret</label>
                            <input type="password" class="form-control form-control-sm" formControlName="meta_app_secret" placeholder="App Secret">
                          </div>
                          <div class="col-md-6">
                            <label class="form-label small fw-medium text-muted">Page Access Token</label>
                            <input type="password" class="form-control form-control-sm" formControlName="meta_access_token" placeholder="Page Access Token">
                          </div>
                        </div>

                        <!-- Google Ads -->
                        <h6 class="fw-bold text-danger mb-2"><i class="bi bi-google me-1"></i> Google Ads Lead Form Keys</h6>
                        <div class="row g-2 mb-3">
                          <div class="col-md-4">
                            <label class="form-label small fw-medium text-muted">Webhook Secret / Key</label>
                            <input type="text" class="form-control form-control-sm" formControlName="google_webhook_key" placeholder="safarsystem_google_key_2026">
                          </div>
                          <div class="col-md-4">
                            <label class="form-label small fw-medium text-muted">Client ID</label>
                            <input type="text" class="form-control form-control-sm" formControlName="google_client_id" placeholder="Client ID">
                          </div>
                          <div class="col-md-4">
                            <label class="form-label small fw-medium text-muted">Client Secret</label>
                            <input type="password" class="form-control form-control-sm" formControlName="google_client_secret" placeholder="Client Secret">
                          </div>
                        </div>

                        <!-- WhatsApp Cloud API -->
                        <h6 class="fw-bold text-success mb-2"><i class="bi bi-whatsapp me-1"></i> WhatsApp Business Cloud API</h6>
                        <div class="row g-2">
                          <div class="col-md-6">
                            <label class="form-label small fw-medium text-muted">Verify Token</label>
                            <input type="text" class="form-control form-control-sm" formControlName="whatsapp_verify_token" placeholder="safarsystem_whatsapp_token_2026">
                          </div>
                          <div class="col-md-6">
                            <label class="form-label small fw-medium text-muted">API Permanent Token</label>
                            <input type="password" class="form-control form-control-sm" formControlName="whatsapp_api_token" placeholder="API Token">
                          </div>
                          <div class="col-md-6">
                            <label class="form-label small fw-medium text-muted">Phone Number ID</label>
                            <input type="text" class="form-control form-control-sm" formControlName="whatsapp_phone_number_id" placeholder="Phone Number ID">
                          </div>
                          <div class="col-md-6">
                            <label class="form-label small fw-medium text-muted">Business Account ID</label>
                            <input type="text" class="form-control form-control-sm" formControlName="whatsapp_business_account_id" placeholder="Business Account ID">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- API Error Message -->
                  <div *ngIf="errorMessage" class="alert alert-danger mt-3">
                    {{ errorMessage }}
                  </div>

                  <hr class="my-4">

                  <div class="d-flex justify-content-between align-items-center">
                    <button type="button" class="btn btn-light fw-semibold" routerLink="/subscription">Back</button>
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
                  <span class="fw-medium">x {{ companyForm.get('addon_user_seats')?.value || 1 }}</span>
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
  showIntegrations = false;

  ngOnInit() {
    if (!this.onboardingService.selectedPlan()) {
      this.router.navigate(['/subscription']);
      return;
    }

    this.companyForm = this.fb.group({
      company_name: ['', Validators.required],
      subdomain: [''],
      admin_name: ['', Validators.required],
      country_code: ['+91', Validators.required],
      admin_phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      admin_email: ['', [Validators.required, Validators.email]],
      initial_password: ['', [Validators.required, Validators.minLength(8)]],
      addon_user_seats: [1, [Validators.required, Validators.min(1)]],

      // Optional Integration Fields
      meta_verify_token: [''],
      meta_app_id: [''],
      meta_app_secret: [''],
      meta_access_token: [''],
      google_webhook_key: [''],
      google_client_id: [''],
      google_client_secret: [''],
      whatsapp_verify_token: [''],
      whatsapp_api_token: [''],
      whatsapp_phone_number_id: [''],
      whatsapp_business_account_id: ['']
    });
  }

  toggleIntegrations() {
    this.showIntegrations = !this.showIntegrations;
  }

  isInvalid(field: string): boolean {
    const control = this.companyForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  updateUsers(event: any) {
    this.companyForm.patchValue({ addon_user_seats: parseInt(event.target.value, 10) });
  }

  getBasePrice(): number {
    const plan = this.onboardingService.selectedPlan();
    if (!plan) return 0;
    switch(this.onboardingService.billingCycle()) {
      case 'monthly': return parseFloat(plan.monthly_price);
      case 'yearly': return parseFloat(plan.yearly_price) / 12;
      default: return parseFloat(plan.monthly_price);
    }
  }

  formatBillingCycle(cycle: string): string {
    return cycle.replace('_', ' ');
  }

  getMultiplier(): number {
    switch(this.onboardingService.billingCycle()) {
      case 'monthly': return 1;
      case 'yearly': return 12;
      default: return 1;
    }
  }

  calculateTotal(): number {
    const users = this.companyForm?.get('addon_user_seats')?.value || 1;
    let multiplier = this.getMultiplier();
    return this.getBasePrice() * users * multiplier;
  }

  errorMessage = '';

  onSubmit() {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    const plan = this.onboardingService.selectedPlan();
    
    const planIdMapping: any = { 'starter': 1, 'professional': 2, 'business': 3, 'enterprise': 4 };
    const planId = plan ? planIdMapping[plan.id] || 1 : 1;

    const payload = {
      ...this.companyForm.value,
      plan_id: planId,
      billing_cycle: this.onboardingService.billingCycle(),
      database_type: 'shared'
    };
    
    // Save locally for the success page display
    this.onboardingService.setCompanyDetails(payload);

    this.onboardingService.createTenant(payload).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/onboarding/success']);
        } else {
          this.errorMessage = res.message || 'Failed to create company';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'An error occurred during onboarding';
      }
    });
  }
}
