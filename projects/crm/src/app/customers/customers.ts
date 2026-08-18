import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customers.html'
})
export class CustomersComponent {
  view = signal<'list' | 'add' | 'edit'>('list');
  
  // mock data
  customers = [
    { 
      id: 1, 
      name: 'Rajesh', 
      phone: '7503301775',
      email: 'rajeshyadav427@gmail.com',
      status: 'Active'
    }
  ];

  showList() { this.view.set('list'); }
  showAdd() { this.view.set('add'); }
  showEdit(customer: any) { this.view.set('edit'); }

  itemToDelete: any = null;

  confirmDelete(item: any) {
    this.itemToDelete = item;
  }

  deleteItem() {
    if (this.itemToDelete) {
      this.customers = this.customers.filter(c => c.id !== this.itemToDelete.id);
      this.itemToDelete = null;
    }
  }
}
