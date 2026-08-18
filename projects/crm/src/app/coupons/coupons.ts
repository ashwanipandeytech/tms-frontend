import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './coupons.html'
})
export class CouponsComponent {
  view = signal<'list' | 'add' | 'edit'>('list');
  
  // mock data
  coupons = [
    { 
      id: 1, 
      code: 'sadfaf', 
      type: 'Percentage', 
      value: '345245.00',
      expiry: '2026-08-19', 
      usageLimit: '45',
      status: 'Active'
    }
  ];

  showList() { this.view.set('list'); }
  showAdd() { this.view.set('add'); }
  showEdit(coupon: any) { this.view.set('edit'); }

  itemToDelete: any = null;

  confirmDelete(item: any) {
    this.itemToDelete = item;
  }

  deleteItem() {
    if (this.itemToDelete) {
      this.coupons = this.coupons.filter(c => c.id !== this.itemToDelete.id);
      this.itemToDelete = null;
    }
  }
}
