import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Quotation, QuotationPayload, QuotationApprovalLog } from '../models/quotation.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private apiUrl = `${environment.apiUrl}/quotations`;

  constructor(private http: HttpClient) {}

  getQuotations(params: { page?: number; per_page?: number; search?: string; status?: string; approval_status?: string; lead_id?: number } = {}): Observable<ApiResponse<Quotation[]>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.approval_status) httpParams = httpParams.set('approval_status', params.approval_status);
    if (params.lead_id) httpParams = httpParams.set('lead_id', params.lead_id);

    return this.http.get<ApiResponse<Quotation[]>>(this.apiUrl, { params: httpParams });
  }

  getCounts(): Observable<{
    pending_approval: number;
    approved: number;
    drafts: number;
    sent: number;
    accepted: number;
    pipeline_value: number;
  }> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/counts`).pipe(
      map(res => res.data)
    );
  }

  getQuotation(id: number): Observable<Quotation> {
    return this.http.get<ApiResponse<Quotation>>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  createQuotation(payload: QuotationPayload): Observable<Quotation> {
    return this.http.post<ApiResponse<Quotation>>(this.apiUrl, payload).pipe(
      map(res => res.data)
    );
  }

  updateQuotation(id: number, payload: QuotationPayload): Observable<Quotation> {
    return this.http.put<ApiResponse<Quotation>>(`${this.apiUrl}/${id}`, payload).pipe(
      map(res => res.data)
    );
  }

  deleteQuotation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  submitApproval(id: number, comments?: string): Observable<Quotation> {
    return this.http.post<ApiResponse<Quotation>>(`${this.apiUrl}/${id}/submit-approval`, { comments }).pipe(
      map(res => res.data)
    );
  }

  approveQuotation(id: number, comments?: string): Observable<Quotation> {
    return this.http.post<ApiResponse<Quotation>>(`${this.apiUrl}/${id}/approve`, { comments }).pipe(
      map(res => res.data)
    );
  }

  rejectInternal(id: number, reason: string): Observable<Quotation> {
    return this.http.post<ApiResponse<Quotation>>(`${this.apiUrl}/${id}/reject-internal`, { reason }).pipe(
      map(res => res.data)
    );
  }

  getApprovalLogs(id: number): Observable<QuotationApprovalLog[]> {
    return this.http.get<ApiResponse<QuotationApprovalLog[]>>(`${this.apiUrl}/${id}/approval-logs`).pipe(
      map(res => res.data)
    );
  }

  sendQuotation(id: number): Observable<Quotation> {
    return this.http.put<ApiResponse<Quotation>>(`${this.apiUrl}/${id}/send`, {}).pipe(
      map(res => res.data)
    );
  }

  acceptQuotation(id: number): Observable<Quotation> {
    return this.http.put<ApiResponse<Quotation>>(`${this.apiUrl}/${id}/accept`, {}).pipe(
      map(res => res.data)
    );
  }

  rejectQuotation(id: number, reason?: string): Observable<Quotation> {
    return this.http.put<ApiResponse<Quotation>>(`${this.apiUrl}/${id}/reject`, { reason }).pipe(
      map(res => res.data)
    );
  }

  duplicateQuotation(id: number, mode: 'option' | 'template' = 'option'): Observable<Quotation> {
    return this.http.post<ApiResponse<Quotation>>(`${this.apiUrl}/${id}/duplicate`, { mode }).pipe(
      map(res => res.data)
    );
  }

  convertToBooking(id: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/convert`, {}).pipe(
      map(res => res.data)
    );
  }

  getPdfUrl(id: number): string {
    return `${this.apiUrl}/${id}/pdf`;
  }

  downloadPdfBlob(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
