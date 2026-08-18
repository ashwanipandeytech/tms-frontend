import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { Lead } from '../models/lead.model';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private apiUrl = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) {}

  getLeads(params?: any): Observable<PaginatedResponse<Lead>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<Lead>>(this.apiUrl, { params: httpParams });
  }

  getLead(id: number | string): Observable<ApiResponse<Lead>> {
    return this.http.get<ApiResponse<Lead>>(`${this.apiUrl}/${id}`);
  }

  createLead(data: any): Observable<ApiResponse<Lead>> {
    return this.http.post<ApiResponse<Lead>>(this.apiUrl, data);
  }

  updateLead(id: number | string, data: any): Observable<ApiResponse<Lead>> {
    return this.http.put<ApiResponse<Lead>>(`${this.apiUrl}/${id}`, data);
  }

  deleteLead(id: number | string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
