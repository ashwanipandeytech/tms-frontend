import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OnboardingService } from '../onboarding.service';

@Component({
  selector: 'app-onboarding-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="success-page min-vh-100 d-flex align-items-center bg-light py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-6 col-md-8 text-center">
            
            <div class="mb-4">
              <div class="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle shadow" style="width: 100px; height: 100px;">
                <i class="bi bi-check-lg" style="font-size: 3rem;"></i>
              </div>
            </div>
            
            <h1 class="fw-bold mb-3">Workspace Created Successfully!</h1>
            <p class="lead text-muted mb-5">Your CRM is ready to go. Welcome aboard, <strong>{{ companyName }}</strong>.</p>
            
            <div class="card border-0 shadow-sm rounded-4 text-start mb-5">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3 border-bottom pb-2">Workspace Details</h5>
                
                <div class="row g-3 mb-3">
                  <div class="col-sm-6">
                    <div class="text-muted small">Subscription Plan</div>
                    <div class="fw-semibold">{{ planName }} <span class="badge bg-primary-subtle text-primary rounded-pill text-capitalize ms-1">{{ billingCycle }}</span></div>
                  </div>
                  <div class="col-sm-6">
                    <div class="text-muted small">Licensed Users</div>
                    <div class="fw-semibold">{{ usersCount }} Seats</div>
                  </div>
                </div>

                <div class="row g-3">
                  <div class="col-12">
                    <div class="text-muted small">Workspace URL</div>
                    <div class="d-flex align-items-center gap-2 bg-light p-2 rounded mt-1 border">
                      <i class="bi bi-link-45deg text-muted"></i>
                      <span class="text-primary fw-medium">{{ workspaceUrl }}</span>
                      <button class="btn btn-sm btn-light border ms-auto" (click)="copyUrl()">
                        <i class="bi" [class.bi-clipboard]="!copied" [class.bi-check2-all]="copied" [class.text-success]="copied"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <button class="btn btn-primary btn-lg fw-semibold px-5 shadow-sm" (click)="goToDashboard()">
                Go to CRM Dashboard
              </button>
              <button class="btn btn-outline-primary btn-lg fw-semibold px-4" (click)="inviteTeam()">
                <i class="bi bi-envelope-plus me-2"></i> Invite Your Team
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  `
})
export class SuccessComponent implements OnInit {
  private router = inject(Router);
  public onboardingService = inject(OnboardingService);

  companyName = 'Your Company';
  planName = 'Starter';
  billingCycle = 'Monthly';
  usersCount = 1;
  workspaceUrl = 'yourcompany.mycrm.com';
  copied = false;

  ngOnInit() {
    const details = this.onboardingService.companyDetails();
    const plan = this.onboardingService.selectedPlan();
    const cycle = this.onboardingService.billingCycle();

    if (!details || !plan) {
      // For testing directly to the success page, we don't strictly redirect,
      // but in real app we might redirect to pricing.
      // this.router.navigate(['/pricing']);
    } else {
      this.companyName = details.company_name || 'Your Company';
      this.planName = plan.name;
      this.billingCycle = cycle.replace('_', ' ');
      this.usersCount = details.addon_user_seats || 1;
      
      const cleanName = this.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
      this.workspaceUrl = `${details.subdomain || cleanName}.demohandler.in`;
    }
  }

  copyUrl() {
    navigator.clipboard.writeText(this.workspaceUrl);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  goToDashboard() {
    // In a real app we might clear state, login, and redirect
    this.onboardingService.clear();
    this.router.navigate(['/dashboard']);
  }

  inviteTeam() {
    // Logic to open invite modal or navigate to users page
    this.router.navigate(['/users']); // Assuming a users page exists
  }
}
