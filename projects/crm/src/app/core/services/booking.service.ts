import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { Booking, CreateBookingDto } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  getBookings(params?: any): Observable<PaginatedResponse<Booking>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<Booking>>(this.apiUrl, { params: httpParams });
  }

  createBooking(data: CreateBookingDto): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(this.apiUrl, data);
  }

  updateBooking(id: number | string, data: any): Observable<ApiResponse<Booking>> {
    return this.http.put<ApiResponse<Booking>>(`${this.apiUrl}/${id}`, data);
  }

  deleteBooking(id: number | string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
