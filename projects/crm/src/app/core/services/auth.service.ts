import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { LoginResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  
  // Expose current user as a Signal
  public currentUser = signal<User | null>(null);
  public activeTenantId = signal<number | null>(null);
  public activeTenantName = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.success && res.data?.token) {
          localStorage.setItem('authToken', res.data.token);
          if (res.data.user) {
            this.currentUser.set(res.data.user);
          }
          if (res.data.user?.role?.permissions) {
            localStorage.setItem('userPermissions', JSON.stringify(res.data.user.role.permissions));
          }
          
          const storedTenant = localStorage.getItem('activeTenantId');
          if (storedTenant) {
            this.activeTenantId.set(parseInt(storedTenant, 10));
          }
        }
      })
    );
  }

  logout(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.clear();
        this.currentUser.set(null);
        this.activeTenantId.set(null);
      })
    );
  }

  getMe(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
          if (res.data.role?.permissions) {
            localStorage.setItem('userPermissions', JSON.stringify(res.data.role.permissions));
          }
          
          const storedTenant = localStorage.getItem('activeTenantId');
          if (storedTenant) {
            this.activeTenantId.set(parseInt(storedTenant, 10));
          }
        }
      })
    );
  }

  hasRole(roleName: string): boolean {
    const user = this.currentUser();
    if (!user || !user.role) return false;
    // Super Admin has all access
    if (user.role.name.toLowerCase() === 'super admin') return true;
    return user.role.name.toLowerCase() === roleName.toLowerCase();
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    if (!user || !user.role) return false;
    if (user.role.name.toLowerCase() === 'super admin') return true;
    const userRole = user.role.name.toLowerCase();
    return roles.some(r => r.toLowerCase() === userRole);
  }

  getPermissions(): string[] {
    // Read the signal first to ensure Angular tracks the dependency
    const user = this.currentUser();
    if (user?.role?.permissions) return user.role.permissions;

    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('userPermissions');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  }

  hasPermission(permission: string): boolean {
    if (this.hasRole('Super Admin')) return true;
    const perms = this.getPermissions();
    return perms.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    if (this.hasRole('Super Admin')) return true;
    const perms = this.getPermissions();
    return permissions.some(p => perms.includes(p));
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  setActiveTenant(tenantId: number, tenantName?: string) {
    this.activeTenantId.set(tenantId);
    if (tenantName) {
      this.activeTenantName.set(tenantName);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('activeTenantId', tenantId.toString());
      if (tenantName) {
        localStorage.setItem('activeTenantName', tenantName);
      }
    }
  }

  getActiveTenant(): number | null {
    // Read the signal first to ensure Angular tracks the dependency
    const signalVal = this.activeTenantId();
    if (signalVal !== null) return signalVal;

    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('activeTenantId');
      if (stored) return parseInt(stored, 10);
    }
    return null;
  }

  getActiveTenantName(): string | null {
    // Read the signal first to ensure Angular tracks the dependency
    const signalVal = this.activeTenantName();
    if (signalVal !== null) return signalVal;

    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('activeTenantName');
      if (stored) return stored;
    }
    return null;
  }
}
