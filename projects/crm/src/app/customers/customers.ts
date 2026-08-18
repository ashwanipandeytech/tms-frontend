import { Component, signal, resource, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CustomerService } from '../core/services/customer.service';
import { Customer } from '../core/models/customer.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customers.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent {
  view = signal<'list' | 'add' | 'edit'>('list');
  customerForm: FormGroup;
  itemToDelete: Customer | null = null;
  itemToEdit: Customer | null = null;

  // Replaces the customers array and loadCustomers() method
  customersResource = resource({
    loader: () => firstValueFrom(this.customerService.getCustomers())
  });

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder
  ) {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: [''],
      type: ['B2C', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  showList() { this.view.set('list'); }
  
  showAdd() { 
    this.view.set('add'); 
    this.customerForm.reset({ type: 'B2C', status: 'Active' });
  }
  
  showEdit(customer: Customer) { 
    this.itemToEdit = customer;
    this.view.set('edit'); 
    this.customerForm.patchValue(customer);
  }

  confirmDelete(item: Customer) {
    this.itemToDelete = item;
  }

  async deleteItem() {
    if (this.itemToDelete) {
      try {
        await firstValueFrom(this.customerService.deleteCustomer(this.itemToDelete.id));
        this.customersResource.reload();
        this.itemToDelete = null;
      } catch (err) {
        console.error('Failed to delete customer', err);
      }
    }
  }

  async saveCustomer() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    if (this.view() === 'add') {
      try {
        const res = await firstValueFrom(this.customerService.createCustomer(this.customerForm.value));
        if (res.success) {
          this.customersResource.reload();
          this.showList();
        }
      } catch (err) {
        console.error('Failed to create customer', err);
      }
    } else if (this.view() === 'edit' && this.itemToEdit) {
      try {
        const res = await firstValueFrom(this.customerService.updateCustomer(this.itemToEdit.id, this.customerForm.value));
        if (res.success) {
          this.customersResource.reload();
          this.showList();
        }
      } catch (err) {
        console.error('Failed to update customer', err);
      }
    }
  }
}
