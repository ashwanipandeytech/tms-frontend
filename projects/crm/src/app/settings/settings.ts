import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyIntegrationService, CompanyIntegrationsPayload, CompanyProfilePayload } from '../core/services/company-integration.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
  activeTab = signal<'company' | 'plan' | 'meta' | 'google' | 'whatsapp' | 'webhooks'>('company');
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  profileData = signal<CompanyProfilePayload | null>(null);
  integrationsData = signal<CompanyIntegrationsPayload | null>(null);
  plansList = signal<any[]>([]);

  companyForm!: FormGroup;
  planForm!: FormGroup;
  metaForm!: FormGroup;
  googleForm!: FormGroup;
  whatsappForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private integrationService: CompanyIntegrationService
  ) {}

  ngOnInit() {
    this.initForms();
    this.fetchData();
  }

  initForms() {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      subdomain: [''],
      email: ['', [Validators.email]],
      phone: [''],
      address: [''],
      default_max_daily_leads: [20, [Validators.required, Validators.min(1)]],
      auto_assign_enabled: [true]
    });

    this.planForm = this.fb.group({
      plan_id: [null, Validators.required],
      billing_cycle: ['monthly'],
      addon_user_seats: [0, [Validators.min(0)]]
    });

    this.metaForm = this.fb.group({
      verify_token: [''],
      app_id: [''],
      app_secret: [''],
      access_token: [''],
      is_active: [true]
    });

    this.googleForm = this.fb.group({
      webhook_secret: [''],
      app_id: [''],
      app_secret: [''],
      is_active: [true]
    });

    this.whatsappForm = this.fb.group({
      verify_token: [''],
      access_token: [''],
      phone_number_id: [''],
      account_id: [''],
      is_active: [true]
    });
  }

  async fetchData() {
    this.isLoading.set(true);

    try {
      const profileRes = await firstValueFrom(this.integrationService.getCompanyProfile());
      if (profileRes && profileRes.data) {
        this.profileData.set(profileRes.data);
        const p = profileRes.data;
        this.companyForm.patchValue({
          name: p.name || '',
          subdomain: p.subdomain || '',
          email: p.email || '',
          phone: p.phone || '',
          address: p.address || '',
          default_max_daily_leads: p.default_max_daily_leads || 20,
          auto_assign_enabled: p.auto_assign_enabled ?? true
        });

        this.planForm.patchValue({
          plan_id: p.plan_id || null,
          billing_cycle: p.billing_cycle || 'monthly',
          addon_user_seats: p.addon_user_seats || 0
        });
      }
    } catch (err) {
      console.error('Failed to load company profile', err);
    }

    try {
      const plansRes = await firstValueFrom(this.integrationService.getPlans());
      if (plansRes && plansRes.data) {
        this.plansList.set(plansRes.data);
      }
    } catch (err) {
      console.error('Failed to load subscription plans list', err);
    }

    try {
      const integrationsRes = await firstValueFrom(this.integrationService.getIntegrations());
      if (integrationsRes && integrationsRes.data) {
        this.integrationsData.set(integrationsRes.data);
        const meta = integrationsRes.data.integrations?.meta;
        const google = integrationsRes.data.integrations?.google;
        const wa = integrationsRes.data.integrations?.whatsapp;

        if (meta) {
          this.metaForm.patchValue({
            verify_token: meta.verify_token || '',
            app_id: meta.app_id || '',
            app_secret: meta.app_secret || '',
            access_token: meta.access_token || '',
            is_active: meta.is_active ?? true
          });
        }

        if (google) {
          this.googleForm.patchValue({
            webhook_secret: google.webhook_secret || '',
            app_id: google.app_id || '',
            app_secret: google.app_secret || '',
            is_active: google.is_active ?? true
          });
        }

        if (wa) {
          this.whatsappForm.patchValue({
            verify_token: wa.verify_token || '',
            access_token: wa.access_token || '',
            phone_number_id: wa.phone_number_id || '',
            account_id: wa.account_id || '',
            is_active: wa.is_active ?? true
          });
        }
      }
    } catch (err) {
      console.error('Failed to load integrations', err);
    }

    this.isLoading.set(false);
  }

  setTab(tab: 'company' | 'plan' | 'meta' | 'google' | 'whatsapp' | 'webhooks') {
    this.activeTab.set(tab);
  }

  saveCompanyProfile() {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.integrationService.updateCompanyProfile(this.companyForm.value).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (res.success) {
          this.showSuccess('Company business profile updated successfully!');
          this.fetchData();
        } else {
          this.showError(res.message || 'Failed to update profile');
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showError(err.error?.message || 'Error updating profile');
      }
    });
  }

  savePlanUpgrade() {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.integrationService.changePlan(this.planForm.value).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (res.success) {
          this.showSuccess('Subscription plan and user seats upgraded successfully!');
          this.fetchData();
        } else {
          this.showError(res.message || 'Failed to change plan');
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showError(err.error?.message || 'Error upgrading subscription plan');
      }
    });
  }

  saveMeta() {
    this.saveIntegration('meta', this.metaForm.value);
  }

  saveGoogle() {
    this.saveIntegration('google', this.googleForm.value);
  }

  saveWhatsapp() {
    this.saveIntegration('whatsapp', this.whatsappForm.value);
  }

  private saveIntegration(provider: 'meta' | 'google' | 'whatsapp', formValue: any) {
    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const payload = {
      provider,
      ...formValue
    };

    this.integrationService.updateIntegration(payload).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (res.success) {
          this.showSuccess(`${provider.toUpperCase()} integration settings updated successfully!`);
          this.fetchData();
        } else {
          this.showError(res.message || 'Failed to update settings');
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showError(err.error?.message || 'Error updating settings');
      }
    });
  }

  copyUrl(url: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      this.showSuccess('Webhook URL copied to clipboard!');
    }
  }

  private showSuccess(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  private showError(msg: string) {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(null), 4000);
  }
}
