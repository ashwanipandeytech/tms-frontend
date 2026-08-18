import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { FollowUp, CreateFollowUpDto } from '../models/follow-up.model';

@Injectable({
  providedIn: 'root'
})
export class FollowUpService {
  private apiUrl = `${environment.apiUrl}/follow-ups`;

  constructor(private http: HttpClient) {}

  getFollowUps(params?: any): Observable<PaginatedResponse<FollowUp>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<FollowUp>>(this.apiUrl, { params: httpParams });
  }

  createFollowUp(data: CreateFollowUpDto): Observable<ApiResponse<FollowUp>> {
    return this.http.post<ApiResponse<FollowUp>>(this.apiUrl, data);
  }

  updateFollowUp(id: number | string, data: any): Observable<ApiResponse<FollowUp>> {
    return this.http.put<ApiResponse<FollowUp>>(`${this.apiUrl}/${id}`, data);
  }

  deleteFollowUp(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
