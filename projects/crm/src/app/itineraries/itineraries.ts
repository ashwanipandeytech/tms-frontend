import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-itineraries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './itineraries.html'
})
export class ItinerariesComponent {
  view = signal<'list' | 'add' | 'edit'>('list');
  
  // mock data
  itineraries = [
    { 
      id: 1, 
      title: 'DELHI TO UTTRAKAHAND', 
      quotation: '001', 
      package: null
    }
  ];

  showList() { this.view.set('list'); }
  showAdd() { this.view.set('add'); }
  showEdit(itinerary: any) { this.view.set('edit'); }

  itemToDelete: any = null;

  confirmDelete(item: any) {
    this.itemToDelete = item;
  }

  deleteItem() {
    if (this.itemToDelete) {
      this.itineraries = this.itineraries.filter(i => i.id !== this.itemToDelete.id);
      this.itemToDelete = null;
    }
  }
}
