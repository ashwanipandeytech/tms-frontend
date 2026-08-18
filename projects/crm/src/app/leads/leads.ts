import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataTableComponent, DataTableColumnDirective } from '../shared/components/data-table/data-table.component';
import { LeadService } from '../core/services/lead.service';
import { Lead } from '../core/models/lead.model';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, DataTableComponent, DataTableColumnDirective, ReactiveFormsModule],
  templateUrl: './leads.html'
})
export class LeadsComponent implements OnInit {
  view = signal<'list' | 'add' | 'edit'>('list');
  leads: Lead[] = [];
  leadForm: FormGroup;
  leadToDelete: Lead | null = null;
  isLoading = false;

  constructor(
    private leadService: LeadService,
    private fb: FormBuilder
  ) {
    this.leadForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: [''],
      destination: [''],
      travel_date: [''],
      pax_adults: [0],
      pax_children: [0],
      budget: [0],
      source_id: [1],
      status: ['new'],
      assigned_to: [null],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.isLoading = true;
    this.leadService.getLeads().subscribe({
      next: (res) => {
        if (res.success) {
          this.leads = res.data || [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading leads', err);
        this.isLoading = false;
      }
    });
  }

  showList() { this.view.set('list'); }
  showAdd() { 
    this.view.set('add'); 
    this.leadForm.reset({ status: 'new', source_id: 1, pax_adults: 0, pax_children: 0, budget: 0 });
  }
  showEdit(lead: Lead) { 
    this.view.set('edit'); 
    this.leadForm.patchValue(lead);
  }

  confirmDelete(lead: Lead) {
    this.leadToDelete = lead;
  }

  deleteLead() {
    if (this.leadToDelete) {
      this.leadService.deleteLead(this.leadToDelete.id).subscribe({
        next: (res) => {
          this.loadLeads();
          this.leadToDelete = null;
        },
        error: (err) => {
          console.error('Failed to delete lead', err);
        }
      });
    }
  }

  saveLead() {
    if (this.leadForm.invalid) return;

    if (this.view() === 'add') {
      this.leadService.createLead(this.leadForm.value).subscribe({
        next: (res) => {
          this.loadLeads();
        }
      });
    } else if (this.view() === 'edit') {
      // Assuming lead id is available when editing
      // You'd normally store the ID of the lead being edited
    }
  }
}
