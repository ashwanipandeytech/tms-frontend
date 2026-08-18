import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { Package, CreatePackageDto } from '../models/package.model';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private apiUrl = `${environment.apiUrl}/packages`;

  constructor(private http: HttpClient) {}

  getPackages(params?: any): Observable<PaginatedResponse<Package>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<Package>>(this.apiUrl, { params: httpParams });
  }

  createPackage(data: CreatePackageDto): Observable<ApiResponse<Package>> {
    return this.http.post<ApiResponse<Package>>(this.apiUrl, data);
  }

  updatePackage(id: number | string, data: any): Observable<ApiResponse<Package>> {
    return this.http.put<ApiResponse<Package>>(`${this.apiUrl}/${id}`, data);
  }

  deletePackage(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
