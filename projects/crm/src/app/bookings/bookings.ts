import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings.html'
})
export class BookingsComponent {
  view = signal<'list' | 'add' | 'edit'>('list');
  
  // mock data
  bookings = [
    { 
      id: 1, 
      bookingNo: 'B001', 
      customer: 'Rajesh',
      lead: 'Rajesh',
      package: '3 Nigth 2 Days', 
      travelDate: '2026-06-18',
      total: '35000.00',
      paid: '5000.00',
      due: '30000.00',
      status: 'Confirmed'
    }
  ];

  showList() { this.view.set('list'); }
  showAdd() { this.view.set('add'); }
  showEdit(booking: any) { this.view.set('edit'); }

  itemToDelete: any = null;

  confirmDelete(item: any) {
    this.itemToDelete = item;
  }

  deleteItem() {
    if (this.itemToDelete) {
      this.bookings = this.bookings.filter(b => b.id !== this.itemToDelete.id);
      this.itemToDelete = null;
    }
  }
}
