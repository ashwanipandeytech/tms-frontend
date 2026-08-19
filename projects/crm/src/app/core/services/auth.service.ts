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

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.success && res.data?.token) {
          localStorage.setItem('authToken', res.data.token);
        }
      })
    );
  }

  logout(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('authToken');
      })
    );
  }

  getMe(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
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

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('authToken');
    }
    return null;
  }
}
