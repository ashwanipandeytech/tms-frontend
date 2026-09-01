import { Component, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TenantService, Tenant } from '../core/services/tenant.service';
import { DataTableComponent, DataTableColumnDirective } from '../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, DataTableComponent, DataTableColumnDirective, DatePipe],
  templateUrl: './tenants.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantsComponent implements OnInit {
  tenants = signal<Tenant[]>([]);
  isLoading = signal<boolean>(true);
  expandedTenantId = signal<number | null>(null);

  constructor(private tenantService: TenantService) {}

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
    }
  }
}
