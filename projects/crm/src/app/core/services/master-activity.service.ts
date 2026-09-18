import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MasterActivity {
  id?: number;
  company_id?: number;
  created_by?: number;
  title: string;
  destination: string;
  category?: string;
  description?: string;
  duration_minutes?: number;
  unit_cost?: number;
  inclusions?: string[];
  exclusions?: string[];
  images?: string[];
  status?: string;
  approval_status?: 'pending_approval' | 'approved' | 'rejected';
  approved_by?: number;
  source_itinerary_day_id?: number;
  creator_name?: string;
  approver_name?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MasterActivityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/master-activities`;

  getActivities(filters: { search?: string; destination?: string; category?: string; approval_status?: string; per_page?: number } = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      const val = (filters as any)[key];
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, val);
      }
    });
    return this.http.get<any>(this.apiUrl, { params });
  }

  getActivity(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createActivity(data: Partial<MasterActivity>): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateActivity(id: number, data: Partial<MasterActivity>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteActivity(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  saveFromItineraryDay(dayId: number, data: Partial<MasterActivity>): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/itinerary-days/${dayId}/save-as-master`, data);
  }

  approveActivity(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectActivity(id: number, reason?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reject`, { reason });
  }
}
