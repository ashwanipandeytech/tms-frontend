import { Component, signal, resource, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { BookingService } from '../core/services/booking.service';
import { PaymentService } from '../core/services/payment.service';
import { Booking } from '../core/models/booking.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bookings.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingsComponent {
  view = signal<'list' | 'add' | 'edit'>('list');
  bookingForm: FormGroup;
  itemToDelete: Booking | null = null;
  itemToEdit: Booking | null = null;
  paymentModalBooking: Booking | null = null;
  paymentForm: FormGroup;

  bookingsResource = resource({
    loader: () => firstValueFrom(this.bookingService.getBookings())
  });

  constructor(
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      booking_no: ['', Validators.required],
      lead_id: [null],
      customer_id: [null],
      package_id: [null],
      total_amount: [0, [Validators.required, Validators.min(1)]],
      paid_amount: [0],
      status: ['Pending', Validators.required]
    });

    this.paymentForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1)]],
      payment_mode: ['Bank Transfer', Validators.required],
      transaction_id: ['', Validators.required],
      payment_date: ['', Validators.required]
    });
  }

  showList() { this.view.set('list'); }
  
  showAdd() { 
    this.view.set('add'); 
    this.bookingForm.reset({ status: 'Pending', total_amount: 0, paid_amount: 0 });
  }
  
  showEdit(booking: Booking) { 
    this.itemToEdit = booking;
    this.view.set('edit'); 
    
    // Convert object references to IDs for patchValue
    const formData = { ...booking };
    if (formData.lead && typeof formData.lead === 'object') formData.lead_id = (formData.lead as any).id;
    if (formData.customer && typeof formData.customer === 'object') formData.customer_id = (formData.customer as any).id;
    if (formData.package && typeof formData.package === 'object') formData.package_id = (formData.package as any).id;
    
    this.bookingForm.patchValue(formData);
  }

  confirmDelete(item: Booking) {
    this.itemToDelete = item;
  }

  async deleteItem() {
    if (this.itemToDelete) {
      try {
        await firstValueFrom(this.bookingService.deleteBooking(this.itemToDelete.id));
        this.bookingsResource.reload();
        this.itemToDelete = null;
      } catch (err) {
        console.error('Failed to delete booking', err);
      }
    }
  }

  async saveBooking() {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    if (this.view() === 'add') {
      try {
        const res = await firstValueFrom(this.bookingService.createBooking(this.bookingForm.value));
        if (res.success) {
          this.bookingsResource.reload();
          this.showList();
        }
      } catch (err) {
        console.error('Failed to create booking', err);
      }
    } else if (this.view() === 'edit' && this.itemToEdit) {
      try {
        const res = await firstValueFrom(this.bookingService.updateBooking(this.itemToEdit.id, this.bookingForm.value));
        if (res.success) {
          this.bookingsResource.reload();
          this.showList();
        }
      } catch (err) {
        console.error('Failed to update booking', err);
      }
    }
  }

  openPaymentModal(booking: Booking) {
    this.paymentModalBooking = booking;
    const due = Number(booking.total_amount) - Number(booking.paid_amount || 0);
    this.paymentForm.patchValue({
      amount: due,
      payment_mode: 'Bank Transfer',
      payment_date: new Date().toISOString().split('T')[0]
    });
  }

  async recordPayment() {
    if (this.paymentForm.invalid || !this.paymentModalBooking) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const payload = {
      booking_id: this.paymentModalBooking.id,
      ...this.paymentForm.value
    };

    try {
      const res = await firstValueFrom(this.paymentService.recordPayment(payload));
      if (res.success) {
        this.bookingsResource.reload();
        this.paymentModalBooking = null;
      }
    } catch (err) {
      console.error('Failed to record payment', err);
    }
  }
}
