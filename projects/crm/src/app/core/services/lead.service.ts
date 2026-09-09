import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { Lead } from '../models/lead.model';
import { LeadActivity } from '../models/follow-up.model';

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
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
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

  assignLead(id: number | string, assignedTo: number): Observable<ApiResponse<Lead>> {
    return this.http.put<ApiResponse<Lead>>(`${this.apiUrl}/${id}/assign`, { assigned_to: assignedTo });
  }

  reassignHandoff(id: number | string, newUserId: number, reason?: string): Observable<ApiResponse<Lead>> {
    return this.http.put<ApiResponse<Lead>>(`${this.apiUrl}/${id}/reassign-handoff`, {
      new_user_id: newUserId,
      reason: reason
    });
  }

  getLeadActivities(id: number | string): Observable<ApiResponse<LeadActivity[]>> {
    return this.http.get<ApiResponse<LeadActivity[]>>(`${this.apiUrl}/${id}/activities`);
  }

  addLeadComment(id: number | string, comment: string, isInternal: boolean = false): Observable<ApiResponse<LeadActivity>> {
    return this.http.post<ApiResponse<LeadActivity>>(`${this.apiUrl}/${id}/comments`, {
      comment: comment,
      is_internal: isInternal
    });
  }

  processAutoAssignQueue(): Observable<ApiResponse<{ assigned_count: number }>> {
    return this.http.post<ApiResponse<{ assigned_count: number }>>(`${this.apiUrl}/auto-assign`, {});
  }

  deleteLead(id: number | string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  exportCsv(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export-csv`, { responseType: 'blob' });
  }

  downloadSampleCsv(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/sample-csv`, { responseType: 'blob' });
  }

  importCsv(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/import`, formData);
  }
}
