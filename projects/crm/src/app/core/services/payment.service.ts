import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Payment, CreatePaymentDto } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  recordPayment(paymentData: CreatePaymentDto): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(this.apiUrl, paymentData);
  }
}
