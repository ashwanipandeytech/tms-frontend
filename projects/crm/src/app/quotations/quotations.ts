import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quotations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quotations.html'
})
export class QuotationsComponent {
  view = signal<'list' | 'add' | 'edit'>('list');
  
  // mock data
  quotations = [
    { 
      id: 1, 
      quotationNo: '001', 
      lead: 'Rajesh', 
      customer: null,
      package: '3 Nigth 2 Days', 
      subTotal: '35000.00',
      discount: '1000.00',
      gst: null,
      finalAmount: null,
      validTill: '2026-06-18',
      status: 'Accepted'
    }
  ];

  showList() { this.view.set('list'); }
  showAdd() { this.view.set('add'); }
  showEdit(quotation: any) { this.view.set('edit'); }

  itemToDelete: any = null;

  confirmDelete(item: any) {
    this.itemToDelete = item;
  }

  deleteItem() {
    if (this.itemToDelete) {
      this.quotations = this.quotations.filter(q => q.id !== this.itemToDelete.id);
      this.itemToDelete = null;
    }
  }
}
