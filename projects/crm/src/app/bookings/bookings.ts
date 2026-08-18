import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../core/services/booking.service';
import { Booking } from '../core/models/booking.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings.html'
})
export class BookingsComponent implements OnInit {
  view = signal<'list' | 'add' | 'edit'>('list');
  bookings: Booking[] = [];
  itemToDelete: Booking | null = null;
  isLoading = false;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.bookingService.getBookings().subscribe({
      next: (res) => {
        if (res.success) {
          this.bookings = res.data || [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading bookings', err);
        this.isLoading = false;
      }
    });
  }

  showList() { this.view.set('list'); }
  showAdd() { this.view.set('add'); }
  showEdit(booking: Booking) { this.view.set('edit'); }

  confirmDelete(item: Booking) {
    this.itemToDelete = item;
  }

  deleteItem() {
    if (this.itemToDelete) {
      // Assuming delete functionality exists in service or backend later
      // this.bookingService.deleteBooking(this.itemToDelete.id).subscribe(...)
      this.bookings = this.bookings.filter(b => b.id !== this.itemToDelete?.id);
      this.itemToDelete = null;
    }
  }
}
