import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface Permission {
  id: number;
  action: string;
  description: string;
}

export interface ModulePermission {
  module: string;
  permissions: Permission[];
}

export interface Role {
  id?: number;
  name: string;
  description: string;
  permissions: number[] | any[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getPermissions(): Observable<ApiResponse<ModulePermission[]>> {
    return this.http.get<ApiResponse<ModulePermission[]>>(`${this.apiUrl}/permissions`);
  }

  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${this.apiUrl}/roles`);
  }

  createRole(data: Role): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(`${this.apiUrl}/roles`, data);
  }

  updateRole(id: number | string, data: Role): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(`${this.apiUrl}/roles/${id}`, data);
  }

  deleteRole(id: number | string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/roles/${id}`);
  }
}
