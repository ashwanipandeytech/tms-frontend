import { Component, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TenantService, Tenant } from '../core/services/tenant.service';
import { CompanyIntegrationService } from '../core/services/company-integration.service';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './tenants.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantsComponent implements OnInit {
  tenants = signal<Tenant[]>([]);
  isLoading = signal<boolean>(true);
  expandedTenantId = signal<number | null>(null);
  activeTab = signal<'staff' | 'integrations'>('staff');
  savingProvider = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(
    private tenantService: TenantService,
    private integrationService: CompanyIntegrationService
  ) {}

  ngOnInit() {
    this.fetchTenants();
  }

  fetchTenants() {
    this.isLoading.set(true);
    this.tenantService.getTenants().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.tenants.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleExpand(tenantId: number) {
    if (this.expandedTenantId() === tenantId) {
      this.expandedTenantId.set(null);
    } else {
      this.expandedTenantId.set(tenantId);
      this.activeTab.set('staff');
    }
  }

  setTab(tab: 'staff' | 'integrations') {
    this.activeTab.set(tab);
  }

  saveIntegration(companyId: number, provider: 'meta' | 'google' | 'whatsapp', formValues: any) {
    this.savingProvider.set(provider);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const payload = {
      company_id: companyId,
      provider: provider,
      is_active: true,
      ...formValues
    };

    this.integrationService.updateIntegration(payload).subscribe({
      next: (res) => {
        this.savingProvider.set(null);
        if (res.success) {
          this.successMessage.set(`${provider.toUpperCase()} credentials saved successfully!`);
          this.fetchTenants();
          setTimeout(() => this.successMessage.set(null), 3000);
        } else {
          this.errorMessage.set(res.message || 'Failed to save integration settings');
        }
      },
      error: (err) => {
        this.savingProvider.set(null);
        this.errorMessage.set(err.error?.message || 'Error updating integration settings');
      }
    });
  }

  copyToClipboard(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.successMessage.set('Webhook URL copied to clipboard!');
      setTimeout(() => this.successMessage.set(null), 2500);
    }
  }
}
