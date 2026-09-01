import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';
import { AuthService } from '../core/services/auth.service';
import { TenantService } from '../core/services/tenant.service';
import { ToastrService } from 'ngx-toastr';

interface Tenant {
  id: number;
  company_name: string;
  subdomain: string;
  status: string;
  created_at: string;
  subscription: any;
  total_employees: number;
  total_allowed_seats: number;
}

@Component({
  selector: 'app-select-tenant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-tenant.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .tenant-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.04) !important;
    }
    .tenant-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 40px rgba(79, 70, 229, 0.12) !important;
      border-color: rgba(79, 70, 229, 0.25) !important;
    }
    .tenant-card .enter-workspace-btn i {
      transition: transform 0.2s ease;
    }
    .tenant-card:hover .enter-workspace-btn i {
      transform: translateX(6px);
    }
    .bg-gradient-primary {
      background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%);
      position: relative;
      overflow: hidden;
    }
    .bg-gradient-primary::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -10%;
      width: 120%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%);
      transform: rotate(25deg);
      pointer-events: none;
    }
  `]
})
export class SelectTenantComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}`;
  tenants = signal<Tenant[]>([]);
  isLoading = signal<boolean>(true);
  
  tenantToReset = signal<Tenant | null>(null);
  isResetting = signal(false);
  isBulkResetMode = signal(false);

  constructor(
    private tenantService: TenantService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
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
      error: (err) => {
        console.error('Failed to load tenants', err);
        this.isLoading.set(false);
      }
    });
  }

  selectTenant(tenant: any) {
    this.authService.setActiveTenant(tenant.id, tenant.company_name);
    this.router.navigate(['/dashboard']);
  }

  openResetModal(tenant: any, event: Event) {
    event.stopPropagation();
    this.tenantToReset.set(tenant);
    this.isBulkResetMode.set(false);
  }

  openBulkResetModal() {
    this.tenantToReset.set(null);
    this.isBulkResetMode.set(true);
  }

  confirmReset() {
    const isBulk = this.isBulkResetMode();
    const tenant = this.tenantToReset();
    if (!isBulk && !tenant) return;

    this.isResetting.set(true);
    
    const body = isBulk ? { clear_all: true } : { id: tenant!.id };
    
    this.http.delete(`${environment.apiUrl}/admin/reset`, {
      body: body
    }).subscribe({
      next: (res: any) => {
        this.isResetting.set(false);
        const modalEl = document.getElementById('resetTenantModal');
        if (modalEl) {
          const closeBtn = modalEl.querySelector('.btn-close') as HTMLElement;
          if (closeBtn) closeBtn.click();
        }
        
        this.toastr.success(isBulk ? 'All tenant data cleared successfully!' : 'Tenant reset successfully!');
      },
      error: (err) => {
        this.isResetting.set(false);
        console.error(err);
        this.toastr.error(err.error?.message || 'Failed to reset tenant.');
      }
    });
  }
}
