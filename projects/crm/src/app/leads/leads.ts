import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, DataTableColumnDirective } from '../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, DataTableComponent, DataTableColumnDirective],
  templateUrl: './leads.html'
})
export class LeadsComponent {
  view = signal<'list' | 'add' | 'edit'>('list');
  
  // mock data
  leads = [
    { 
      id: 1, 
      name: 'Rajesh', 
      phone: '7503301775', 
      email: 'rajesh...gmail.com', 
      source: 'Website', 
      destination: 'Uttrakhand', 
      travelDate: '2026-06-02', 
      adults: 8,
      children: 1,
      budget: 20000.00,
      assignedTo: null, 
      status: 'New',
      notes: 'want to travel n group'
    }
  ];

  showList() { this.view.set('list'); }
  showAdd() { this.view.set('add'); }
  showEdit(lead: any) { this.view.set('edit'); }

  leadToDelete: any = null;

  confirmDelete(lead: any) {
    this.leadToDelete = lead;
  }

  deleteLead() {
    if (this.leadToDelete) {
      this.leads = this.leads.filter(l => l.id !== this.leadToDelete.id);
      this.leadToDelete = null;
    }
  }
}
