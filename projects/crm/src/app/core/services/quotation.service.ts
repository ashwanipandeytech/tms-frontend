import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { Quotation, CreateQuotationDto } from '../models/quotation.model';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private apiUrl = `${environment.apiUrl}/quotations`;

  constructor(private http: HttpClient) {}

  getQuotations(params?: any): Observable<PaginatedResponse<Quotation>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<Quotation>>(this.apiUrl, { params: httpParams });
  }

  createQuotation(data: CreateQuotationDto): Observable<ApiResponse<Quotation>> {
    return this.http.post<ApiResponse<Quotation>>(this.apiUrl, data);
  }

  updateQuotation(id: number | string, data: any): Observable<ApiResponse<Quotation>> {
    return this.http.put<ApiResponse<Quotation>>(`${this.apiUrl}/${id}`, data);
  }

  deleteQuotation(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
