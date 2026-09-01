import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';
import { AuthService } from '../core/services/auth.service';

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
      border: 2px solid transparent;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
    }
    .tenant-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
      border-color: #4f46e5;
    }
    .bg-gradient-primary {
      background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
    }
  `]
})
export class SelectTenantComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}`;
  tenants = signal<Tenant[]>([]);
  isLoading = signal<boolean>(true);

  constructor(
    private http: HttpClient, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.fetchTenants();
  }

  fetchTenants() {
    this.isLoading.set(true);
    this.http.get<ApiResponse<Tenant[]>>(`${this.apiUrl}/admin/tenants?per_page=100`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.tenants.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  selectTenant(tenant: Tenant) {
    this.authService.setActiveTenant(tenant.id);
    this.router.navigate(['/dashboard']);
  }
}
