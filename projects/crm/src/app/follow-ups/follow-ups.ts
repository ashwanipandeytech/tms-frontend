import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-follow-ups',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './follow-ups.html'
})
export class FollowUpsComponent {
  view = signal<'list' | 'add' | 'edit'>('list');
  
  // mock data
  followUps = [
    { 
      id: 1, 
      lead: 'Rajesh', 
      date: '2026-06-17', 
      time: '13:22',
      type: 'Call', 
      remarks: 'intresed',
      status: 'Done'
    }
  ];

  showList() { this.view.set('list'); }
  showAdd() { this.view.set('add'); }
  showEdit(followUp: any) { this.view.set('edit'); }

  itemToDelete: any = null;

  confirmDelete(item: any) {
    this.itemToDelete = item;
  }

  deleteItem() {
    if (this.itemToDelete) {
      this.followUps = this.followUps.filter(f => f.id !== this.itemToDelete.id);
      this.itemToDelete = null;
    }
  }
}
