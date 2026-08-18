import { Component, signal, resource, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataTableComponent, DataTableColumnDirective } from '../shared/components/data-table/data-table.component';
import { firstValueFrom } from 'rxjs';
import { LeadService } from '../core/services/lead.service';
import { Lead } from '../core/models/lead.model';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent, DataTableColumnDirective],
  templateUrl: './leads.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeadsComponent {
  view = signal<'list' | 'add' | 'edit'>('list');
  leadForm: FormGroup;
  leadToDelete: Lead | null = null;
  itemToEdit: Lead | null = null;

  leadsResource = resource({
    loader: () => firstValueFrom(this.leadService.getLeads())
  });

  constructor(
    private leadService: LeadService,
    private fb: FormBuilder
  ) {
    this.leadForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: ['', Validators.required],
      source: ['Website'],
      destination: [''],
      travel_date: [''],
      pax_adults: [0],
      pax_children: [0],
      budget: [0],
      status: ['New'],
      assigned_to: [null],
      notes: ['']
    });
  }

  showList() { this.view.set('list'); }
  
  showAdd() { 
    this.view.set('add'); 
    this.leadForm.reset({ source: 'Website', status: 'New', budget: 0 });
  }
  
  showEdit(lead: Lead) { 
    this.itemToEdit = lead;
    this.view.set('edit'); 
    
    // For assigned_to, we just want the ID if it's an object
    const formData = { ...lead };
    if (formData.assigned_to && typeof formData.assigned_to === 'object') {
      formData.assigned_to = (formData.assigned_to as any).id;
    }
    this.leadForm.patchValue(formData);
  }

  confirmDelete(lead: Lead) {
    this.leadToDelete = lead;
  }

  async deleteLead() {
    if (this.leadToDelete) {
      try {
        await firstValueFrom(this.leadService.deleteLead(this.leadToDelete.id));
        this.leadsResource.reload();
        this.leadToDelete = null;
      } catch (err) {
        console.error('Failed to delete lead', err);
      }
    }
  }

  async saveLead() {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }

    if (this.view() === 'add') {
      try {
        const res = await firstValueFrom(this.leadService.createLead(this.leadForm.value));
        if (res.success) {
          this.leadsResource.reload();
          this.showList();
        }
      } catch (err) {
        console.error('Failed to create lead', err);
      }
    } else if (this.view() === 'edit' && this.itemToEdit) {
      try {
        const res = await firstValueFrom(this.leadService.updateLead(this.itemToEdit.id, this.leadForm.value));
        if (res.success) {
          this.leadsResource.reload();
          this.showList();
        }
      } catch (err) {
        console.error('Failed to update lead', err);
      }
    }
  }
}
