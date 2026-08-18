import { Component, signal, resource, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { QuotationService } from '../core/services/quotation.service';
import { LeadService } from '../core/services/lead.service';
import { CustomerService } from '../core/services/customer.service';
import { Quotation } from '../core/models/quotation.model';
import { Lead } from '../core/models/lead.model';
import { Customer } from '../core/models/customer.model';

@Component({
  selector: 'app-quotations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quotations.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuotationsComponent {
  view = signal<'list' | 'add' | 'edit'>('list');
  quotationForm: FormGroup;
  itemToDelete: Quotation | null = null;
  itemToEdit: Quotation | null = null;

  leadsResource = resource({
    loader: () => firstValueFrom(this.leadService.getLeads())
  });

  customersResource = resource({
    loader: () => firstValueFrom(this.customerService.getCustomers())
  });

  quotationsResource = resource({
    loader: () => firstValueFrom(this.quotationService.getQuotations())
  });

  constructor(
    private quotationService: QuotationService,
    private leadService: LeadService,
    private customerService: CustomerService,
    private fb: FormBuilder
  ) {
    this.quotationForm = this.fb.group({
      quotation_no: ['', Validators.required],
      lead_id: [null],
      customer_id: [null],
      sub_total: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.min(0)]],
      gst_percentage: [5, [Validators.min(0)]],
      final_amount: [{value: 0, disabled: true}],
      valid_until: ['', Validators.required],
      status: ['Draft', Validators.required]
    });

    this.quotationForm.valueChanges.subscribe(val => {
      const subTotal = val.sub_total || 0;
      const discount = val.discount || 0;
      const gstPercent = val.gst_percentage || 0;

      const afterDiscount = Math.max(0, subTotal - discount);
      const gstAmount = afterDiscount * (gstPercent / 100);
      const finalAmt = afterDiscount + gstAmount;

      if (this.quotationForm.get('final_amount')?.value !== finalAmt) {
        this.quotationForm.get('final_amount')?.setValue(finalAmt, {emitEvent: false});
      }
    });
  }

  showList() { this.view.set('list'); }
  
  showAdd() { 
    this.view.set('add'); 
    this.quotationForm.reset({ status: 'Draft', sub_total: 0, discount: 0, gst_percentage: 5 });
  }
  
  showEdit(quotation: Quotation) { 
    this.itemToEdit = quotation;
    this.view.set('edit'); 
    
    const formData = { ...quotation };
    if (formData.lead && typeof formData.lead === 'object') formData.lead_id = (formData.lead as any).id;
    if (formData.customer && typeof formData.customer === 'object') formData.customer_id = (formData.customer as any).id;
    
    this.quotationForm.patchValue(formData);
  }

  confirmDelete(item: Quotation) {
    this.itemToDelete = item;
  }

  async deleteItem() {
    if (this.itemToDelete) {
      try {
        await firstValueFrom(this.quotationService.deleteQuotation(this.itemToDelete.id));
        this.quotationsResource.reload();
        this.itemToDelete = null;
      } catch (err) {
        console.error('Failed to delete quotation', err);
      }
    }
  }

  async saveQuotation() {
    if (this.quotationForm.invalid) {
      this.quotationForm.markAllAsTouched();
      return;
    }

    if (this.view() === 'add') {
      try {
        const payload = { ...this.quotationForm.getRawValue() };
        const res = await firstValueFrom(this.quotationService.createQuotation(payload));
        if (res.success) {
          this.quotationsResource.reload();
          this.showList();
        }
      } catch (err) {
        console.error('Failed to create quotation', err);
      }
    } else if (this.view() === 'edit' && this.itemToEdit) {
      try {
        const payload = { ...this.quotationForm.getRawValue() };
        const res = await firstValueFrom(this.quotationService.updateQuotation(this.itemToEdit.id, payload));
        if (res.success) {
          this.quotationsResource.reload();
          this.showList();
        }
      } catch (err) {
        console.error('Failed to update quotation', err);
      }
    }
  }
}
